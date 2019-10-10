import Peer from 'simple-peer';
import ReactPlayer from 'react-player';

class Walkie extends React.Component {
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.state = {
            connect: false,
            peers: {},
            stream: null,
            player: null,
            reactPlayer: false,
            walkieTalkie: false
        }

        this.componentDidMount = this.componentDidMount.bind(this);

    }
    componentDidMount(){
        this.socket.on('doYou', data => {
            console.log(`I am ${this.socket.id}`);
            console.log(`and ${data.theirPeer} wants to connect to me!`);
            this.socket.emit('iWantToo', {
                to: data.theirPeer,
                thisIs: this.socket.id
            })
            this.setState({
                reactPlayer: true
            })
        })
        this.socket.on('signal', data => {
            const peerId = data.from;
            if(!this.state.peers[peerId]){
                this.createPeer(peerId, false, null);
            }
            const peer = this.state.peers[peerId];

            try{   
                peer.signal(data.signal)
            }catch{
                console.log('not signaled! :|')
            }
        })
    }

    
    walkieTalkie() {        
        if(!this.state.walkieTalkie){
            const options = { audio: true, video: false };
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia(options)
                    .then(stream => {
                        this.stream = stream;
                        this.forceUpdate();
                        this.socket.emit('peerTo', {
                            to: this.props.peerId,
                            thisIs: this.socket.id
                        })
                        this.socket.on('answer', data => {
                            this.peerId = data.answeredPeer;
                            this.createPeer(this.peerId, true, this.stream);
                        })
                        this.setState({walkieTalkie: true});
                    }).catch(e => console.log(e))
            }else{
                console.log('WTF :|');
            }
            
        }else{
            this.socket.emit('unPeer', {
                to: this.props.peerId,
                thisIs: this.socket.id
            })
            this.setState({walkieTalkie: false});
        }
        
    }

    createPeer(peerId, initiator, stream){
        const peer = new Peer({initiator: initiator, trickle: true, stream: stream});

        peer.on('signal', signal => {
            const msgId = (new Date().getTime);
            const msg = { msgId, signal, to: peerId}
            this.socket.emit('signal', msg);
        })

        peer.on('connect', () => {
            console.log('connected to peer');
            this.setPeerState(peerId, peer);
        })

        peer.on('data', data => {
            console.log(JSON.parse(data).msg);
        })

        peer.on('stream', stream => {
            console.log('stream oommaaaad!!!');
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
        return (
            <div>
                <button onClick={this.walkieTalkie.bind(this)}>{this.state.walkieTalkie? 'Talkie..': 'Walkie'}</button>
                {this.state.reactPlayer? <ReactPlayer url={this.state.player} playing/> : ''}
            </div>
        )
    }
}

export default Walkie;