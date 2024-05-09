const express = require("express");
const routes = express.Router();

//---------------------------- Middlewares ----------------------------
const authenticateToken = require("../middlewares/Authorization");
const {upload,errorHandler} = require("../middlewares/FileUploadMidware");


//---------------------------- Controllers ----------------------------
const {AddUser,ListUsers,LoggedinUserInfo}  = require("../controllers/AddUsers");
const {FetchChatData,FetchSelectedUser,DeleteChatData}  = require("../controllers/FetchChatData");
const {UploadImage} =require("../controllers/UploadImage");

//---------------------------- Routes ----------------------------
routes.post("/AddUsers",authenticateToken, AddUser);
routes.get("/ListUsers",authenticateToken, ListUsers);
routes.post("/loggedinuserinfo",authenticateToken, LoggedinUserInfo);


routes.post("/fetchchatdata",authenticateToken, FetchChatData);
routes.post("/fetchselecteduser",authenticateToken, FetchSelectedUser);
routes.post("/deletechatdata",authenticateToken, DeleteChatData);


routes.post("/upload_img",upload.single("image"),errorHandler,authenticateToken,UploadImage);


module.exports = routes;
