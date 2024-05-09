const mongoose = require("mongoose");

//Schema
const roomSchema = new mongoose.Schema(
    {
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
            ref: "Users",
        },
    },
    { timestamps: true }
);

//Model
const Rooms = mongoose.model("Rooms", roomSchema);

module.exports = Rooms;
