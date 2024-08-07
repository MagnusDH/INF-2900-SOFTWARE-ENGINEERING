import {Link} from "react-router-dom";
//Put the My Page code here!


  import React, { useState } from 'react';

  function Settings() {
    const [darkMode, setDarkMode] = useState(false);
  
    return (
      <div>
        <h1>Settings</h1>

        {/* Change password */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Link to="/ChangePW">
            <button style={{ margin: "10px 0" }}>Change password</button>
          </Link>

          {/* Dark mode */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>Dark mode</span>
            <input
              type="range"
              min={0}
              max={1}
              step={1}
              value={darkMode ? 1 : 0}
              onChange={(e) => setDarkMode(e.target.value === "1")}
              style={{ width: "80px", backgroundColor: "red", margin: "100px 1", float: "right" }}
            />
      
          {/* Return button */}
          </div>
          <Link to="/MyPage">
            <button style={{ margin: "10px 0" }}>Return</button>
          </Link>
        </div>
      </div>
    );
  }
  
  export default Settings;
  
 