const socket = io()

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")

room.hidden = true

let roomName

function addMessage(message)
{
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)

}

function showRoom() {
    welcome.hidden = true
    room.hidden = false
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg")
    const nameForm = room.querySelector("#name")
    msgForm.addEventListener("submit", handleMessageSubmit)
    nameForm.addEventListener("submit", handleNickNameSubmit)
}

function handleRoomSubmit(event) {
    event.preventDefault()
    const input = form.querySelector("input")
    socket.emit("enter_room", input.value, showRoom)
    roomName = input.value
    input.value = ""
}

function handleMessageSubmit(event) {
    event.preventDefault()
    const input = room.querySelector("#msg input")
    const value = input.value
    socket.emit("new_message", value, roomName, () => {
        addMessage(`나: ${value}`)
    })
    input.value = ""
}

function handleNickNameSubmit(event) {
    event.preventDefault()
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value)
}

form.addEventListener("submit", handleRoomSubmit)


socket.on("welcome", (user) => {
    addMessage(`${user} 들어와따!`)
})

socket.on("bye", (user) => {
    addMessage(`${user} 나갔다!`)
})

socket.on("new_message", addMessage)

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = ""
    if (rooms.length === 0) {
        return
    }
    rooms.forEach(room => {
        const li = document.createElement("li")
        li.innerText = room
        roomList.append(li)
    })
})
// 밑에거랑 똑같음
// socket.on("room_change", (msg) => console.log(msg))