const offer = JSON.parse(prompt());
const rc = new RTCPeerConnection();
const answer = document.getElementById("answer");
 
let recievedChannel ;

rc.onicecandidate = e => console.log("new ice candidate!!, reprinting Sdp", JSON.stringify(rc.localDescription));
rc.ondatachannel = e =>{
    recievedChannel = e.channel;
    recievedChannel.onmessage = e => {
        console.log(e);
        console.log("new data from client :", e.data)
    }
    rc.channel = recievedChannel;

}
rc.onopen = e => console.log("connection opened");
rc.setRemoteDescription(offer).then( () =>console.log("offer set!"));

rc.createAnswer().then( a => {
    rc.setLocalDescription(a)
    answer.innerText = JSON.stringify(a);
}
).then(console.log("answer created!"));
