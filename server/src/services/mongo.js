
const mongoose = require("mongoose");
require('dotenv').config();

const MONGO_URL =  process.env.MONGO_URL;

const connect = async () => {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to mongo")
}

const disconnect = async () => {
    await mongoose.disconnect();
    console.log("Disconnected to mongo")
}


module.exports = {
    connect,
    disconnect
}