const Users = require("../models/UsersModel");
const Room = require("../models/RoomModel");
const Messages = require("../models/MessageModel");
const moment = require("moment-timezone");
const {drive}= require("../middlewares/GoogleDriveAPI");

const FetchSelectedUser = async (req, res) => {
    try {
        const { selectedUser } = req.body;

        const userId = req.user.userId;

        //Finding in  how many rooms our user is enrolled
        const room = await Room.findOne({
            participants: { $all: [userId, selectedUser] },
        });

        if (!room) {
        return res.status(404).json({
            message: "Room not found for the selected users",
            app_status: false,
        });
        }

        // Find the other participant's user details
        const otherParticipantId = room.participants.find(
            (participantId) => participantId.toString() !== userId.toString()
        );

        if (!otherParticipantId) {
            return res.status(404).json({
                message: "Other participant not found in the room",
                app_status: false,
            });
        }

        const user = await Users.findById(otherParticipantId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                app_status: false,
            });
        }

        res.status(200).json({
            id: user._id,
            roomId: room._id,
            senderId: userId,
            name: user.name,
            phone_no: user.phone_no,
            photo: user.profile_photo,
        });
    } 
    catch (err) {
        return res.status(500).json({
            message: err.message,
            app_status: false,
        });
    }
    };

const FetchChatData = async (req, res) => {
        try {
            const { roomId } = req.body;
            const room = await Messages.find({ roomId });
            //Finding user time-zone
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const messageList = room.map((message) => ({
                sender: message.sender,
                receiver: message.receiver,
                message: message.content,
                time: moment(message.createdAt).tz(userTimeZone).format("h:mm A"),
                contentType:message.contentType
            }));

            //sending response
            res.status(200).json(messageList);
        } 
        catch (err) {
            return res.status(500).json({
                message: err.message,
                app_status: false,
            });
        }
};

const DeleteChatData=async (req,res)=>{
    try{
        const { roomId } = req.body;
        const chatImages=await Messages.find({roomId, content: { $exists: true } ,contentType: "image" }).select('-_id content');;
        for (const chatImage of chatImages) {
            const fileId = chatImage.content;
            //Google Drive API to delete the file
            await drive.files.delete({ fileId });
        }
        const chatRoom=await Messages.deleteMany({roomId});
        if(chatRoom){
            return res.status(200).json({
                message:"Data deleted Successfully",
                app_status:true
            });
        }else{
            return res.status(403).json({
                message:"Something went wrong!",
                app_status:false
            });
        }
    }catch(err){
        return res.status(500).json({
            message: err.message,
            app_status: false,
        });
    }
}

module.exports = { FetchChatData, FetchSelectedUser,DeleteChatData };
