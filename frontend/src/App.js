import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import StudentPortal from "./pages/StudentPortal";
import UniAlerts from "./pages/UniAlerts";
import About from "./pages/About";

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
