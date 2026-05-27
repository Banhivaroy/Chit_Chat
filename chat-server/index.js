const express = require("express")
const cors = require("cors")
const { Server } = require("socket.io")
const http = require("http")
const PORT = 3000
const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccount.json")

const app = express()
app.use(cors())
app.use(express.json())
const server = http.createServer(app)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

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
app.post("/signup", async(req, res) => {
    const { firstname, lastname, username, email, password} = req.body

    try{
        const existingUsername = await db.collection("users")
        .where("username", "=", username)
        .get()

            if(!existingUsername.empty){
            return res.json({success: false , message: "username already taken"})
            }
        const existingEmail = await db.collection("users")
        .where("email", "=", email)
        .get()
            if(!existingEmail.empty){
                return res.json({ success: false, message:"email registered"})
            }
        // SAVE
        const userRef = db.collection("users").doc()
        await userRef.set({
            id: userRef.id,
            firstname,
            lastname,
            username,
            email,
            password,
            createdAt: new Date()
        })

        res.json({ success: true, userId: userRef.id})
    }
    catch(err){
        console.log("Sign Up error", err)
        res.json({success: false, message: "Something went wrong"})
    }
})
server.listen(PORT, () => {
    console.log(`Chat server is running at ${PORT}`)
})