import "../pages_css/About.css";

function About() {
  return (
    <main className="about-page">

      
      <header className="about-header">
        <h1>About Waste Saver</h1>
        <p className="subtitle">
          Reducing waste. Supporting students. Building a sustainable future.
        </p>
      </header>

      
      <section className="mission-box">
        <h2>🌍 Our Mission</h2>
        <p>
          Waste Saver was built to address a growing issue not only on campus, but globally.
          It is our mission to reduce food waste and build community through the use of this app,
          inspiring others to make choices that positively impact our environment.
        </p>
      </section>

      
      <section className="about-section">
        <h2>Why It Matters</h2>
        <p>
          Food waste is a global challenge, and students often face the pressure of budgeting,
          meal planning, and managing leftovers. Waste Saver helps reduce unnecessary waste,
          encourages sustainable habits, and supports students who may need access to food.
        </p>
      </section>

      
      <section className="values-section">
        <h2>Our Values</h2>

        <ul className="values-grid">
          <li className="value-card">
            <h3>🤝 Community</h3>
            <p>Students supporting students through shared resources.</p>
          </li>

          <li className="value-card">
            <h3>♻️ Sustainability</h3>
            <p>Reducing waste and promoting eco‑friendly habits.</p>
          </li>

          <li className="value-card">
            <h3>💡 Accessibility</h3>
            <p>Simple, inclusive design for everyone.</p>
          </li>

          <li className="value-card">
            <h3>🌱 Growth</h3>
            <p>Encouraging positive change through small actions.</p>
          </li>
        </ul>
      </section>

      
      <section className="about-section">
        <h2>Future Plans</h2>
        <p>
          As Waste Saver grows, we aim to introduce new features such as real‑time food sharing,
          allergy‑friendly filters, and deeper integration with campus services.
        </p>
      </section>

      
      <footer className="cta-section">
        <h2>Join Us</h2>
        <p>
          Together, we can reduce waste, support one another, and create a more sustainable campus.
        </p>
      </footer>

    </main>
  );
}

export default About;
