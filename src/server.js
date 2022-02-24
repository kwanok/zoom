import * as http from 'http'
import express from 'express'
import SocketIo from 'socket.io'

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res) => res.render("home"))

const handleListen = () => console.log(`Listening on http://localhost:3000`)

const server = http.createServer(app)
// const wss = new WebSocket.Server({server})
// const sockets = []
const io = SocketIo(server)

io.on('connection', (socket) => {
    socket["nickname"] = "Anonymous"
    socket.onAny((event) => {
        console.log(`소켓 이벤트: ${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName)
        done()
        socket.to(roomName).emit("welcome", socket.nickname)
        console.log(roomName)
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname))
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`)
        done()
    })
    socket.on("nickname", nickname => socket["nickname"] = nickname)
})



/*
wss.on("connection", (socket) => {
    sockets.push(socket)
    socket["nickname"] = "Anonymous"
    socket.on("close", () => console.log("브라우저와 연결 종료 😭"))
    socket.on("message", (msg) => {
        const message = JSON.parse(msg)
        switch (message.type) {
            case "new_message":
                sockets.forEach((_socket) => _socket.send(`${socket.nickname}: ${message.payload}`))
                break
            case "nickname":
                socket["nickname"] = message.payload
                break
        }
    })
})

 */

server.listen(3000, handleListen)