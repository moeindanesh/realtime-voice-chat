import io from 'socket.io-client';
import Peer from 'simple-peer';
import { sign } from 'crypto';

const ioURL = 'localhost:3001';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connect: false,
            peers: {},
            stream: null
        }

        this.componentDidMount = this.componentDidMount.bind(this);
        this.socket = io(ioURL);

    }
    componentDidMount(){
        
        const options = { audio: true, video: false };
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
            const peer = this.state.peers[peerId];
            if(!peer){
                this.createPeer(peerId, false, stream);
            }
            console.log(data);
        })
    }
    
    connect() {
        console.log('connect');
        
        this.socket.emit('needPeer', {
            thisIs: this.socket.id
        })
        this.socket.on('answer', data => {
            console.log('answer');
            this.peerId = data.answeredPeer;
            this.createPeer(this.peerId, true, this.stream);
        })
        
    }

    createPeer(peerId, initiator, stream){
        console.log('createPeer');
        const peer = new Peer({initiator: initiator, trickle: true, stream});

        peer.on('signal', signal => {
            const msgId = (new Date().getTime);
            const msg = { msgId, signal, to: peerId}
            this.socket.emit('signal', msg);
        })
        setPeerState(peerId, peer);
    }

    setPeerState(peerId, peer){
        
    }
    render() {
        console.log('render');
        return (
            <div>
                <button onClick={this.connect.bind(this)}>connect</button>
            </div>
        )
    }
}

export default App;