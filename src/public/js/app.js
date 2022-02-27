const socket = io()

const myFace = document.getElementById("myFace")
const muteButton = document.getElementById("mute")
const cameraButton = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")

const call = document.getElementById("call")

call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCamera.label === camera.label) {
                option.selected = true
            }
            cameraSelect.appendChild(option)
        })
    } catch (e) {
        console.log(e)
    }
}

async function getMedia(deviceId) {
    const initConstraints = {
        audio: true,
        video: {facingMode: "user"}
    }

    const cameraConstraints = {
        audio: true,
        video: {deviceId: {exact: deviceId}},
        // video: { deviceId },
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initConstraints
        )
        myFace.srcObject = myStream
        if (!deviceId) {
            await getCameras()
        }
    } catch (e) {
        console.log(e)
    }
}

function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (!muted) {
        muteButton.innerText = "소리 켜기"
        muted = true
    } else {
        muteButton.innerText = "음소거"
        muted = false
    }
}

function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (cameraOff) {
        cameraButton.innerText = "카메라 끄기"
        cameraOff = false
    } else {
        cameraButton.innerText = "카메라 켜기"
        cameraOff = true
    }
}

async function handleCameraChange() {
    await getMedia(cameraSelect.value)
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video")
        videoSender.replaceTrack(videoTrack).then(() => {
            console.log("replaceTrack()")
        })
    }
}

muteButton.addEventListener("click", handleMuteClick)
cameraButton.addEventListener("click", handleCameraClick)
cameraSelect.addEventListener("input", handleCameraChange)

const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")

async function initCall() {
    welcome.hidden = true
    call.hidden = false
    await getMedia().then(() => {
        console.log("getMedia()")
    })
    makeConnection()
}

async function handleWelcomeSubmit(event) {
    event.preventDefault()
    const input = welcomeForm.querySelector("input")
    await initCall()
    socket.emit("join_room", input.value)
    roomName = input.value
    input.value = ""
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer()
    await myPeerConnection.setLocalDescription(offer)
    socket.emit("offer", offer, roomName)
})

socket.on("offer", async (offer) => {
    myPeerConnection.setRemoteDescription(offer).then(async () => {
        const answer = await myPeerConnection.createAnswer()
        await myPeerConnection.setLocalDescription(answer)
        socket.emit("answer", answer, roomName)
    })

})

socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer).then(r => {
        console.log("setRemoteDescription()")
    })
})

socket.on("ice", (ice) => {
    myPeerConnection.addIceCandidate(ice).then(r => {
        console.log("addIceCandidate()")
    })
})

// RTC
function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    })
    myPeerConnection.addEventListener("icecandidate", handleIce)
    myPeerConnection.addEventListener("addstream", handleAddStream)
    // myPeerConnection.addEventListener("track", handleTrack)
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data) {
    socket.emit("ice", data.candidate, roomName)
}

function handleAddStream(data) {
    const peersStream = document.getElementById("peersStream")
    peersStream.srcObject = data.stream
}

function handleTrack(data) {
    const peersStream = document.getElementById("peersStream")
    peersStream.srcObject = data.stream
}