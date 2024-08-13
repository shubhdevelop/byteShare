import { useEffect, useRef, useMemo, useState } from 'react'

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

function Send() {
    const [offer, setOffer] = useState('')
    const [message, setMessage] = useState('')
    const [messageList, setMessageList] = useState<string[] | []>([])
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const lc = useRef(new RTCPeerConnection(configuration)).current
    const dc = useMemo(() => lc.createDataChannel('channel'), [lc])

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
        </div>
    )
}

export default Send
