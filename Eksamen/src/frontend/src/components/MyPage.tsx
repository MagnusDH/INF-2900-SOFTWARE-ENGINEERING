import {Link} from "react-router-dom";
import { useState } from "react";


function MyPage() {
  const [userLogged, setUserLogged] = useState(
    localStorage.getItem("userLogged")
    );

  return (
    <div>
    
      <h1>My Page</h1>
    
      <div> 
        {/* If user is logged in, a button for logging out appears */}
        {userLogged == "true" ? 
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Link to="/Progression">
              <button>Progression</button>
            </Link>
            
            <Link to="/Settings">
              <button style={{ margin: "10px 0" }}>Settings</button>
            </Link>

            <Link to="/">
              <button style={{ margin: "10px 0" }}>Return to homepage</button>
            </Link>

          </div>
        :null}
            

        {/* If user is not logged in, a button for logging in appears */}
        {userLogged == "false" ?
          <div>
            <h2>You are not logged inn</h2> 
              <Link to="/Login">
                <button style={{ margin: "10px 0" }}>Go to login</button>
              </Link>
          </div>
        :null}
      </div>

    </div>
  );
}

export default MyPage;