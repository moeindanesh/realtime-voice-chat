import Login from '../components/login';
import List from '../components/List';

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            status: 'login',
            username: undefined
        }
        this.login = this.login.bind(this);
    }

    login(username){
        this.setState({
            username,
            status: 'list'
        })
    }

    render(){
        switch(this.state.status){
            case 'login':
                return(
                    <div>
                        <Login onClick={this.login} />
                    </div>
                )
            case 'list':
                return(
                    <div>
                        <List myId={this.state.username} />
                    </div>
                )
        }
        
    }
}

export default App;