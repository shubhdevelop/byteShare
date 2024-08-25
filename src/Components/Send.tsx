import { useEffect, useRef, useMemo, useState } from 'react'
const useCleanup = (val: any) => {
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

const initialiseCamera = () =>
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })

export const useCamera = (videoRef: any) => {
    const [isCameraInitialised, setIsCameraInitialised] = useState(false)
    const [video, setVideo] = useState(null)
    const [, setError] = useState('')
    const [playing, setPlaying] = useState(true)
    const [stream, setStream] = useState<MediaStream>()

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
                //@ts-ignore
                video.srcObject = stream
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
                '0ab1bfe2ae0dfa9f74fef377d335846c4ac8e9c97f061e0d64252b5094df531e',
            credential:
                '231c510349ea1a7cd8315e139d6ba345208c7f1488e8f49b9c97a84d3923c176',
        },
    ],
}

function Send() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [stream] = useCamera(videoRef)
    const [offer, setOffer] = useState('')
    const [message, setMessage] = useState('')
    const [messageList, setMessageList] = useState<string[] | []>([])
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const lc = useRef(new RTCPeerConnection(configuration)).current
    const dc = useMemo(() => lc.createDataChannel('channel'), [lc])

    useEffect(() => {
        const tracks = stream?.getTracks()
        if (tracks && tracks.length > 0) {
            lc.addTrack(tracks[0])
        }
    }, [lc, stream])

    function handleAnswer() {
        if (inputRef.current) {
            const answer = JSON.parse(inputRef.current.value)
            lc.setRemoteDescription(answer)
        }
    }

    useEffect(() => {
        lc.onicecandidate = () => {
            console.log(
                'found new Ice Candidate:',
                JSON.stringify(lc.localDescription)
            )
            setOffer(JSON.stringify(lc.localDescription))
        }

        lc.createOffer().then((e) => {
            console.log('creating an offer')
            lc.setLocalDescription(e)
        })
    }, [lc])

    useEffect(() => {
        dc.onopen = () => console.log('Connection Opened!!')
        dc.onmessage = (e) => {
            console.log('messsage received!!!' + e.data)
            setMessageList((prev) => [...prev, `sender: ${e.data}`])
        }
        dc.onclose = () => console.log('close')
    }, [dc])

    return (
        <div>
            <code className=" block text-black whitepace-pre bg-white w-[60%] overflow-x-scroll p-2 m-2 border-[1px] shadow-md rounded-md">
                {offer}
            </code>
            <textarea
                className="px-3 py-2 m-2 border-[1px] shadow-md rounded-sm w-96"
                placeholder="Set your ice here!!"
                ref={inputRef}
            />
            <button
                className="bg-black text-white border-[1px] rounded-md px-4 py-2 cursor-pointer"
                onClick={handleAnswer}
            >
                {' '}
                Set here
            </button>

            <code className=" block text-black whitepace-pre bg-white w-[60%] overflow-x-scroll p-2 m-2 border-[1px] shadow-md rounded-md"></code>
            <h1> Message </h1>
            <input
                value={message}
                className="border-[1px]"
                type="text"
                onChange={(e) => setMessage(e.target.value)}
            />
            <button
                onClick={() => {
                    dc.send(message)
                    setMessageList((prev) => [...prev, `shubham: ${message}`])
                    setMessage('')
                }}
                className="border-[1px] py-2 px-3 bg-black shadow-md rounded-md text-white m-3"
            >
                {' '}
                Send{' '}
            </button>

            <div className="w-[50%] p-4 bg-white text-black shadow-md rounded-sm">
                {messageList.map((message) => (
                    <p className="border-[1px] p-4 text-blue-400">
                        {' '}
                        {message}{' '}
                    </p>
                ))}
            </div>

            <video ref={videoRef} width={100} height={72} controls></video>
        </div>
    )
}

export default Send
