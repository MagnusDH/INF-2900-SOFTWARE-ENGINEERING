import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../util/auth";
import "./NavBar.css";
import img from "../images/concept/skooba_pink_alfa.png"

function NavBar() {
  const { isLoggedIn, logOut } = useAuth();

  const loginOrOutButton = isLoggedIn ? (
    <Link to="/" onClick={logOut}>Log out</Link>
  ) : (
    <Link to="/Login">Log in</Link>
  );

  return (
    <div>
      
      {/* Activates the CSS sheet */}
      <link href="NavBar.css"/>

      <nav className="navBar">

        <a href="/" className="siteTitle">
          <img className="navBarPicture"
            src={img}>
          </img>
        </a>

        <ul>
          <li><Link to="/MyPage">My Page</Link></li>
          <li><Link to="/Exercises">Exercises</Link></li>
          <li><Link to="/Settings">Settings</Link></li>
          <li>{loginOrOutButton}</li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default NavBar;