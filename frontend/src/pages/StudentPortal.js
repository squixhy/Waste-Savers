import { Link, useNavigate } from "react-router-dom";
import "./StudentPortal.css";
import { useState } from "react";
import { students } from "../data/students";
import StudentCard from "../components/StudentCard";

function StudentPortal() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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

      {/* University Food Alerts */}
      <section className="uni-alert-card">
        <Link to="/uni-alerts" className="alert-link">
          <h2>University Food Alerts</h2>
          <p>See surplus food posted by university catering.</p>

          <ul className="alert-list">
            <li>🥐 Free muffins at West Downs Café until 4pm</li>
            <li>🥗 Discounted salads at SU Shop until 6pm</li>
            <li>🍎 Free fruit basket in the Library foyer</li>
          </ul>
        </Link>
      </section>

      {/* Search and Filter Row */}            
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
