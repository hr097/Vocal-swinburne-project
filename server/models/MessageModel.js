const mongoose = require('mongoose');

//Schema
const messasgeSchema = mongoose.Schema({
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Rooms",
        required: true,
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    content: {
        type:mongoose.Schema.Types.Mixed,
        lowercase:true,
        trim:true,
    },
    contentType:{
        type: String,
        enum: ["text", "image"],
        required: true,
    }
},{
    timestamps:true
});

//Model
const Messages=mongoose.model('Messages',messasgeSchema);

module.exports = Messages;
