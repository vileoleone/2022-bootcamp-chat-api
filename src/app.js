import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

//initial variables setup for back-end server

const app = express()
app.use(cors());
app.use(express.json());
dotenv.config()

app.listen(5000, () => console.log("running in port 5000"))

//setup for MongoDB server

const MongoClient = new MongoClient(process.env.MONGO_URI)
let db;
let participants;
let messages;

MongoClient.connect().then(() => {
    db = MongoClient.db("uolMockServer")
    participants = db.collections("uolMockServerParticipants")
    messages = db.collections("uolMockServerMessages")
})
    .catch((err) => {
    console.log(err)
    })

// JSON for participants

/* { name: 'João', lastStatus: 12313123 }  */

// JSON for messages

/* {from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'} */


/* app.get("/", (req, res) => {
    db.collection("").toArray().find().then(() => {

    }).catch(() => console.log())
})  */