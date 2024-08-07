import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ChangePW() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const baseUrl = "http://localhost:8000/skooba/";

  interface Password {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  const submit = async () => {
    const password: Password = {
      oldPassword,
      newPassword,
      confirmPassword
    };

    try {
      const { data } = await axios.post(`${baseUrl}changePassword`, password);
      if (data["message"] === "Password changed successfully") {
        navigate("/");
      } else {
        console.log("Password change failed");
      }
    } catch (error) {
      console.log("Changing password failed", error);
    }
  };

  return (
    <div>
      <h1>Change Password</h1>
      <div>
        <h2>Old Password</h2>
        <input
          type="password"
          placeholder="Type in old password"
          name="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}  
        />
      </div>
      <div>
        <h2>New Password</h2>
        <input
          type="password"
          placeholder="Type in new password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <h2>Confirm Password</h2>
        <input
          type="password"
          placeholder="Confirm new password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={submit}>Change password</button>
      </div>


      <Link to="/Settings">
        <button>Return</button>
      </Link>
    </div>
  );
}

export default ChangePW;