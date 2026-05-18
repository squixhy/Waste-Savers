import { Link } from "react-router-dom";
import "./Navbar.css";
import uowLogo from "../assets/uow-logo.png";

function Navbar() {
  return (
    <nav className="navbar">

      
      <div className="nav-left">
        <img src={uowLogo} alt="Waste Saver logo" className="nav-logo-img" />
        <span className="nav-title">Waste Saver</span>
      </div>

      {/* Navigation links */}
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/portal">Student Portal</Link></li>
        <li><Link to="/uni-alerts">Food Alerts</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

    </nav>
  );
}

export default Navbar;
