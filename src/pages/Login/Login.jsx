import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'


const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if(currState === "Sign Up"){
      signup(username, email, password);
    }
    else{
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt='' className='logo'/>
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currState}</h2>
        {
          currState === "Sign Up" ? <input placeholder='username' type='text' className='form-input' onChange={(e) => setUsername(e.target.value)} value={username} required></input> : null
        }
        
        <input placeholder='email' type='Email address' className='form-input' onChange={(e) => setEmail(e.target.value)} value={email}  required></input>

        <input placeholder='password' type='password' className='form-input' onChange={(e) => setPassword(e.target.value)} value={password} required></input>

        <button >
          {
            currState === "Sign Up" ? "Create Account" : "Login Now"
          }
        </button>
        
        {/* login term */}
        <div className='login-term'>
            <input type='checkbox'/>
            <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {
            currState === "Sign Up" ? 
            <p className='login-toggle'>Already have an aaccount <span onClick={() => setCurrState("Login In")}>Click here</span></p> 
            :<p className='login-toggle'>Create an account <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
          }
          {
            currState !== "Sign Up" ?<p className='login-toggle'>Forgot Password ?<span onClick={() => resetPass(email)}> reset here</span></p> : null
          }
          
        </div>
      </form>
    </div>
  )
}

export default Login
