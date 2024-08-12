import { useRef, useState, useEffect } from 'react'
function Recieve() {
    let rc = useRef<RTCPeerConnection>(new RTCPeerConnection()).current
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const [answer, setAnswer] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [messageList , setMessageList] = useState<string[]>([]);
    function handleOffer() {
        if(inputRef && inputRef.current){
        const offer = JSON.parse(inputRef.current.value)
        rc.setRemoteDescription(offer).then(() => {
            console.log('offer set!')

            rc.createAnswer().then((e) => {
                rc.setLocalDescription(e)
                setAnswer(JSON.stringify(e));
            })
        })
        }
    }
    function handleSendMessage(){
           rc.dc.send(message);
            setMessageList(prev=>[...prev, message])
            setMessage("");
    }   
    useEffect(() => {
        //@ts-ignore
        rc.onopen = () => console.log('Connection Opened!!')
        rc.ondatachannel = (e) => {
            rc.dc = e.channel;
            //@ts-ignore
            rc.dc.onmessage = (e) =>
                setMessageList(prev=>[...prev, e.data])
                alert(`message arrived : ${e.data}`)
        }
        //@ts-ignore
        rc.onclose = () => console.log('Connection Closed!!')
        rc.onicecandidate = () =>
            console.log(
                'new ice candidate!!, reprinting Sdp',
                JSON.stringify(rc.localDescription)
            )
    }, [rc])

    return (
        <div>
            <textarea
                className="px-3 py-2 m-2 border-[1px] shadow-md rounded-sm w-96"
                placeholder="give your offer here!!"
                ref={inputRef}
            />
            <button
                className="bg-black text-white border-[1px] rounded-md px-4 py-2 cursor-pointer"
                onClick={handleOffer}
            >
                Set Offer
            </button>
            <code className=" block text-black whitepace-pre bg-white w-[60%] overflow-x-scroll p-2 m-2 border-[1px] shadow-md rounded-md">
                {answer}
            </code>

            <code className=" block text-black whitepace-pre bg-white w-[60%] overflow-x-scroll p-2 m-2 border-[1px] shadow-md rounded-md"></code>
            <h1> Message </h1>
            <input
                value={message}
                className="border-[1px]"
                type="text"
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage} className="border-[1px] py-2 px-3 bg-black shadow-md rounded-md text-white m-3">
                Send
            </button>

            <div className="w-[50%] p-4 bg-white text-black shadow-md rounded-sm">
                {messageList.map((message) => (
                    <p className="border-[1px] p-4 text-blue-400">
                        {message}
                        </p>
                ))}
            </div>
        </div>
    )
}

export default Recieve
