class Login extends React.Component{
    constructor(props){
        super(props);
    }

    login(){
        this.props.onClick(this.refs.username.value);
    }

    render(){
        return(
            <div>
                <input type="text" ref="username"/>
                <button onClick={this.login.bind(this)}>Login</button>
            </div>
        )
    }
}

export default Login;