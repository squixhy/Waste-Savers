import '../pages/pages_css/Homepage.css'
import '../pages/pages_css/FoodDiary.css'
import { useState, useEffect } from "react";

function FoodDiary() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [mode, setMode] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [foodDiarySort, setFoodDiarySort] = useState({ key: null, direction: "asc" });
    const [breakdownSort, setBreakdownSort] = useState({ key: null, direction: "asc" });
    const [filters, setFilters] = useState({
        name: "",
        expiryDate: "",
        calories: "",
        quantity: "",
    });
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

    const handleEditChange = (e) => {
        setEditingItem({ ...editingItem, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleFoodDiarySort = (key) => {
        setFoodDiarySort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const toggleBreakdownSort = (key) => {
        setBreakdownSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const getSortIcon = (sortState, key) => {
        if (sortState.key !== key) return "↕";
        return sortState.direction === "asc" ? "↑" : "↓";
    };

    const sortValues = (aValue, bValue, direction, type) => {
        let result = 0;
        if (type === "text") {
            result = String(aValue || "").localeCompare(String(bValue || ""));
        } else if (type === "date") {
            result = new Date(aValue || 0) - new Date(bValue || 0);
        } else {
            result = Number(aValue || 0) - Number(bValue || 0);
        }
        return direction === "asc" ? result : -result;
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
        if (mode === 'delete') {
            if (window.confirm("Delete?")) {
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
                // find the updated group by name and refresh the breakdown panel
                const updatedGroup = data.ingredients.find(
                    (f) => f.name.toLowerCase() === editingItem.name.toLowerCase()
                );
                setSelectedItem(updatedGroup || null);
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

    const filteredFoodItems = foodItems.filter((item) => {
        const itemName = item.name?.toLowerCase() || "";
        const itemExpiryDate = item.expiryDate ? item.expiryDate.slice(0, 10) : "";
        const itemCalories = item.calories?.toString() || "";
        const itemQuantity = item.quantity?.toString() || "";

        return (
            itemName.includes(filters.name.toLowerCase()) &&
            itemExpiryDate.includes(filters.expiryDate) &&
            itemCalories.includes(filters.calories) &&
            itemQuantity.includes(filters.quantity)
        );
    });

    const sortedFoodItems = [...filteredFoodItems].sort((a, b) => {
        if (!foodDiarySort.key) return 0;

        const sortTypes = {
            name: "text",
            expiryDate: "date",
            calories: "number",
            quantity: "number",
        };

        return sortValues(
            a[foodDiarySort.key],
            b[foodDiarySort.key],
            foodDiarySort.direction,
            sortTypes[foodDiarySort.key]
        );
    });

    const sortedBreakdownEntries = selectedItem?.entries
        ? [...selectedItem.entries].sort((a, b) => {
            if (!breakdownSort.key) return 0;

            const sortTypes = {
                dateAdded: "date",
                expiryDate: "date",
                calories: "number",
                quantity: "number",
            };

            return sortValues(
                a[breakdownSort.key],
                b[breakdownSort.key],
                breakdownSort.direction,
                sortTypes[breakdownSort.key]
            );
        })
        : [];

    if (loading) return <p>Loading...</p>;

    return (
        <div className="foodDiary-container">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button className="add-btn" onClick={() => { setShowForm(!showForm); setMode(null);
                    setEditingItem(null); }}>
                    + Add Food Item
                </button>
                <button className={`add-btn ${mode === 'delete' ? 'active-mode-delete' : ''}`} onClick={() =>
                    toggleMode('delete')}>
                    Delete
                </button>
                <button className="add-btn" onClick={() => setShowFilters(!showFilters)}>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>

            {showForm && (
                <div className="food-form">
                    <input name="name" placeholder="Food Name" onChange={handleChange} value={newItem.name} />
                    <input name="expiryDate" placeholder="Expiry Date" onChange={handleChange}
                           value={newItem.expiryDate} type="date" />
                    <input name="calories" placeholder="Calories" onChange={handleChange}
                           value={newItem.calories} type="number" />
                    <input name="quantity" placeholder="Quantity" onChange={handleChange}
                           value={newItem.quantity} type="number" />
                    <button onClick={handleSubmit}>Save</button>
                    <button onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            )}

            {selectedItem && selectedItem.entries ? (
                <div className="panel">
                    <div className="table-scroll">
                        {editingItem ? (
                            <>
                                <h3>{selectedItem.name} — Edit Entry</h3>
                                <table className="food_diary-table">
                                    <thead>
                                    <tr>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("dateAdded")}>
                                            Date Added {getSortIcon(breakdownSort, "dateAdded")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("expiryDate")}>
                                            Expiry Date {getSortIcon(breakdownSort, "expiryDate")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("calories")}>
                                            Calories {getSortIcon(breakdownSort, "calories")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("quantity")}>
                                            Quantity {getSortIcon(breakdownSort, "quantity")}
                                        </th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedBreakdownEntries.map((entry) => (
                                        entry._id === editingItem._id ? (
                                            <tr key={entry._id}>
                                                <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                                <td><input name="expiryDate" type="date" onChange={handleEditChange} value={editingItem.expiryDate?.slice(0, 10)} /></td>
                                                <td><input name="calories" type="number" onChange={handleEditChange} value={editingItem.calories} /></td>
                                                <td><input name="quantity" type="number" onChange={handleEditChange} value={editingItem.quantity} /></td>
                                                <td>
                                                    <button onClick={handleEditSave}>Save</button>
                                                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={entry._id}>
                                                <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                                <td>{entry.expiryDate ? new Date(entry.expiryDate).toLocaleDateString() : ""}</td>
                                                <td>{entry.calories}</td>
                                                <td>{entry.quantity}</td>
                                                <td></td>
                                            </tr>
                                        )
                                    ))}
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td>Total</td>
                                        <td></td>
                                        <td></td>
                                        <td>{selectedItem.quantity}</td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <>
                                <h3>{selectedItem.name} — Breakdown</h3>
                                <table className="food_diary-table">
                                    <thead>
                                    <tr>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("dateAdded")}>
                                            Date Added {getSortIcon(breakdownSort, "dateAdded")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("expiryDate")}>
                                            Expiry Date {getSortIcon(breakdownSort, "expiryDate")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("calories")}>
                                            Calories {getSortIcon(breakdownSort, "calories")}
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("quantity")}>
                                            Quantity {getSortIcon(breakdownSort, "quantity")}
                                        </th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedBreakdownEntries.map((entry) => (
                                        <tr key={entry._id}>
                                            <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                            <td>{entry.expiryDate ? new Date(entry.expiryDate).toLocaleDateString() : ""}</td>
                                            <td>{entry.calories}</td>
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
                                        <td></td>
                                        <td></td>
                                        <td>{selectedItem.quantity}</td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        )}
                        <button onClick={() => { setSelectedItem(null); setEditingItem(null); }}>Close</button>
                    </div>

                </div>
            ) : (
                <div className="panel">
                    {showFilters && (
                        <div className="filter-row">
                            <input
                                name="name"
                                placeholder="Filter by food name"
                                value={filters.name}
                                onChange={handleFilterChange}
                            />
                            <input
                                name="expiryDate"
                                type="date"
                                value={filters.expiryDate}
                                onChange={handleFilterChange}
                            />
                            <input
                                name="calories"
                                type="number"
                                placeholder="Filter by calories"
                                value={filters.calories}
                                onChange={handleFilterChange}
                            />
                            <input
                                name="quantity"
                                type="number"
                                placeholder="Filter by quantity"
                                value={filters.quantity}
                                onChange={handleFilterChange}
                            />
                            <button onClick={() => setFilters({ name: "", expiryDate: "", calories: "", quantity: "" })}>
                                Clear Filters
                            </button>
                        </div>
                    )}

                    <div className="table-scroll">
                        <table className="food_diary-table">
                            <thead>
                            <tr>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("name")}>
                                    Food Name {getSortIcon(foodDiarySort, "name")}
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("expiryDate")}>
                                    Expiry Date {getSortIcon(foodDiarySort, "expiryDate")}
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("calories")}>
                                    Calories {getSortIcon(foodDiarySort, "calories")}
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("quantity")}>
                                    Quantity {getSortIcon(foodDiarySort, "quantity")}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedFoodItems.length === 0 ? (
                                <tr><td colSpan="4">No food items found</td></tr>
                            ) : (
                                sortedFoodItems.map((item) => (
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
                    </div>

                </div>

            )
            }
        </div>
    );
}

export default FoodDiary;