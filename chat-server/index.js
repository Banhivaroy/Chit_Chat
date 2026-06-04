const express = require("express")
const cors = require("cors")
const { Server } = require("socket.io")
const http = require("http")
const mongoose = require("mongoose")
const { first } = require("firebase/firestore/pipelines")
require("dotenv").config()
const port = process.env.PORT


const app = express()
app.use(cors())
app.use(express.json())
const server = http.createServer(app)

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDb connected"))
    .catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const User = mongoose.model("user",userSchema)
const io = new Server(server,{
    cors: {origin: "http://localhost:5173"}
})

const onlineUsers = {}
io.on("connection" , (socket) => {
    console.log("Someone Entered", socket.id)

    socket.on("join", (username) => {
        onlineUsers[socket.id] = username
        socket.broadcast.emit("user_joined", username)
        console.log(`${username} joined. Online: ${Object.values(onlineUsers)}`)
    })
    socket.on("Send_msg", (data) => {
        io.emit("receive_msg",data)
    })
    socket.on("User_typing", (username) =>{
        socket.broadcast.emit("user_typing",username)
    })
    socket.on("User_discnnect",() =>{
        const username = onlineUsers[socket.id]
        if(username){
            delete onlineUsers[socket.id]
            io.emit("user_left",username)
            console.log(`${username} left`)
        }
    })
})


//  ROUTES
app.post("/", async(req, res) => {
    console.log("signup request received" , req.body)
    const { firstname, lastname, username, email, password} = req.body

    try{
        const existingUsername = await User.findOne({ username: username })
    
            if(existingUsername){
            return res.json({success: false , message: "username already taken"})
            }
        const existingEmail = await User.findOne({ email: email})
  
            if(existingEmail){
                return res.json({ success: false, message:"email registered"})
            }
        // SAVE
       const newUser = new User({
        firstName: firstname,
        lastName: lastname,
        username,
        email,
        password
       })
       await newUser.save()
        console.log("user id : ", newUser._id)
        res.json({ success: true, userId: newUser._id})
    }
    catch(err){
        console.log("Sign Up error", err)
        res.json({success: false, message: "Something went wrong"})
    }
})



server.listen(port, () => {
    console.log(`Chat server is running at ${port}`)
})