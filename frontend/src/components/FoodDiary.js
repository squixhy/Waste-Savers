import '../pages/pages_css/Homepage.css'
import '../pages/pages_css/FoodDiary.css'
import { useState, useEffect } from "react";

function FoodDiary() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState(null); // 'edit' | 'delete' | null
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
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
                console.log(JSON.stringify(data, null, 2));
                setFoodItems(data.ingredients);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to fetch food diary");
                setLoading(false);
            });
    }, []);

    // useEffect(() => {
    //     fetch("http://localhost:5050/food-diary")
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setFoodItems(data.ingredients);
    //             setLoading(false);
    //         })
    //         .catch((err) => {
    //             setError("Failed to fetch food diary");
    //             setLoading(false);
    //         });
    // }, []);

    const handleChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditingItem({ ...editingItem, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!newItem.name || !newItem.expiryDate || !newItem.calories || !newItem.quantity) {
            alert("Please fill in all fields");
            return;
        }

        fetch("http://localhost:5050/food-diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
        })
            .then((res) => res.json())
            .then(() => {
                return fetch("http://localhost:5050/food-diary");
            })
            .then((res) => res.json())
            .then((data) => {
                setFoodItems(data.ingredients);
                setShowForm(false);
                setNewItem({ name: "", expiryDate: "", calories: "", quantity: "" });
            })
            .catch(() => alert("Failed to add item"));
    };

    const handleRowClick = (item) => {
        if (mode === 'edit') {
            setEditingItem({ ...item });
        } else if (mode === 'delete') {
            if (window.confirm("Delete?")) {
                // delete all entries with matching name/expiry/calories
                Promise.all(
                    item.entries.map((entry) =>
                        fetch(`http://localhost:5050/food-diary/${entry._id}`, { method: "DELETE" })
                    )
                )
                    .then(() => {
                        setFoodItems(foodItems.filter((f) => f._id !== item._id));
                        setSelectedItem(null);
                    })
                    .catch(() => alert("Failed to delete item"));
            }
        } else {
            setSelectedItem(item._id === selectedItem?._id ? null : item);
        }
    };

    const handleEditSave = () => {
        fetch(`http://localhost:5050/food-diary/${editingItem._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingItem),
        })
            .then(() => {
                return fetch("http://localhost:5050/food-diary");
            })
            .then((res) => res.json())
            .then((data) => {
                setFoodItems(data.ingredients);
                setEditingItem(null);
                setMode(null);
            })
            .catch(() => alert("Failed to update item"));
    };

    const toggleMode = (selected) => {
        setMode((prev) => prev === selected ? null : selected);
        setEditingItem(null);
        setShowForm(false);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="scroll-y foodDiary-container">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button className="add-btn" onClick={() => { setShowForm(!showForm); setMode(null); setEditingItem(null); }}>
                    + Add Food Item
                </button>
                <button className={`add-btn ${mode === 'delete' ? 'active-mode-delete' : ''}`} onClick={() => toggleMode('delete')}>
                    Delete
                </button>
            </div>

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

            {editingItem && (
                <div className="food-form">
                    <input name="name" placeholder="Food Name" onChange={handleEditChange} value={editingItem.name} />
                    <input name="expiryDate" placeholder="Expiry Date" onChange={handleEditChange} value={editingItem.expiryDate} type="date" />
                    <input name="calories" placeholder="Calories" onChange={handleEditChange} value={editingItem.calories} type="number" />
                    <input name="quantity" placeholder="Quantity" onChange={handleEditChange} value={editingItem.quantity} type="number" />
                    <button onClick={handleEditSave}>Save Changes</button>
                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                </div>
            )}

            <table className="food_diary-table">
                <thead>
                <tr>
                    <th>Food Name</th>
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
                        <tr
                            key={item._id}
                            onClick={() => handleRowClick(item)}
                            style={{ cursor: mode ? 'pointer' : 'default' }}
                        >
                            <td>{item.name}</td>
                            <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : ""}</td>
                            <td>{item.calories}</td>
                            <td>{item.quantity}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            {selectedItem && selectedItem.entries && (
                <div className="breakdown-panel">
                    <h3>{selectedItem.name} — Breakdown</h3>
                    <table className="food_diary-table">
                        <thead>
                        <tr>
                            <th>Date Added</th>
                            <th>Quantity</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedItem.entries.map((entry) => (
                            <tr key={entry._id}>
                                <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                <td>{entry.quantity}</td>
                                <td>
                                    <button onClick={() => setEditingItem({ ...selectedItem, ...entry, _id: entry._id })}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold' }}>
                            <td>Total</td>
                            <td>{selectedItem.quantity}</td>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                    <button onClick={() => { setSelectedItem(null); setEditingItem(null)}}>Close</button>
                </div>
            )}
        </div>
    );
}

export default FoodDiary;