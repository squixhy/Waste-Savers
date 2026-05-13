import "./UniAlerts.css";
import { useNavigate } from "react-router-dom";

function UniAlerts() {
  const navigate = useNavigate();

  return (
    <main className="alerts-container">

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      {/* Banner */}
      <header className="alerts-banner">
        <h1>University Food Alerts</h1>
        <p>Surplus food posted by university catering.</p>
      </header>

      {/* Alerts List */}
      <section className="alerts-list">

        <article className="alert-card">
          <h3>🥐 Free Muffins</h3>
          <p><strong>Location:</strong> West Downs Café</p>
          <p><strong>Available until:</strong> 4pm</p>
        </article>

        <article className="alert-card">
          <h3>🥗 Discounted Salads</h3>
          <p><strong>Location:</strong> SU Shop</p>
          <p><strong>Available until:</strong> 6pm</p>
        </article>

        <article className="alert-card">  
          <h3>🍎 Free Fruit Basket</h3>
          <p><strong>Location:</strong> Library Foyer</p>
          <p><strong>Available until:</strong> While stocks last</p>
        </article>

      </section>

    </main>
  );
}

export default UniAlerts;
