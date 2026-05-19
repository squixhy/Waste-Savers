import "../pages_css/Homepage.css";
import { Link } from "react-router-dom";

function Homepage() {

  return (
      <main>
        <div className="homepage-container">
          <h1>Test</h1>
        </div>
        <div className={"scroll-y"}>
          <table className="food_diary-table">
            <thead>
            <tr>
              <th>Food Name</th>
              <th>Date Added</th>
              <th>Expiry Date</th>
              <th>Calories</th>
              <th>Quantity</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Chicken Breast</td>
              <td>2025-05-01</td>
              <td>2025-05-05</td>
              <td>165</td>
              <td>2</td>
              <td>Chicken Breast</td>
              <td>2025-05-01</td>
              <td>2025-05-05</td>
              <td>165</td>
              <td>2</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div className="container">
          <h1>Test</h1>
        </div>
          <Link to="/recipes" className="feature-card recipes">
            <span className="emoji">🍽️</span>
            <h3>Recipe Finder</h3>
            <p>Discover meals and cooking ideas</p>
          </Link>
      </main>
  )
}
//   return (
//     <main className="homepage-container">
//
//
//       <header className="welcome-banner">
//         <h1>Welcome back!</h1>
//         <p>Your student dashboard is ready.</p>
//       </header>
//
//
//       <section className="feature-grid">
//
//         <Link to="/portal" className="feature-card portal">
//           <span className="emoji">🎓</span>
//           <h3>Student Portal</h3>
//           <p>View student details and updates</p>
//         </Link>
//
//         <Link to="/notifications" className="feature-card notifications">
//           <span className="emoji">🔔</span>
//           <h3>Notification Hub</h3>
//           <p>Check alerts and announcements</p>
//         </Link>
//
//         <Link to="/recipes" className="feature-card recipes">
//           <span className="emoji">🍽️</span>
//           <h3>Recipe Finder</h3>
//           <p>Discover meals and cooking ideas</p>
//         </Link>
//
//         <Link to="/food-diary" className="feature-card diary">
//           <span className="emoji">📘</span>
//           <h3>Food Diary</h3>
//           <p>Track meals and nutrition</p>
//         </Link>
//
//       </section>
//
//       {/* About Section */}
//       <Link to="/about" className="about-section clickable-about">
//         <h2>About This App</h2>
//         <p>
//           Learn more about why this app was created and how it supports students
//           and sustainability on campus.
//         </p>
//       </Link>
//
//       {/* Goals Section */}
//       <section className="goals-section">
//         <h2>Our Goals</h2>
//
//         <div className="goals-grid">
//           <article className="goal-card">
//             <h3>🌱 Reduce Waste</h3>
//             <p>Encourage responsible food sharing and reduce unnecessary waste on campus.</p>
//           </article>
//
//           <article className="goal-card">
//             <h3>💸 Save Money</h3>
//             <p>Help students access free or low‑cost meals when they need it most.</p>
//           </article>
//
//           <article className="goal-card">
//             <h3>🤝 Build Community</h3>
//             <p>Create a supportive environment where students help each other.</p>
//           </article>
//
//           <article className="goal-card">
//             <h3>🌍 Promote Sustainability</h3>
//             <p>Support eco‑friendly habits and contribute to a greener campus.</p>
//           </article>
//         </div>
//       </section>
//
//
//       <section className="contact-section">
//         <h2>Contact Us</h2>
//         <p>
//           Whether you have a simple question, need support, or want to report an issue,
//           we’re here to help. Reach out to us anytime.
//         </p>
//
//         <address>
//           <p><strong>Email:</strong> WasteSaverUK@gmail.com</p>
//           <p><strong>Phone:</strong> 01234 567890</p>
//         </address>
//       </section>
//
//     </main>
//   );
// }

export default Homepage;
