import IO from 'socket.io-client';

class List extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            myId: this.props.myId,
            users: []
        }
        this.socket = IO('localhost:3001');
    }
    componentDidMount(){
        this.socket.on('connect', () => {
            console.log('connected to server');
        })
    }
    render(){
        return(
            <div>
                you should see list of users!!!
            </div>
        )
    }
}

export default List;