import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FoodDiary from "./pages/pages_js/FoodDiary";
import StudentPortal from "./pages/pages_js/StudentPortal";
import UniAlerts from "./pages/pages_js/UniAlerts";
import About from "./pages/pages_js/About";
import "./App.css"

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<FoodDiary />} />
        <Route path="/portal" element={<StudentPortal />} />
        <Route path="/uni-alerts" element={<UniAlerts />} />
        <Route path="/about" element={<About />} />

      </Routes>
    </Router>
  );
}

export default App;
