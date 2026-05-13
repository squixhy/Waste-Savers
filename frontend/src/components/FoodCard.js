import "./FoodCard.css";
import { Link } from "react-router-dom";

function FoodCard({ post }) {
  return (
    <article className="food-card">
      <Link to={`/food/${post.id}`} className="food-link">

        <img 
          src={post.image} 
          alt={post.title} 
          className="food-image" 
        />

        <section className="food-info">
          <h3>{post.title}</h3>

          <p><strong>Posted by:</strong> {post.postedBy}</p>
          <p><strong>Location:</strong> {post.location}</p>

          <ul className="tags">
            {post.tags.map((tag, index) => (
              <li key={index} className="tag">{tag}</li>
            ))}
          </ul>

          <time className="expiry-badge">
            Expires: {post.expires}
          </time>
        </section>

      </Link>
    </article>
  );
}

export default FoodCard;
