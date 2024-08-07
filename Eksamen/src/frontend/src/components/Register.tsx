import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import { User } from "../types";
//Put the login code here!
function Register(){

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const baseUrl = "http://localhost:8000/skooba/";

  const submit = async () => {
    const user: User = {"username": username, "password": password};

    try {
      const { data } = await axios.post(`${baseUrl}register`, user);
      /* If the response message is succesful, then we have registered a user */
      if(data["message"] == true){ 
          navigate("/Login") // Navigate back to login
        } else {
          console.log('testing testing');  
        }
    } catch (error: any) {
      setErrorMessage(error.request.status === 409 ? "Username already taken" : "Invalid input")
      console.log("Submitting register failed", error);
    }
  }
  const renderErrorMessage = errorMessage === "" ? null : `Error: ${errorMessage}`;

    return(
    
      <div>

        <h1>Register</h1>
        <div>
          
          <h2> Username </h2>
          <input type="text" placeholder="Type in username" name="username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
        </div>
        <div>

          <h2> Password </h2>

          <input type={showPassword ? "text" : "password"} placeholder="Type in password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
        </div>
        {renderErrorMessage}
        <br />
          <button onClick={() => setShowPassword(s => !s)}>{showPassword ? "Hide Password" : "Show Password"}</button>

        <div>
          <button onClick={(e) => submit()}> Submit </button>
        </div>
        

        <Link to="/Login">
          <button> Return </button>
        </Link>
      </div>
    )
  } 
  
  export default Register