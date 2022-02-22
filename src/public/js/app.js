const socket = io()

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")

function handleRoomSubmit(event) {
    event.preventDefault()
    const input = form.querySelector("input")
    socket.emit("enter_room", {payload: input.value}, (msg) => {
        console.log("서버가 뭔가를 끝냈다!", `응답: ${msg}`)
    })
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit)
