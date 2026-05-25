import FoodDiary from "../../components/FoodDiary";
import PlannerBtn from "../../components/PlannerBtn";
import RecipesBtn from "../../components/RecipesBtn";

function Homepage() {
    return (
        <main className="homepage-container">

            <FoodDiary />
            <div style={{display: 'flex', flexDirection: 'row'}} className="food-diary-page-switch-buttons">
                <PlannerBtn />
                <RecipesBtn />
            </div>
        </main>
    );
}

export default Homepage;