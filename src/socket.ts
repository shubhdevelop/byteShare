import { io } from 'socket.io-client'
const socket = io('https://signaling-serve.onrender.com', {
    transports: ['websocket'],
})

export { socket }
