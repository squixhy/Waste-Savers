import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/pages_js/Homepage";
import StudentPortal from "./pages/pages_js/StudentPortal";
import UniAlerts from "./pages/pages_js/UniAlerts";
import About from "./pages/pages_js/About";
import "./App.css"

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/portal" element={<StudentPortal />} />
        <Route path="/uni-alerts" element={<UniAlerts />} />
        <Route path="/about" element={<About />} />

      </Routes>
    </Router>
  );
}

export default App;
