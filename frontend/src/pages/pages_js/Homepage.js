import "../pages_css/Homepage.css";
import { Link } from "react-router-dom";

function Homepage() {

  return (
      <main>
        <div className="homepage-container">
          <h1>Test</h1>
        </div>
        <div className={"scroll-y"}>
            <table className={"food_diary-table"}>
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

export default Homepage;
