import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
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
    if (!name || name === "" || typeof name !== "string") {
        res.sendStatus(422)
        return
    }

    participants.insertOne(toAdd).then(() => {
        console.log(toAdd)
        res.sendStatus(201);
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