const io = require("socket.io")(process.env.PORT || 8999, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.THERAPIST_URL]
  }
})

let users = []

const getSocket = (id) => {
  return users.find((user) => user.id === id)
}

const addUser = (id, socketId) => {
  !users.some((user) => user.id === id) &&
    users.push({ id, socketId })
}

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId)
}

io.on("connection", (socket) => {
  console.log("a user connected")
  io.emit("welcome", "hello this is socket server")
  socket.on("addUser", async (userEmail) => {
    await addUser(userEmail, socket.id)
    console.log(users)
    await io.emit("getUsers", users)
  })

  socket.on("sendMessage", async ({ id, senderID, receiverID, message }) => {
    console.log(users)
    const receiver = await getSocket(receiverID)
    console.log("message Send", senderID, receiverID, message)
    await io.to(receiver?.socketId).emit("getMessage", { senderID, message, id })
  })

  socket.on("disconnect", () => {
    console.log("a user disconnected")
    removeUser(socket.id)
    io.emit("getUsers", users)

  })

})
