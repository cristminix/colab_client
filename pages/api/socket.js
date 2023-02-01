import { Server } from 'Socket.IO'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    const message = 'Socket is already running'
    console.log(message)
    return res.status(200).json({message});

  } else {
    const message = 'Socket is initializing'
    console.log(message)
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    return res.status(200).json({message});

  }
  res.end()
}

export default SocketHandler