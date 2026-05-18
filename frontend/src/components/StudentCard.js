import "./StudentCard.css";

function StudentCard({ student }) {
  return (
    <article className="student-card">

      <header className="student-header">
        <div className="student-icon">👤</div>
        <h3>{student.name}</h3>
      </header>

      <section className="student-details">
        <p><strong>Course:</strong> {student.course}</p>
        <p><strong>Accommodation:</strong> {student.accommodation}</p>
      </section>

      <time className="updated-badge">
        Updated: {student.lastUpdated}
      </time>

    </article>
  );
}

export default StudentCard;
