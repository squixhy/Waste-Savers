import { Link, useNavigate } from "react-router-dom";
import "./StudentPortal.css";
import { useState, useEffect } from "react";
import { students } from "../data/students";
import StudentCard from "../components/StudentCard";

function StudentPortal() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  
  const [alerts, setAlerts] = useState([]);

  
  useEffect(() => {
    fetch("https://improved-fiesta-q7545vq5x9r7h4464-5000.app.github.dev/alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.course.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || student.accommodation === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="portal-container">

      <button className="back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <header className="portal-banner">
        <h1>Student Portal</h1>
        <p>Search, filter, and explore student information.</p>
      </header>

      {/* University food alerts */}
      <section className="uni-alert-card">
        <Link to="/uni-alerts" className="alert-link">
          <h2>University Food Alerts</h2>
          <p>See surplus food posted by university catering.</p>

          <ul className="alert-list">
            {alerts.length === 0 ? (
              <li>Loading alerts...</li>
            ) : (
              alerts.map((alert) => (
                <li key={alert.id}>{alert.title}</li>
              ))
            )}
          </ul>
        </Link>
      </section>

      
      <section className="controls-row">
        <input
          type="text"
          placeholder="Search by name or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Accommodation</option>
          <option value="West Downs">West Downs</option>
          <option value="Burma Road">Burma Road</option>
          <option value="Queens Road">Queens Road</option>
        </select>
      </section>

      <section className="student-grid">
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </section>

    </main>
  );
}

export default StudentPortal;
