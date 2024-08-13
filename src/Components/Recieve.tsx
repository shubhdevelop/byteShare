import { useRef, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { io } from 'socket.io-client'
type extendedPeerConnection = RTCPeerConnection & any

const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun.cloudflare.com:3478',
                'turn:turn.cloudflare.com:3478?transport=udp',
                'turn:turn.cloudflare.com:3478?transport=tcp',
                'turns:turn.cloudflare.com:5349?transport=tcp',
            ],
            username:
                '0ab1bfe2ae0dfa9f74fef377d335846c4ac8e9c97f061e0d64252b5094df531e',
            credential:
                '231c510349ea1a7cd8315e139d6ba345208c7f1488e8f49b9c97a84d3923c176',
        },
    ],
}

const socket = io('https://signaling-serve.onrender.com/', {
    transports: ['websocket'],
})
function Recieve() {
    //create an receiver PeerConnnection
    let rc = useRef<extendedPeerConnection>(
        new RTCPeerConnection(configuration)
    ).current
    const [message, setMessage] = useState<string>('')
    const [messageList, setMessageList] = useState<string[]>([])

    useEffect(() => {
        function onConnect() {
            console.log('connect!!')
        }
        function onDisconnect() {
            console.log('disconnected!!')
        }
        function onRecieveOffer(offer: RTCIceCandidate) {
            rc.setRemoteDescription(offer)
            rc.createAnswer().then((answer: RTCIceCandidate) => {
                rc.setLocalDescription(answer)
                console.log('answer created')
            })
        }

        function onIceCandidate(e: RTCPeerConnectionIceEvent) {
            console.log('answer new ice candidate found', e.candidate)
            socket.emit('forward-answer', rc.localDescription)
        }
        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('recieve-offer', onRecieveOffer)

        rc.onicecandidate = onIceCandidate

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.off('recieve-offer', onRecieveOffer)
        }
    }, [])

    useEffect(() => {
        //@ts-ignore
        rc.onopen = () => console.log('Connection Opened!!')
        rc.ondatachannel = (e: RTCDataChannelEvent) => {
            rc.dc = e.channel
            //@ts-ignore
            rc.dc.onmessage = (e: MessageEvent) => {
                setMessageList((prev) => [...prev, e.data])
            }
        }
        //@ts-ignore
        rc.onclose = () => console.log('Connection Closed!!')
        rc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State: ', rc.iceConnectionState)
        }
    }, [rc])

    return (
        <div>
            <div className="p-4 w-full">
                <h1>Message</h1>
                {messageList.map((message) => (
                    <p
                        key={nanoid()}
                        className="py-2 text-blue-500 px-3 w-full text-left border-[1px]"
                    >
                        {message}
                    </p>
                ))}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value)
                    }}
                    className="py-2 px-3 border-[1px] shadow-md mr-2"
                />
            </div>
        </div>
    )
}

export default Recieve
