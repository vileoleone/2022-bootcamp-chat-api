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

    // validations

    // Is the name present in de database?

    participants.find({}).toArray().then((obj) => {
        const isNameUsed = obj.find((item)=> item.name === name)

         if (isNameUsed) {
            res.sendStatus(409)
            return
        } 
    })

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
        .catch((err) => {
            console.log(err)
        })
})

/* app.get("/", (req, res) => {
    db.collection("").toArray().find().then(() => {

    }).catch(() => console.log())
})  */


app.listen(5000, () => console.log("running in port 5000"))