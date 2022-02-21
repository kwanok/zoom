import * as http from 'http'
import express from 'express'
import {WebSocket} from "ws";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res) => res.render("home"))

const handleListen = () => console.log(`Listening on http://localhost:3000`)

const server = http.createServer(app)
const wss = new WebSocket.Server({server})

const sockets = []

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

server.listen(3000, handleListen)