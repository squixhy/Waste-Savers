import { useState, useEffect } from "react";

function FoodDiary() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5050/food-diary")
            .then((res) => res.json())
            .then((data) => {
                setFoodItems(data.foodItems); // ← pull out foodItems from response
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch food diary");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="scroll-y">
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
                    <tr>
                        <td colSpan="5">No food items found</td>
                    </tr>
                ) : (
                    foodItems.map((item) => (
                        <tr key={item._id}>
                            <td>{item.food_name}</td>
                            <td>{item.date_added}</td>
                            <td>{item.expiry_date}</td>
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