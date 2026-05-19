import "../pages_css/Recipes.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function Recipes() {
  const navigate = useNavigate();

  const [canMake, setCanMake] = useState([]);
  const [closeTo, setCloseTo] = useState([]);
  const [fridgeEmpty, setFridgeEmpty] = useState(false);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`${API_URL}/recipes`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setCanMake(data.canMake || []);
        setCloseTo(data.closeTo || []);
        setFridgeEmpty(Boolean(data.fridgeEmpty));
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    function onKey(e) { if (e.key === "Escape") closeModal(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  async function openRecipe(recipe) {
    setSelected(recipe);
    setDetail(null);
    setDetailStatus("loading");
    setDetailError("");
    try {
      const res = await fetch(`${API_URL}/recipes/${recipe.id}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setDetail(data);
      setDetailStatus("ready");
    } catch (err) {
      setDetailError(err.message);
      setDetailStatus("error");
    }
  }

  function closeModal() {
    setSelected(null);
    setDetail(null);
    setDetailStatus("idle");
  }

  return (
    <main className="recipes-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>

      {status === "loading" && <p className="recipes-status">Finding recipes…</p>}
      {status === "error" && (
        <p className="recipes-status recipes-status--error">
          Couldn't load recipes: {errorMessage}
        </p>
      )}
      {status === "ready" && fridgeEmpty && (
        <p className="recipes-status">
          Your fridge is empty. Add some ingredients to discover recipes.
        </p>
      )}

      {status === "ready" && !fridgeEmpty && (
        <>
          <section className="recipes-section">
            <header className="recipes-hero recipes-hero--make">
              <h1>Foods you can make</h1>
              <p>{canMake.length} recipes ready with what you have.</p>
            </header>
            {canMake.length > 0 ? (
              <div className="recipes-grid">
                {canMake.map((r) => (
                  <RecipeCard key={r.id} recipe={r} onClick={() => openRecipe(r)} />
                ))}
              </div>
            ) : (
              <p className="recipes-status">No exact matches yet — check the section below.</p>
            )}
          </section>

          <section className="recipes-section">
            <header className="recipes-hero recipes-hero--close">
              <h1>Foods you can nearly make</h1>
              <p>{closeTo.length} recipes within 3 ingredients of your fridge.</p>
            </header>
            {closeTo.length > 0 ? (
              <div className="recipes-grid">
                {closeTo.map((r) => (
                  <RecipeCard key={r.id} recipe={r} onClick={() => openRecipe(r)} />
                ))}
              </div>
            ) : (
              <p className="recipes-status">Nothing close right now.</p>
            )}
          </section>
        </>
      )}

      {selected && (
        <RecipeModal
          summary={selected}
          detail={detail}
          status={detailStatus}
          error={detailError}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

function RecipeCard({ recipe, onClick }) {
  return (
    <button className="recipe-card" type="button" onClick={onClick}>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      )}
      <h3>{recipe.title}</h3>
      <p className="recipe-meta">
        Uses {recipe.usedIngredientCount} • Missing {recipe.missedIngredientCount}
      </p>
    </button>
  );
}

function RecipeModal({ summary, detail, status, error, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {summary.image && (
          <img src={summary.image} alt={summary.title} className="modal-image" />
        )}
        <h2>{summary.title}</h2>

        {status === "loading" && <p>Loading recipe details…</p>}
        {status === "error" && (
          <p className="recipes-status recipes-status--error">Couldn't load details: {error}</p>
        )}

        {status === "ready" && detail && (
          <>
            {detail.readyInMinutes != null && (
              <p><strong>Ready in:</strong> {detail.readyInMinutes} mins · Serves {detail.servings}</p>
            )}

            <h3>Ingredients</h3>
            <ul className="ingredients-list">
              {detail.extendedIngredients?.map((ing, i) => (
                <li key={`${ing.id}-${i}`}>{ing.original}</li>
              ))}
            </ul>

            <h3>Instructions</h3>
            {detail.instructions ? (
              <div
                className="instructions"
                dangerouslySetInnerHTML={{ __html: detail.instructions }}
              />
            ) : (
              <p>No written instructions.</p>
            )}

            {detail.sourceUrl && (
              <p>
                <a href={detail.sourceUrl} target="_blank" rel="noreferrer">
                  View original recipe →
                </a>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Recipes;