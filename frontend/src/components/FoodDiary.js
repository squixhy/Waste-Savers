import '../pages/pages_css/Homepage.css'
import '../pages/pages_css/FoodDiary.css'
import { useState, useEffect, useRef } from "react";

function FoodDiary() {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isClosingForm, setIsClosingForm] = useState(false);
    const [isClosingFilters, setIsClosingFilters] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isClosingSettings, setIsClosingSettings] = useState(false);
    const settingsWrapperRef = useRef(null);    const [mode, setMode] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [foodDiarySort, setFoodDiarySort] = useState({ key: null, direction: "asc" });
    const [breakdownSort, setBreakdownSort] = useState({ key: null, direction: "asc" });
    const [manualPortionFallback, setManualPortionFallback] = useState(false);
    const [caloriesPer100g, setCaloriesPer100g] = useState(null);
    const [calorieLoading, setCalorieLoading] = useState(false);
    const [autoFillEnabled, setAutoFillEnabled] = useState(true);
    const [filters, setFilters] = useState({
        name: "",
        expiryDate: "",
        calories: "",
        portions: "",
    });
    const [newItem, setNewItem] = useState({
        name: "",
        expiryDate: "",
        totalWeight: "",
        unit: "g",
        portionSize: "",
        portions: "",
        calories: "",
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

    useEffect(() => {
        const handleKeyboardActions = (e) => {
            const activeElement = document.activeElement;
            const isTypingInField = activeElement && (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.tagName === "SELECT"
            );

            if (e.key === "Backspace" && !isTypingInField) {
                if (showFilters) {
                    e.preventDefault();
                    closeFilters();
                    return;
                }

                if (editingItem || selectedItem) {
                    e.preventDefault();
                    setSelectedItem(null);
                    setEditingItem(null);
                    return;
                }

                if (showForm) {
                    e.preventDefault();
                    cancelAddFood();
                    return;
                }
            }

            if (e.key === "Enter") {
                if (editingItem) {
                    e.preventDefault();
                    handleEditSave();
                    return;
                }

                if (showForm) {
                    e.preventDefault();
                    handleSubmit();
                }
            }
        };

        window.addEventListener("keydown", handleKeyboardActions);

        return () => {
            window.removeEventListener("keydown", handleKeyboardActions);
        };
    });

    useEffect(() => {
        const handleClickOutsideSettings = (e) => {
            if (!showSettings || isClosingSettings) {
                return;
            }

            if (settingsWrapperRef.current && !settingsWrapperRef.current.contains(e.target)) {
                closeSettings();
            }
        };

        document.addEventListener("mousedown", handleClickOutsideSettings);

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSettings);
        };
    }, [showSettings, isClosingSettings]);

    useEffect(() => {
        if (!autoFillEnabled) {
            return;
        }

        if (!newItem.name || !newItem.totalWeight || !newItem.unit) {
            setNewItem((prev) => ({
                ...prev,
                portionSize: "",
                portions: "",
                calories: "",
            }));
            return;
        }

        const controller = new AbortController();

        setCalorieLoading(true);

        fetch(
            `http://localhost:5050/food-diary/calories?name=${encodeURIComponent(newItem.name)}&amount=${encodeURIComponent(newItem.totalWeight)}&unit=${encodeURIComponent(newItem.unit)}`,
            { signal: controller.signal }
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to calculate calories");
                }
                return res.json();
            })
            .then((data) => {
                setCaloriesPer100g(Number(data.caloriesPer100g) || null);

                const shouldUseManualFallback =
                    !data.recommendedPortionSize ||
                    (data.portionSource === "fallback" && newItem.unit !== "ml");

                if (shouldUseManualFallback) {
                    setManualPortionFallback(true);

                    setNewItem((prev) => ({
                        ...prev,
                        portionSize: "",
                        portions: "",
                        calories: "",
                    }));

                    return;
                }

                setManualPortionFallback(false);

                const recommendedPortionSize = Number(data.recommendedPortionSize);
                const calculatedPortions = Number(newItem.totalWeight) / recommendedPortionSize;

                setNewItem((prev) => ({
                    ...prev,
                    portionSize: recommendedPortionSize.toString(),
                    portions: calculatedPortions.toFixed(1),
                    calories: data.caloriesPerRecommendedPortion?.toString() || data.calories?.toString() || "",
                }));
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Failed to auto-fill calories:", err);
                    setManualPortionFallback(true);
                    setNewItem((prev) => ({
                        ...prev,
                        portionSize: "",
                        portions: "",
                        calories: "",
                    }));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setCalorieLoading(false);
                }
            });

        return () => controller.abort();
    }, [autoFillEnabled, newItem.name, newItem.totalWeight, newItem.unit]);

    const resetNewItem = () => {
        setNewItem({
            name: "",
            expiryDate: "",
            totalWeight: "",
            unit: "g",
            portionSize: "",
            portions: "",
            calories: "",
        });
        setAutoFillEnabled(true);
        setCalorieLoading(false);
        setManualPortionFallback(false);
        setCaloriesPer100g(null);
    };

    const cancelAddFood = () => {
        setIsClosingForm(true);

        setTimeout(() => {
            setShowForm(false);
            setIsClosingForm(false);
            resetNewItem();
        }, 250);
    };

    const hideAddFoodImmediately = () => {
        setShowForm(false);
        setIsClosingForm(false);
        resetNewItem();
    };

    const closeFilters = () => {
        setIsClosingFilters(true);

        setTimeout(() => {
            setShowFilters(false);
            setIsClosingFilters(false);
        }, 250);
    };

    const closeSettings = () => {
        if (!showSettings || isClosingSettings) {
            return;
        }

        setIsClosingSettings(true);

        setTimeout(() => {
            setShowSettings(false);
            setIsClosingSettings(false);
        }, 250);
    };

    const isIntegerValue = (value) => {
        return /^\d+$/.test(value);
    };

    const isValidPortionSize = (value) => {
        return /^\d+(\.\d{1,2})?$/.test(value);
    };

    const blockDecimalKey = (e) => {
        if (e.key === ".") {
            e.preventDefault();
        }
    };

    const noExpiryDateValue = "9999-12-31";

    const formatExpiryDate = (expiryDate) => {
        if (!expiryDate) return "";

        const dateOnly = expiryDate.slice(0, 10);

        if (dateOnly === noExpiryDateValue) {
            return "No Expiry";
        }

        return new Date(expiryDate).toLocaleDateString();
    };

    const getExpiryStatusClass = (expiryDate) => {
        if (!expiryDate) return "";

        const dateOnly = expiryDate.slice(0, 10);

        if (dateOnly === noExpiryDateValue) {
            return "expiry-fine";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(dateOnly);
        expiry.setHours(0, 0, 0, 0);

        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 3) {
            return "expiry-alert";
        }

        if (daysUntilExpiry <= 7) {
            return "expiry-warning";
        }

        return "expiry-fine";
    };

    const formatTotalAmount = (amount, unit) => {
        if (amount === undefined || amount === null || amount === "") {
            return "";
        }

        const roundedAmount = Number(amount).toFixed(1);
        const displayAmount = roundedAmount.endsWith(".0")
            ? parseInt(roundedAmount, 10).toString()
            : roundedAmount;

        return `${displayAmount}${unit || ""}`;
    };

    const formatPortions = (portions) => {
        if (portions === undefined || portions === null || portions === "") {
            return "";
        }

        return Number(portions).toFixed(1);
    };

    const setNewItemNoExpiry = () => {
        setNewItem((prev) => ({
            ...prev,
            expiryDate: noExpiryDateValue,
        }));
    };

    const setEditingItemNoExpiry = () => {
        setEditingItem((prev) => ({
            ...prev,
            expiryDate: noExpiryDateValue,
        }));
    };

    const clearNewItemNoExpiry = () => {
        if (newItem.expiryDate === noExpiryDateValue) {
            setNewItem((prev) => ({
                ...prev,
                expiryDate: "",
            }));
        }
    };

    const clearEditingItemNoExpiry = () => {
        if (editingItem?.expiryDate?.slice(0, 10) === noExpiryDateValue) {
            setEditingItem((prev) => ({
                ...prev,
                expiryDate: "",
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === "totalWeight" || name === "calories") && value !== "" && !isIntegerValue(value)) {
            return;
        }

        if (name === "portionSize" && value !== "" && !isValidPortionSize(value)) {
            return;
        }

        setNewItem((prev) => {
            const updatedItem = { ...prev, [name]: value };

            if ((name === "totalWeight" || name === "portionSize") && updatedItem.totalWeight && updatedItem.portionSize) {
                const calculatedPortions = Number(updatedItem.totalWeight) / Number(updatedItem.portionSize);
                updatedItem.portions = calculatedPortions.toFixed(1);
            }

            if (autoFillEnabled && manualPortionFallback && name === "portionSize") {
                if (!value || !updatedItem.totalWeight) {
                    return {
                        ...updatedItem,
                        portions: "",
                        calories: "",
                    };
                }

                const calculatedPortions = Number(updatedItem.totalWeight) / Number(value);
                const calculatedCalories = caloriesPer100g
                    ? (Number(caloriesPer100g) / 100) * Number(value)
                    : "";

                return {
                    ...updatedItem,
                    portions: calculatedPortions.toFixed(1),
                    calories: updatedItem.calories || (calculatedCalories === ""
                        ? ""
                        : Math.round(calculatedCalories).toString()),
                };
            }

            if (autoFillEnabled && (name === "unit" || name === "totalWeight" || name === "name")) {
                if (!updatedItem.name || !updatedItem.totalWeight || !updatedItem.unit) {
                    return {
                        ...updatedItem,
                        portionSize: "",
                        portions: "",
                        calories: "",
                    };
                }

                return {
                    ...updatedItem,
                    portionSize: "",
                    portions: "",
                    calories: "",
                };
            }

            return updatedItem;
        });
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
        if (sortState.key !== key) return "";
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
        if (
            !newItem.name ||
            !newItem.expiryDate ||
            !newItem.totalWeight ||
            !newItem.unit ||
            !newItem.portionSize ||
            !newItem.portions ||
            !newItem.calories
        ) {
            alert("Please fill in all fields");
            return;
        }

        if (!isIntegerValue(newItem.totalWeight) || !isIntegerValue(newItem.calories)) {
            alert("Weight/volume and calories must be whole numbers");
            return;
        }

        if (!isValidPortionSize(newItem.portionSize)) {
            alert("Portion size must be a whole number, .5, or .25 only");
            return;
        }

        const itemToSave = {
            name: newItem.name,
            expiryDate: newItem.expiryDate,
            calories: newItem.calories,
            portions: (Number(newItem.totalWeight) / Number(newItem.portionSize)).toString(),
            portionSize: newItem.portionSize,
            unit: newItem.unit,
        };

        fetch("http://localhost:5050/food-diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemToSave),
        })
            .then((res) => res.json())
            .then(() => {
                return fetch("http://localhost:5050/food-diary");
            })
            .then((res) => res.json())
            .then((data) => {
                setFoodItems(data.ingredients);
                cancelAddFood();
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
            setShowForm(false);
            setIsClosingForm(false);
            setShowFilters(false);
            setIsClosingFilters(false);
            resetNewItem();
            setSelectedItem(item._id === selectedItem?._id ? null : item);
        }
    };

    const handleBreakdownRowClick = (entry) => {
        if (mode !== 'delete') {
            return;
        }

        if (window.confirm("Delete this entry?")) {
            fetch(`http://localhost:5050/food-diary/${entry._id}`, { method: "DELETE" })
                .then(() => fetch("http://localhost:5050/food-diary"))
                .then((res) => res.json())
                .then((data) => {
                    setFoodItems(data.ingredients);

                    const updatedGroup = data.ingredients.find(
                        (item) => item._id === selectedItem._id
                    );

                    setSelectedItem(updatedGroup || null);
                    setEditingItem(null);
                })
                .catch(() => alert("Failed to delete item"));
        }
    };

    const handleEditSave = () => {
        if (
            !editingItem.name ||
            !editingItem.expiryDate ||
            !editingItem.calories ||
            !editingItem.portions ||
            !editingItem.portionSize ||
            !editingItem.unit
        ) {
            alert("Please fill in all fields before saving changes");
            return;
        }

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
        const itemPortions = item.portions?.toString() || "";

        return (
            itemName.includes(filters.name.toLowerCase()) &&
            itemExpiryDate.includes(filters.expiryDate) &&
            itemCalories.includes(filters.calories) &&
            itemPortions.includes(filters.portions)
        );
    });

    const sortedFoodItems = [...filteredFoodItems].sort((a, b) => {
        if (!foodDiarySort.key) return 0;

        const sortTypes = {
            name: "text",
            expiryDate: "date",
            calories: "number",
            portions: "number",
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
                portions: "number",
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
            <div className="foodDiary-controls" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button className={`add-btn ${selectedItem ? "hidden-control-btn" : ""}`} onClick={() => {
                    if (showForm) {
                        cancelAddFood();
                    } else {
                        if (showFilters) {
                            closeFilters();
                        }

                        setIsClosingForm(false);
                        setShowForm(true);
                        setMode(null);
                        setEditingItem(null);
                    }
                }}>
                    {showForm ? "Cancel" : "+ Add Food Item"}
                </button>
                <button className={`add-btn ${mode === 'delete' ? 'active-mode-delete' : ''}`} onClick={() =>
                    toggleMode('delete')}>
                    Delete
                </button>
                <button className="add-btn" onClick={() => {
                    if (showFilters) {
                        closeFilters();
                    } else {
                        if (showForm) {
                            hideAddFoodImmediately();
                        }

                        setIsClosingFilters(false);
                        setShowFilters(true);
                        setMode(null);
                        setEditingItem(null);
                    }
                }}>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <div className="settings-wrapper" ref={settingsWrapperRef}>
                    <button
                        className="settings-btn"
                        type="button"
                        onClick={() => {
                            if (showSettings) {
                                closeSettings();
                            } else {
                                setIsClosingSettings(false);
                                setShowSettings(true);
                            }
                        }}
                    >
                        Settings
                    </button>

                    {showSettings && (
                        <div className={`settings-pane ${isClosingSettings ? "settings-pane-closing" : "settings-pane-opening"}`}>
                            Settings
                        </div>
                    )}
                </div>
            </div>
            <div className="food-form-slot">
                {showForm && (
                    <div className={`food-form ${isClosingForm ? "food-form-closing" : "food-form-opening"}`}>
                        <label className="food-form-field">
                            <span>Food Name</span>
                            <input name="name" placeholder="Food Name" onChange={handleChange} value={newItem.name} />
                        </label>

                        <label className="food-form-field">
                            <span>Expiry Date</span>
                            <div className="expiry-input-row">
                                {newItem.expiryDate === noExpiryDateValue ? (
                                    <input value="No Expiry" type="text" readOnly onClick={clearNewItemNoExpiry} />
                                ) : (
                                    <input name="expiryDate" onChange={handleChange} value={newItem.expiryDate} type="date" />
                                )}
                                <button
                                    type="button"
                                    className={`no-expiry-btn ${newItem.expiryDate === noExpiryDateValue ? "hidden-no-expiry-btn" : ""}`}
                                    onClick={setNewItemNoExpiry}
                                >
                                    X
                                </button>
                            </div>
                        </label>

                        <label className="food-form-field">
                            <span>Total Weight / Volume</span>
                            <input
                                name="totalWeight"
                                placeholder="Food Weight"
                                onChange={handleChange}
                                onKeyDown={blockDecimalKey}
                                value={newItem.totalWeight}
                                type="number"
                                step="1"
                                min="0"
                            />
                        </label>

                        <label className="food-form-field">
                            <span>Unit</span>
                            <select name="unit" onChange={handleChange} value={newItem.unit}>
                                <option value="g">g</option>
                                <option value="ml">ml</option>
                            </select>
                        </label>

                        <label className="food-form-field">
                            <span>Portion Size</span>
                            {autoFillEnabled && !manualPortionFallback ? (
                                <div className="auto-filled-display">
                                    {!newItem.name || !newItem.totalWeight
                                        ? "-"
                                        : calorieLoading
                                            ? "Calculating..."
                                            : newItem.portionSize
                                                ? `${newItem.portionSize}${newItem.unit}`
                                                : "-"}
                                </div>
                            ) : (
                                <input
                                    name="portionSize"
                                    placeholder="Enter portion size"
                                    onChange={handleChange}
                                    value={newItem.portionSize}
                                    type="number"
                                    step="0.25"
                                    min="0"
                                />
                            )}
                        </label>

                        <label className="food-form-field">
                            <span>Calories Per Portion</span>
                            {autoFillEnabled && !manualPortionFallback ? (
                                <div className="auto-filled-display">
                                    {!newItem.name || !newItem.totalWeight
                                        ? "-"
                                        : calorieLoading
                                            ? "Calculating..."
                                            : newItem.calories
                                                ? `${newItem.calories} cal`
                                                : "-"}
                                </div>
                            ) : (
                                <input
                                    name="calories"
                                    placeholder="Enter calories per portion"
                                    onChange={handleChange}
                                    onKeyDown={blockDecimalKey}
                                    value={newItem.calories}
                                    type="number"
                                    step="1"
                                    min="0"
                                />
                            )}
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setAutoFillEnabled((prev) => {
                                    const nextValue = !prev;

                                    if (!nextValue) {
                                        setManualPortionFallback(true);
                                        setNewItem((current) => ({
                                            ...current,
                                            portionSize: "",
                                            portions: "",
                                            calories: "",
                                        }));
                                    } else {
                                        setManualPortionFallback(false);
                                    }

                                    return nextValue;
                                });
                            }}
                        >
                            {autoFillEnabled ? "Turn Off Auto Fill" : "Turn On Auto Fill"}
                        </button>
                        <button onClick={handleSubmit}>Save</button>
                    </div>
                )}

                {showFilters && !showForm && (
                    <div className={`food-form filter-form ${selectedItem ? "filter-form-breakdown" : ""} ${isClosingFilters ? "food-form-closing" : "food-form-opening"}`}>
                        <label className="food-form-field">
                            <span>Food Name</span>
                            <input
                                name="name"
                                placeholder="Filter by food name"
                                value={filters.name}
                                onChange={handleFilterChange}
                            />
                        </label>

                        <label className="food-form-field">
                            <span>Expiry Date</span>
                            <input
                                name="expiryDate"
                                type="date"
                                value={filters.expiryDate}
                                onChange={handleFilterChange}
                            />
                        </label>

                        <label className="food-form-field">
                            <span>Calories</span>
                            <input
                                name="calories"
                                type="number"
                                placeholder="Filter by calories"
                                value={filters.calories}
                                onChange={handleFilterChange}
                            />
                        </label>

                        <label className="food-form-field">
                            <span>Portions</span>
                            <input
                                name="portions"
                                type="number"
                                placeholder="Filter by portions"
                                value={filters.portions}
                                onChange={handleFilterChange}
                            />
                        </label>

                        <button onClick={() => setFilters({ name: "", expiryDate: "", calories: "", portions: "" })}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {selectedItem && selectedItem.entries ? (
                <div className="panel breakdown-panel">
                    <div className="table-scroll">
                        {editingItem ? (
                            <>
                                <div className="edit-entry-form">
                                    <label className="food-form-field">
                                        <span>Food Name</span>
                                        <input
                                            name="name"
                                            value={editingItem.name}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <table className="food_diary-table">
                                    <thead>
                                    <tr>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("dateAdded")}>
                                            Date Added <span className="sort-icon">{getSortIcon(breakdownSort, "dateAdded")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("expiryDate")}>
                                            Expiry Date <span className="sort-icon">{getSortIcon(breakdownSort, "expiryDate")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("calories")}>
                                            Calories <span className="sort-icon">{getSortIcon(breakdownSort, "calories")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("portions")}>
                                            Portions <span className="sort-icon">{getSortIcon(breakdownSort, "portions")}</span>
                                        </th>
                                        <th>Portion Amount</th>
                                        <th>Unit</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedBreakdownEntries.map((entry) => (
                                        entry._id === editingItem._id ? (
                                            <tr key={entry._id}>
                                                <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="expiry-input-row table-expiry-input-row">
                                                        {editingItem.expiryDate?.slice(0, 10) === noExpiryDateValue ? (
                                                            <input value="No Expiry" type="text" readOnly required onClick={clearEditingItemNoExpiry} />
                                                        ) : (
                                                            <input name="expiryDate" type="date" onChange={handleEditChange} value={editingItem.expiryDate?.slice(0, 10)} required />
                                                        )}
                                                        <button
                                                            type="button"
                                                            className={`no-expiry-btn ${editingItem.expiryDate?.slice(0, 10) === noExpiryDateValue ? "hidden-no-expiry-btn" : ""}`}
                                                            onClick={setEditingItemNoExpiry}
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                </td>
                                                <td><input name="calories" type="number" onChange={handleEditChange} value={editingItem.calories} required /></td>
                                                <td><input name="portions" type="number" onChange={handleEditChange} value={editingItem.portions} required /></td>
                                                <td><input name="portionSize" type="number" onChange={handleEditChange} value={editingItem.portionSize} required /></td>
                                                <td>
                                                    <select name="unit" onChange={handleEditChange} value={editingItem.unit} required>
                                                        <option value="">Select</option>
                                                        <option value="g">g</option>
                                                        <option value="ml">ml</option>
                                                    </select>
                                                </td>
                                                <td></td>
                                                <td>
                                                    <button onClick={handleEditSave}>Save</button>
                                                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr
                                                key={entry._id}
                                                className={mode === 'delete' ? 'delete-mode-row' : ''}
                                                onClick={() => handleBreakdownRowClick(entry)}
                                                style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
                                            >
                                                <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                                <td className={getExpiryStatusClass(entry.expiryDate)}>
                                                    {formatExpiryDate(entry.expiryDate)}
                                                </td>                                                <td>{entry.calories}</td>
                                                <td>{formatPortions(entry.portions)}</td>
                                                <td>{entry.portionSize ? `${entry.portionSize}${entry.unit}` : ""}</td>
                                                <td>{entry.unit || ""}</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        )
                                    ))}
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td>Total Portions</td>
                                        <td></td>
                                        <td></td>
                                        <td>{formatPortions(selectedItem.portions)}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <>
                                <h3 className="breakdown-panel-title">{selectedItem.name}</h3>
                                <table className="food_diary-table">
                                    <thead>
                                    <tr>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("dateAdded")}>
                                            Date Added <span className="sort-icon">{getSortIcon(breakdownSort, "dateAdded")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("expiryDate")}>
                                            Expiry Date <span className="sort-icon">{getSortIcon(breakdownSort, "expiryDate")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("calories")}>
                                            Calories <span className="sort-icon">{getSortIcon(breakdownSort, "calories")}</span>
                                        </th>
                                        <th className="sortable-heading" onClick={() => toggleBreakdownSort("portions")}>
                                            Portions <span className="sort-icon">{getSortIcon(breakdownSort, "portions")}</span>
                                        </th>
                                        <th>Portion Amount</th>
                                        <th>Total Amount</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedBreakdownEntries.map((entry) => (
                                        <tr
                                            key={entry._id}
                                            className={mode === 'delete' ? 'delete-mode-row' : ''}
                                            onClick={() => handleBreakdownRowClick(entry)}
                                            style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
                                        >
                                            <td>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                                            <td className={getExpiryStatusClass(entry.expiryDate)}>
                                                {formatExpiryDate(entry.expiryDate)}
                                            </td>                                            <td>{entry.calories}</td>
                                            <td>{formatPortions(entry.portions)}</td>
                                            <td>{entry.portionSize ? `${entry.portionSize}${entry.unit}` : ""}</td>
                                            <td>{formatTotalAmount(entry.totalAmount, entry.unit)}</td>
                                            <td>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingItem({ ...selectedItem, ...entry, _id: entry._id });
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td>Total</td>
                                        <td></td>
                                        <td></td>
                                        <td>{formatPortions(selectedItem.portions)}</td>
                                        <td></td>
                                        <td>{formatTotalAmount(selectedItem.totalAmount, selectedItem.unit)}</td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        )}
                        <button onClick={() => {
                            setSelectedItem(null);
                            setEditingItem(null);
                            setShowFilters(false);
                            setIsClosingFilters(false);
                        }}>
                            Close
                        </button>
                    </div>

                </div>
            ) : (
                //homepage table
                <div className="panel">

                    <div className="table-scroll">
                        <table className="food_diary-table">
                            <thead>
                            <tr>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("name")}>
                                    Food Name <span className="sort-icon">{getSortIcon(foodDiarySort, "name")}</span>
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("calories")}>
                                    Calories <span className="sort-icon">{getSortIcon(foodDiarySort, "calories")}</span>
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("portions")}>
                                    Portions <span className="sort-icon">{getSortIcon(foodDiarySort, "portions")}</span>
                                </th>
                                <th>
                                    Total Amount
                                </th>
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("expiryDate")}>
                                    Expiry Date <span className="sort-icon">{getSortIcon(foodDiarySort, "expiryDate")}</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedFoodItems.length === 0 ? (
                                <tr><td colSpan="5">Its empty in here!</td></tr>
                            ) : (
                                sortedFoodItems.map((item) => (
                                    <tr
                                        key={item._id}
                                        className={mode === 'delete' ? 'delete-mode-row' : ''}
                                        onClick={() => handleRowClick(item)}
                                        style={{ cursor: mode ? 'pointer' : 'default' }}
                                    >
                                        <td>{item.name}</td>
                                        <td>{item.calories}</td>
                                        <td>{formatPortions(item.portions)}</td>
                                        <td>
                                            {formatTotalAmount(item.totalAmount, item.unit)}
                                        </td>
                                        <td className={getExpiryStatusClass(item.expiryDate)}>
                                            {formatExpiryDate(item.expiryDate)}
                                        </td>                                    </tr>
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