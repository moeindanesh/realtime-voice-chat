import IO from 'socket.io-client';
import Walkie from './Walkie'
class List extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            myName: this.props.myId,
            users: {},
            walkie: {}
        }
        this.socket = IO('localhost:3001');

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
    }

    talkHandle(e){
        const userId = e.target.id;

        if(!this.state.walkie[e.target.id]){
            const walkie = { ...this.state.walkie }
            walkie[userId] = true;
            this.setState({
                walkie
            })
        }else{
            const walkie = { ...this.state.walkie }
            walkie[userId] = false;
            this.setState({
                walkie
            })
        }
    }

    renderList(){
        return Object.entries(this.state.users).map( entry => {
            const [id, name] = entry;
            return (
                <div key={id}>
                    <h3 >{name} : {id}</h3>
                    {/* <button onClick={this.talkHandle.bind(this)} id={id}>Walkie</button> */}
                    <Walkie peerId={id} socket={this.socket} />
                </div>
            )
        })
    }

    render(){
        return(
            <div>
                <h1>List of online users</h1>
                {this.renderList()}
            </div>
        )
    }
}

export default List;