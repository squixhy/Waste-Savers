import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/pages_js/HomePage";
import StudentPortal from "./pages/pages_js/StudentPortal";
import UniAlerts from "./pages/pages_js/UniAlerts";
import About from "./pages/pages_js/About";
import Recipes from "./pages/pages_js/Recipes";
import "./App.css"

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portal" element={<StudentPortal />} />
        <Route path="/uni-alerts" element={<UniAlerts />} />
        <Route path="/about" element={<About />} />
        <Route path='/recipes' element={<Recipes />} />

      </Routes>
    </Router>
  );
}

export default App;
