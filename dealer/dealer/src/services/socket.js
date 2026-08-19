import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })
  }
  return socket
}
