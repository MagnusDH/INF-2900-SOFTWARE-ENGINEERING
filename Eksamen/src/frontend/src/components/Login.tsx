import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import { User } from "../types";
import { useAuth } from "../util/auth";
import './PosStyles.css';


//Put the login code here!
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate();
  const { logIn } = useAuth();

  const baseUrl = "http://localhost:8000/skooba/";

  const submit = async () => {
    const user: User = { username: username, password: password };

    try {
      const { data } = await axios.post(`${baseUrl}login`, user);
      if (data["message"] == false) {
        console.log("false login");
      } else {
        logIn(username);
        navigate("/"); // Navigate back to homepage
      }
    } catch (error: any) {
      setErrorMessage(error.request.status === 401 ? "Incorrect password" : "User does not exist")
      console.log("Submitting login failed", error);
    }
  }

  const renderErrorMessage = errorMessage === "" ? null : `Error: ${errorMessage}`;
  
    return (
      <div className="container">
        <h1>Login</h1>
        <div>
          <h2> Username </h2>
          <input
            type="text"
            placeholder="Type in username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <h2> Password </h2>
          <input type={showPassword ? "text" : "password"} placeholder="Type in password" name="password" value={password} onChange={
            (e) => setPassword(e.target.value)}></input>
        </div>
        {renderErrorMessage}
        <div>
          <button onClick={(e) => submit()}> Submit </button>
        </div>
        <div>
          <Link to="Register">
            <button>Register</button>
          </Link>
        </div>
        <Link to="/">
          <button> Return </button>
        </Link>
      </div>
    );
  } 
  
  export default Login