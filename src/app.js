import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import Joi from "joi"
import dayjs from "dayjs"

//setup for extenal dependencies used in this project

dotenv.config();

//initial variables setup for back-end server

const app = express()
app.use(cors());
app.use(express.json());

//setup for MongoDB server

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
let participants;
let messages;

mongoClient.connect().then(() => {
    db = mongoClient.db("uolMockServer")
    participants = db.collection("uolMockServerParticipants")
    messages = db.collection("uolMockServerMessages")
})
    .catch((err) => {
        console.log(err)
    })

/* // JSON for participants
{ name: 'João', lastStatus: 12313123 }  

// JSON for messages
{from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'} 
 */

app.post("/participants", (req, res) => {

    const { name } = req.body;
    const toAdd = {
        name,
        lastStatus: Date.now()
    }

    // validations for name

    // Validations using JOI

    const schema = Joi.string().min(2).max(10).required()

    const { error, value } = schema.validate(name);

    if (error !== undefined) {
        res.status(422).json({
            message: 'Invalid request',
            data: name
        })
        return
    }

    // Is the name present in de database? If not then proceed with post

    participants.find({}).toArray().then((obj) => {
        const isNameUsed = obj.find((item) => item.name === name)
        let result;
        if (isNameUsed) {
            res.sendStatus(409)
            return
        }

        else {
            // inserting in mongodB's collection uolMockServerParticipants and login message in uolMockServerMessages

            participants.insertOne(toAdd).then(() => {

                let now = dayjs()

                const loginMessage = { from: `${name}`, to: 'Todos', text: 'entra na sala...', type: 'status', time: `${now.format('HH:mm:ss')}` }

                messages.insertOne(loginMessage).then(() => {
                    res.sendStatus(201)
                })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        }

    })

})

app.get("/participants", (req, res) => {
    participants.find({}).toArray().then((obj) => {
        res.send(obj)
    })
})

app.post("/messages", async (req, res) => {
    try {

        //Setup for variables

        let now = dayjs()
        const { to, text, type } = req.body
        const { user } = req.headers


        // validation of user in Databank

        const validateUser = await participants.findOne({ name: user })
        
        if (!validateUser) {
            res.status(404).send("Usuário não Encontrado")
            return
        } 
    
        // validation with JOI

        const schema = Joi.object().keys({
            from: Joi.string()
                .min(1)
                .required(),

            to: Joi.string()
                .min(1)
                .required(),

            text: Joi.string()
                .min(1)
                .required(),

            type: Joi.string()
                .min(1)
                .required()
                .valid('message', 'private_message'),

            time: Joi.any()

        });

        //Declaring object to be sent to database

        const messageUnit = {
            from: user,
            to,
            text,
            type,
            time: `${now.format('HH:mm:ss')}`
        }

        // validating with JOI

        const { error, value } = await schema.validate(messageUnit)

        if (error) {
            res.status(422).send(error.message)
            return
        }

        //Sendind to database

        await messages.insertOne(messageUnit);
        res.sendStatus(201);

    }

    catch (error) {
        console.log(error)
    }
})

app.get("/messages", async (req, res) => {

    const limit = parseInt(req.query.limit)
    const arrayOfMessages = await messages.find({}).toArray()
    const userLogged = req.headers

    // filtrando as mensagens públicas e private messages direcionadas para o user

    arrayOfMessages.filter((message) => {
        if (message.from === userLogged || message.to === userLogged || message.type === "message") {
            return true
        }

    // message.type === "private_message" && message.to !== userLogged
        else {return false}
    })


    if (limit) {

        try {
            const arrayToSend = arrayOfMessages.slice(-limit)
            res.send(arrayToSend)
            return
        }

        catch (error) {
            res.sendStatus(400)
            return
        }
    }

    res.send(arrayOfMessages)
})


app.listen(5000, () => console.log("running in port 5000"))