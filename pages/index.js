import io from 'socket.io-client';
import Peer from 'simple-peer';
import ReactPlayer from 'react-player';

const ioURL = '192.168.1.54:3001';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connect: false,
            peers: {},
            stream: null,
            player: null
        }

        this.componentDidMount = this.componentDidMount.bind(this);
        this.socket = io(ioURL);

    }
    componentDidMount(){
        
        const options = { audio: true, video: true };
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(options)
                .then(stream => {
                    this.stream = stream;
                    this.forceUpdate();
                    
                }).catch(e => console.log(e))
        }else{
            console.log('WTF :|');
        }

        this.socket.on('connect', () => {
            console.log('connected to server');
        });
        this.socket.on('doYou', data => {
            console.log(`I am ${this.socket.id}`);
            console.log(`and ${data.theirPeer} wants to connect to me!`);
            this.socket.emit('iWantToo', {
                to: data.theirPeer,
                thisIs: this.socket.id
            })
        })
        this.socket.on('signal', data => {
            const peerId = data.from;
            if(!this.state.peers[peerId]){
                this.createPeer(peerId, false, this.stream);
            }
            const peer = this.state.peers[peerId];

            try{   
                peer.signal(data.signal)
            }catch{
                console.log('not signaled! :|')
            }
        })
    }

    componentDidUpdate(){
        // if(this.stream && this.video && !this.video.srcObject){
        //     this.video.srcObject = this.stream
        // }
        // this.attachPeerVideos()
    }
    attachPeerVideos() {
        Object.entries(this.state.peers).forEach(entry => {
          const [peerId, peer] = entry
          if (peer.video && !peer.video.srcObject && peer.stream) {
            peer.video.setAttribute('data-peer-id', peerId)
            peer.video.srcObject = peer.stream
          }
        })
      }
    
    connect() {        
        this.socket.emit('needPeer', {
            thisIs: this.socket.id
        })
        this.socket.on('answer', data => {
            this.peerId = data.answeredPeer;
            this.createPeer(this.peerId, true, this.stream);
        })
        
    }

    createPeer(peerId, initiator, stream){
        const peer = new Peer({initiator: initiator, trickle: true, stream});

        peer.on('signal', signal => {
            const msgId = (new Date().getTime);
            const msg = { msgId, signal, to: peerId}
            this.socket.emit('signal', msg);
        })

        peer.on('connect', () => {
            console.log('connected to peer');
            this.setPeerState(peerId, peer);
            // peer.send(JSON.stringify({
            //     msg: 'Hey :))'
            // }));
        })

        peer.on('data', data => {
            console.log(JSON.parse(data).msg);
        })

        peer.on('stream', stream => {
            console.log('stream!!!');
            // peer.stream = stream;
            console.log(stream);
            // var video = document.querySelector('video');
            // video.srcObject = stream
            // video.play()
            this.setPeerState(peerId, peer);
            this.setState({player: stream});
        })

        this.setPeerState(peerId, peer);
    }

    setPeerState(peerId, peer){
        const peers = { ...this.state.peers };
        peers[peerId] = peer;
        this.setState({
            peers
        })
    }
    renderPeers(){
        return Object.entries(this.state.peers).map(entry => {
            const [peerId, peer] = entry
            return <div key={peerId}>
              <video ref={video => peer.video = video}></video>
            </div>
          })
    }

    render() {
        // console.log(this.stream);
        return (
            <div>
                <button onClick={this.connect.bind(this)}>connect</button>
                <ReactPlayer url={this.state.player} playing/>
                {/* {this.renderPeers()} */}
                <div id="me">
                    {/* <video id="myVideo" ref={video => this.video = video} controls></video> */}
                </div>
                {/* <div id="peers">{this.renderPeers()}</div> */}
            </div>
        )
    }
}

export default App;