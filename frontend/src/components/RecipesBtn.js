import "../pages/pages_css/Homepage.css"
import React from "react";
import {Link } from "react-router-dom";

function RecipesBtn() {

    return (
        <div>
            <Link to="/recipes"><button>
                Recipes
            </button>
            </Link>
        </div>
    )
}

export default RecipesBtn