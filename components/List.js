import IO from 'socket.io-client';

class List extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            myName: this.props.myId,
            users: {}
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

    renderList(){
        return Object.entries(this.state.users).map( entry => {
            const [id, name] = entry;
            return (
                <h3 key={id}>{name} : {id}</h3>
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