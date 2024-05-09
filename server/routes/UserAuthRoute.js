const express = require("express");
const routes = express.Router();
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('../uploads', express.static('uploads'));


//---------------------------- Middlewares ----------------------------
const {upload,errorHandler} = require("../middlewares/FileUploadMidware");


//---------------------------- Controllers ----------------------------
const { register, login } = require("../controllers/UserAuthController");


//---------------------------- Routes ----------------------------
routes.post("/login", login);
routes.post("/register",upload.single("profile_photo"),errorHandler, register);


module.exports = routes;
