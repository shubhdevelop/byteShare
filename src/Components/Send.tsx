import { useEffect, useRef, useMemo, useState, MutableRefObject } from 'react'
import { nanoid } from 'nanoid'
import { io } from 'socket.io-client'

const useCleanup = (val: HTMLVideoElement | null) => {
    const valRef = useRef(val)
    useEffect(() => {
        valRef.current = val
    }, [val])

    useEffect(() => {
        return () => {
            // cleanup based on valRef.current
        }
    }, [])
}

const initialiseCamera = async () =>
    await navigator.mediaDevices.getUserMedia({ audio: false, video: true })

export const useCamera = (videoRef: MutableRefObject<HTMLVideoElement>) => {
    const [isCameraInitialised, setIsCameraInitialised] = useState(false)
    const [video, setVideo] = useState<HTMLVideoElement | null>(null)
    const [, setError] = useState('')
    const [playing, setPlaying] = useState(true)
    const [stream, setStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        if (video || !videoRef.current) {
            return
        }

        const videoElement = videoRef.current
        if (videoElement instanceof HTMLVideoElement) {
            setVideo(videoRef.current)
        }
    }, [videoRef, video])

    useCleanup(video)

    useEffect(() => {
        if (!video || isCameraInitialised || !playing) {
            return
        }

        initialiseCamera()
            .then((stream) => {
                console.log(stream)
                if (video) {
                    video.srcObject = stream
                }
                setIsCameraInitialised(true)
                setStream(stream)
            })
            .catch((e) => {
                setError(e.message)
                setPlaying(false)
            })
    }, [video, isCameraInitialised, playing])

    useEffect(() => {
        const videoElement = videoRef.current

        if (playing) {
            videoElement.play()
        } else {
            videoElement.pause()
        }
    }, [playing, videoRef])

    return [stream]
    // isCameraInitialised, playing, setPlaying, error, stream
}

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
                '8bc8b19c3fd5f349ffdba084b614fb9b764c885f36212a99d14b35049b374002',
            credential:
                '67d2a742447987718f4798d6409e8bb865e50fe3a9c225cd6d64c9b5db86675e',
        },
    ],
}

function Send() {
    const socket = io('https://signaling-serve.onrender.com', {
        transports: ['websocket'],
    })
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [stream] = useCamera(videoRef as MutableRefObject<HTMLVideoElement>)
    const lc = useRef(new RTCPeerConnection(configuration)).current

    const dc = useMemo(() => lc.createDataChannel('channel'), [lc])
    const [message, setMessage] = useState<string>('')
    const [messageList, setMessageList] = useState<string[]>([])

    function handlesSendMessage() {
        dc.send(message)
        setMessageList((prev) => [...prev, message])
        setMessage('')
    }

    useEffect(() => {
        const tracks = stream?.getTracks()
        if (tracks && tracks?.length > 0) {
            lc.addTrack(tracks[0])
        }
    }, [stream])

    useEffect(() => {
        function onConnect() {
            console.log('connected')
        }
        function onRecieveAnswer(answer: any) {
            console.log(answer, ':recieved!!')
            lc.setRemoteDescription(answer)
            console.log('remote Description set!!')
        }

        function onDisconnect() {
            console.log('disconnected')
        }

        function onIceCandidate() {
            console.log(
                'found new Ice Candidate:',
                JSON.stringify(lc.localDescription)
            )
            socket.emit('offer-forward', lc.localDescription)
            console.log('ice candidiate send!!')
        }

        socket.on('socket:connect', onConnect)
        socket.on('socket:recieve-answer', onRecieveAnswer)
        socket.on('socket:disconnect', onDisconnect)
        lc.onicecandidate = onIceCandidate
        lc.createOffer().then((e) => {
            lc.setLocalDescription(e)
        })

        return () => {
            socket.off('connect', onConnect)
            socket.off('recieve-answer', onRecieveAnswer)
            socket.off('disconnect', onDisconnect)
        }
    }, [lc, socket])

    // useEffect(() => {
    //     dc.onopen = () => console.log('Connection Opened!!')
    //     dc.onmessage = (e) => {
    //         console.log('messsage received!!!' + e.data)
    //     }
    //     dc.onclose = () => console.log('close')
    // }, [dc])

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
                <button
                    onClick={handlesSendMessage}
                    className="px-3 py-2 bg-black text-white rounded-md border-[1px] shadow-md"
                >
                    Send
                </button>
                <video
                    controls={true}
                    className="boder-[1px]"
                    width={1000}
                    height={720}
                    ref={videoRef}
                ></video>
            </div>
        </div>
    )
}

export default Send
