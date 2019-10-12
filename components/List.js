import IO from 'socket.io-client';
import Walkie from './Walkie'
class List extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            myName: this.props.myId,
            users: {},
            walkie: {},
            peerId: undefined
        }
        this.socket = IO('localhost:3001');

        this.talkHandle = this.talkHandle.bind(this);
        this.renderList = this.renderList.bind(this);
    }
    componentDidMount(){
        this.socket.on('connect', () => {
            console.log('connected to server');
            this.socket.emit('newUser', {from: this.socket.id, name: this.state.myName})
        });

        this.socket.on('newUserConnected', data => {
            const userId = data.from;
            const users = { ...this.state.users };
            users[userId] = data.name;
            this.setState({
                users
            });
            this.socket.emit('iAmHereToo', {
                to: data.from,
                from: this.socket.id,
                name: this.state.myName
            })
        })

        this.socket.on('addThis', data => {
            const userId = data.userId;
            const users = { ...this.state.users }
            users[userId] = data.userName;
            this.setState({
                users
            })
        })

        this.socket.on('userDisconnected', data => {
            const userId = data.userId;
            const users = { ...this.state.users}
            delete users[userId];
            this.setState({
                users
            })
        })
    }

    talkHandle(e){
        // this.state.walie
        const peerId = e.target.id;
        this.setState({
            peerId
        })
        
    }

    renderList(){
        return Object.entries(this.state.users).map( entry => {
            const [id, name] = entry;
            return (
                <div key={id}>
                    <h3 >{name} : {id}</h3>
                    <button onClick={this.talkHandle.bind(this)} id={id}>talk to this guy...</button>
                </div>
            )
        })
    }

    render(){
        return(
            <div>
                <h1>List of online users</h1>
                {this.renderList()}
                <Walkie peerId={this.state.peerId} socket={this.socket} />
            </div>
        )
    }
}

export default List;