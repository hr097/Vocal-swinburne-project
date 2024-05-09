const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/UsersModel");
const {drive}= require("../middlewares/GoogleDriveAPI");
const fs = require("fs");

//------------------------ Register user ------------------------
const register = async (req, res) => {
    try {
        const { name, phone_no, password, email, visibility } = req.body;

        if (!name || !phone_no || !password || !email) {
            return res.status(404).json({
            message: "Please Provide all data!",
            app_status: false,
            });
        }

        if (!req.file) {
            return res.status(400).json({
            message: "Please provide profile photo!",
            app_status: false,
            });
        }

        // check if phone_no is already registered
        const phoneAvailable = await Users.findOne({ phone_no });
        if (phoneAvailable) {
            return res.status(403).json({
                message: "Mobile already exists!",
                app_status: false,
            });
        }

        // check if email is already registered
        const emailAvailable = await Users.findOne({ email });
        if (emailAvailable) {
            return res.status(403).json({
                message: "Email already exists!",
                app_status: false,
            });
        }

        // hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // JWT token
        const accesstoken = jwt.sign(
        {
            phone_no,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "365d" }
        );

        
        // uploading image in drive
        let driveFileId;
        if(req.file){
            try{
                const imageFileName = `image_${Date.now()}.png`;

                const fileMetadata = {
                    name: imageFileName,
                    parents: ['1dKn9vcQz2gCDEkQWelfOnAEM67lM5oqY'],
                };

                const media = {
                    mimeType: 'image/png',
                    body: fs.createReadStream(req.file.path),
                };

                const uploadedFile = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id',
                });
                
                driveFileId = uploadedFile.data.id;
                
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error('Error deleting local file:', err);
                    }
                });
            }catch(err){
                return res.status(500).json({
                    message: "Error uploading profile photo",
                    app_status: false,
                });
            }
    }

        // insert new User
        const newUser = await Users.create({
            name,
            phone_no,
            profile_photo: driveFileId,
            email,
            password: hashedPassword,
            visibility,
            access_token: accesstoken,
        });

        if (newUser) {
            const result = {
                name: newUser.name,
                phone_no: newUser.phone_no,
                email: newUser.email,
                message: "User registered successfully!",
                app_status: true,
            };
            return res.status(200).json(result);
        } 
        else {
            return res.status(400).json({
                message: "Unable to register user!",
                app_status: false,
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            app_status: false,
        });
    }
};

//------------------------ Login user ------------------------

const login = async (req, res) => {
    try {
        const { email, phone_no, password } = req.body;
        const user = await Users.findOne({ $or: [{ email }, { phone_no }] });

        if (!email && !phone_no) {
        return res.status(400).json({
            message: "Please provide credentials!",
            app_status: false,
        });
        }

        if (!password) {
        return res.status(404).json({
            message: "Please provide password!",
            app_status: false,
        });
        }

        // Checking user Availability
        if (!user) {
        return res.status(404).json({
            message: "Invalid credentials!",
            app_status: false,
        });
        }

        // Validating password
        const isValidPsd = await bcrypt.compare(password, user.password);
        if (!isValidPsd) {
        return res.status(401).json({
            message: "Invalid Password!",
            app_status: false,
        });
        }

        // JWT token
        const token = jwt.sign(
        {
            userId: user._id,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "365d" }
        );

        // res.cookie("token", token, { maxAge: 900000, httpOnly: true });

        res.setHeader("Authorization",token);
        return res.status(200).json({
        message: "User logged in successfully!",
        Token: token,
        app_status: true,
        });
    } 
    catch (err) {
        return res.status(500).json({
        message: err.message,
        app_status: false,
        });
    }
};

module.exports = { register, login };
