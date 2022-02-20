const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", () => {
    console.log("서버와 연결 완료 👍")
})

socket.addEventListener("message", (message) => {
    console.log("서버로부터 \"", message.data, "\" 라고 받아따")
})

socket.addEventListener("close", () => {
    console.log("서버와 연결 종료 😅")
})

setTimeout(() => {
    socket.send("브라우저가 보냅니다 🙌")
}, 10000)