import { Link } from "react-router-dom";
import { useAuth } from "./util/auth";
import "./App.css";
import img from "./images/concept/skooba_pink_alfa.png"


function App() {
  const { isLoggedIn, logOut } = useAuth();

  const loginOrOutButton = isLoggedIn ? (
    <Link to="/">
      <button onClick={logOut}>Log out</button>
    </Link>
  ) : (
    <Link to="/Login">
      <button>Login</button>
    </Link>
  );

  return (
    <div className="App">  
      <h1>Skooba</h1>

      {/* Changes the url when the button is pressed */}
      <div>
        <a href="/Workout">
          <button>Workout</button>
        </a>
      </div>

      <div>
        <a href="/MyPage">
          <button>My Page</button>
        </a>
      </div>

      {loginOrOutButton}

      
    </div>
  );
}

export default App;