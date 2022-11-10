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

                console.log("entrou no participants")

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
        let now = dayjs()
        const { to, text, type } = req.body
        const { user } = req.headers

        const messageUnit = {
            from: user,
            to,
            text,
            type,
            time: `${now.format('HH:mm:ss')}`
        }

        await messages.insertOne(messageUnit);
        res.sendStatus(201);

    }
    
    catch (error) {
        console.log(error)
    }
})


app.listen(5000, () => console.log("running in port 5000"))