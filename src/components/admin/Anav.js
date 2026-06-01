import { Link,NavLink } from "react-router-dom";
import { useState } from 'react';
function ANav(){
  const [showNavbar] = useState(false)
    return (
        <>
          <nav className="navbar">
            <div className="container">
              <div className="logo"><Link to="/admin">CCL</Link></div>
              <div className={`nav-elements  ${showNavbar && 'active'}`}>
                <ul>
                  <li>
                    <NavLink to="/admin/course">Course Overview</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/application">Application</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/file">File Overview</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/administrator">Admin Setting</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/account">Account</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin">Logout</NavLink>
                  </li>

                </ul>
              </div>
            </div>
          </nav>
        </>
    );
}

export default ANav;
