const nickForm = document.querySelector("#nick")
const messageList = document.querySelector("ul")
const messageForm = document.querySelector("#message")
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload){
    const msg = {type, payload}
    return JSON.stringify(msg)
}

socket.addEventListener("open", () => {
    console.log("서버와 연결 완료 👍")
})

socket.addEventListener("message", (message) => {
    const li = document.createElement("li")
    li.innerText = message.data
    messageList.append(li)
})

socket.addEventListener("close", () => {
    console.log("서버와 연결 종료 😅")
})

messageForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const input = messageForm.querySelector("input")
    socket.send(makeMessage("new_message", input.value))
    const li = document.createElement("li")
    li.innerText = `You: ${input.value}`
    messageList.append(li)
    input.value = ""
})

nickForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const input = nickForm.querySelector("input")
    socket.send(makeMessage("nickname", input.value))
})