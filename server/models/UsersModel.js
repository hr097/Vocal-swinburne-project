const mongoose = require('mongoose');

//Schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name!"],
        trim:true
    },
    phone_no:{
        type:Number,
        required:[true,"Please provide a phone number!"],
        unique:[true,"Provided phone number already registered!"],
        lowercase:true,
        trim:true,
        validate: {
            validator: (value)=> {
                return /^[0-9]{10}/.test(value);
            },
            message: '{VALUE} is not a valid 10 digit number!'
        }
    },
    profile_photo:{
        type: String,
        required:[true,"Please provide a profile photo!"],
    },
    email:{
        type:String,
        required:[true,"Please provide a email address!"],
        unique:[true,"Provided email address already registered!"],
        lowercase:true,
        trim:true,
        validate: {
            validator: (value)=> {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: '{VALUE} is not a valid email address!'
        }
    },
    password:{
        type:String,
        required:[true,"Please provide a password!"],
        trim:true,
    },
    visibility:{
        type:String,
        enum:['public', 'private'],
        default:['public']
    },
    access_token:{
        type:String,
        default:"-"
    }
},{
    timestamps:true

});

//Model
const Users=mongoose.model('User',userSchema);

module.exports = Users;
