import '../pages/pages_css/Homepage.css'
import '../pages/pages_css/FoodDiary.css'
import { useState, useEffect } from "react";

function FoodDiary() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        expiryDate: "",
        calories: "",
        quantity: "",
    });

    useEffect(() => {
        fetch("http://localhost:5050/food-diary")
            .then((res) => res.json())
            .then((data) => {
                setFoodItems(data.ingredients);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch food diary");
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        fetch("http://localhost:5050/food-diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
        })
            .then((res) => res.json())
            .then((saved) => {
                setFoodItems([...foodItems, saved]);
                setShowForm(false);
                setNewItem({ name: "", expiryDate: "", calories: "", quantity: "" });
            })
            .catch(() => alert("Failed to add item"));
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="scroll-y foodDiary-container">
            <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                + Add Food Item
            </button>

            {showForm && (
                <div className="food-form">
                    <input name="name" placeholder="Food Name" onChange={handleChange} value={newItem.name} />

                    <input name="expiryDate" placeholder="Expiry Date" onChange={handleChange} value={newItem.expiryDate} type="date" />

                    <input name="calories" placeholder="Calories" onChange={handleChange} value={newItem.calories} type="number" />

                    <input name="quantity" placeholder="Quantity" onChange={handleChange} value={newItem.quantity} type="number" />
                    <button onClick={handleSubmit}>Save</button>
                    <button onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            )}

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
                {foodItems.length === 0 ? (
                    <tr><td colSpan="5">No food items found</td></tr>
                ) : (
                    foodItems.map((item) => (
                        <tr key={item._id}>
                            <td>{item.name}</td>
                            <td>{new Date(item.dateAdded).toLocaleDateString()}</td>
                            <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : ""}</td>
                            <td>{item.calories}</td>
                            <td>{item.quantity}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

        </div>
    );
}

export default FoodDiary;