const lc = new RTCPeerConnection();
const offerElement = document.getElementById("offer");
const dataChannel = lc.createDataChannel("channel");
const input = document.getElementById('answer-input');
const btn = document.getElementById('btn');
dataChannel.onmessage = e=>console.log("got a message",e.data);
dataChannel.onopen = (e)=> console.log("connection open");
lc.onicecandidate = e => {
    console.log("new ice candidate!!, reprinting Sdp", JSON.stringify(lc.localDescription));
        offerElement.innerText = JSON.stringify(lc.localDescription);
};   


lc.createOffer().then(o=> lc.setLocalDescription(o)).then(()=>console.log("set successyfully"));

btn.addEventListener('click', ()=>{
    const answer = JSON.parse(input.value);
    console.log(answer);
    lc.setRemoteDescription(answer);
})
