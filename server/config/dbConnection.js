const mongoose = require("mongoose");

const dbConnection = async () => {
    try {
        const connect=await mongoose.connect(process.env.CONN_MONGODB_URI);
    } catch (err) {
        console.log("DB connection error:", err);
    }
};

module.exports = dbConnection;
