import FoodDiary from "../../components/FoodDiary"; // adjust path if needed

function Homepage() {
    return (
        <main className="homepage-container">
            {/* your existing homepage content */}

            <FoodDiary />  {/* ← add this wherever you want the table */}
        </main>
    );
}

export default Homepage;