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

        this.socket.on('deletePeer', data => {
            const peerId = data.peerId;
            if(this.state.peers[peerId]){
                // this.destroyPeer(peerId);
                this.setState({
                    reactPlayer: false
                })
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
                        if(!this.state.peers[this.props.peerId]){
                            this.socket.emit('peerTo', {
                                to: this.props.peerId,
                                thisIs: this.socket.id
                            })
                            this.socket.on('answer', data => {
                                this.peerId = data.answeredPeer;
                                this.createPeer(this.peerId, true, this.stream);
                            })
                        }else{
                            const peer = this.state.peers[this.props.peerId];
                            console.log(peer);
                            peer.addStream(this.stream);
                        }
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
            let tracks = this.stream.getTracks();
            for(let i = 0; i < tracks.length; i++){
                tracks[i].stop();
            }
            
            this.destroyPeer(this.props.peerId);
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
            this.setState({
                player: stream,
                reactPlayer: true
            });
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
    
    destroyPeer(peerId){
        const peers = { ...this.state.peers }
        const peer = peers[peerId]
        peer.removeStream(this.stream);
        console.log(peer);
        // peer.destroy();
        // delete peers[peerId];
        // this.setState({
        //     peers
        // })
        this.socket.emit('unPeer', {
            from: this.socket.id,
            to: peerId
        })
        console.log('destroyed!');
    }
    peerAddStream(peerId){
        const peers = { ...this.state.peers }
        const peer = peers[peerId]
        peer.addStream(this.stream);
    }

    render() {
        this.stream ? console.log(this.stream.active) : console.log('there is no stream!');
        return (
            <div>
                <button onClick={this.walkieTalkie.bind(this)}>{this.state.walkieTalkie? 'Talkie..': 'Walkie'}</button>
                {this.state.reactPlayer? <ReactPlayer url={this.state.player} playing/> : ''}
            </div>
        )
    }
}

export default Walkie;