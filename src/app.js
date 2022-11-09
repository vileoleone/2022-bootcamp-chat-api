import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config()

const app = express()
app.use(cors());
app.use(express.json());
const MongoClient = new MongoClient(process.env.MONGO_URI)
let db;

app.listen(5000, () => "running in port 5000")

MongoClient.connect().then(() => {
    db = mongoClient.db("")
})
    .catch(() => console.log())

app.get("/", (req, res) => {
    db.collection("").toArray().find().then(() => {

    }).catch(() => console.log())
})