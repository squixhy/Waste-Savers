import FoodDiary from "../../components/FoodDiary";
import PlannerBtn from "../../components/PlannerBtn";
import RecipesBtn from "../../components/RecipesBtn"; // adjust path if needed

function Homepage() {
    return (
        <main className="homepage-container">

            <FoodDiary />  {/* ← add this wherever you want the table */}
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <PlannerBtn />
                <RecipesBtn />
            </div>
        </main>
    );
}

export default Homepage;