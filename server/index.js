const express=require('express');
const dotenv = require("dotenv").config(); //loads environment variables from a .env file into process.env
const cors = require('cors');
const dbConnection=require('./config/dbConnection'); //DB connection
const SocketIO=require("./controllers/ChatSocket");
const http = require("http");

const app= express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//--------------------------Routes-------------------------- !
const userAuth=require("./routes/UserAuthRoute.js");
const userRoute=require("./routes/UserRoute");

app.use("/",userAuth); //User registration and login
app.use("/user",userRoute); 

const server = http.createServer(app);
SocketIO(server);

server.listen(port,()=>{
    console.log(`Server running on port ${port}!`)
    dbConnection();
})  