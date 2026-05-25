import '../pages/pages_css/Homepage.css'
import '../pages/pages_css/FoodDiary.css'
import { useState, useEffect, useRef } from "react";

function FoodDiary() {
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    const notificationSettingsStorageKey = "foodDiaryNotificationSettings";
    const notificationsEnabledStorageKey = "foodDiaryNotificationsEnabled";
    const generalSettingsStorageKey = "foodDiaryGeneralSettings";
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isClosingForm, setIsClosingForm] = useState(false);
    const [isClosingFilters, setIsClosingFilters] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [showGeneralSettings, setShowGeneralSettings] = useState(false);
    const [isClosingSettings, setIsClosingSettings] = useState(false);
    const [showResetAllPrompt, setShowResetAllPrompt] = useState(false);
    const settingsWrapperRef = useRef(null);
    const [mode, setMode] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [foodDiarySort, setFoodDiarySort] = useState({ key: null, direction: "asc" });
    const [breakdownSort, setBreakdownSort] = useState({ key: null, direction: "asc" });
    const [manualPortionFallback, setManualPortionFallback] = useState(false);
    const [caloriesPer100g, setCaloriesPer100g] = useState(null);
    const [calorieLoading, setCalorieLoading] = useState(false);
    const [autoFillEnabled, setAutoFillEnabled] = useState(true);
    const [fatSecretResults, setFatSecretResults] = useState([]);
    const [selectedFatSecretFoodId, setSelectedFatSecretFoodId] = useState(null);
    const [isFoodNameFocused, setIsFoodNameFocused] = useState(false);


    const defaultNotificationSettings = {
        high: { visible: true, colour: "#a1001d", days: 3 },
        medium: { visible: true, colour: "#d99a00", days: 7 },
        low: { visible: true, colour: "#00813d" },
        noExpiry: { visible: true, colour: "#00813d" },
    };

    const defaultGeneralSettings = {
        primaryColour: "#3f6652",
        headingTextColour: "#fff",
        bodyTextColour: "#000",
        backgroundColour: "#ededed",
        autoFillEnabled: true,
    };

    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const savedValue = localStorage.getItem(notificationsEnabledStorageKey);
        if (savedValue === null) {
            return true;
        }
        return savedValue === "true";
    });

    const [notificationSettings, setNotificationSettings] = useState(() => {
        const savedSettings = localStorage.getItem(notificationSettingsStorageKey);
        if (!savedSettings) {
            return defaultNotificationSettings;
        }
        try {
            return {
                ...defaultNotificationSettings,
                ...JSON.parse(savedSettings),
            };
        } catch {
            return defaultNotificationSettings;
        }
    });

    const [generalSettings, setGeneralSettings] = useState(() => {
        const savedSettings = localStorage.getItem(generalSettingsStorageKey);
        if (!savedSettings) {
            return defaultGeneralSettings;
        }
        try {
            return {
                ...defaultGeneralSettings,
                ...JSON.parse(savedSettings),
            };
        } catch {
            return defaultGeneralSettings;
        }
    });

    const [filters, setFilters] = useState({
        name: "",
        expiryDate: "",
        calories: "",
        portions: "",
        priority: "",
    });

    const [newItem, setNewItem] = useState({
        name: "",
        brandName: "",
        fatSecretFoodId: "",
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
        localStorage.setItem(
            notificationSettingsStorageKey,
            JSON.stringify(notificationSettings)
        );
    }, [notificationSettings]);

    useEffect(() => {
        localStorage.setItem(
            notificationsEnabledStorageKey,
            notificationsEnabled.toString()
        );
    }, [notificationsEnabled]);

    useEffect(() => {
        localStorage.setItem(
            generalSettingsStorageKey,
            JSON.stringify(generalSettings)
        );
        setAutoFillEnabled(generalSettings.autoFillEnabled);
    }, [generalSettings]);

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
    },
        [showSettings, isClosingSettings]);
    useEffect(() => {
        if (!autoFillEnabled) {
            return;
        }

        if (!newItem.name || !newItem.unit) {
            setFatSecretResults([]);
            setSelectedFatSecretFoodId(null);
            setNewItem((prev) => ({
                ...prev,
                portionSize: "",
                portions: "",
                calories: "",
            }));
            return;
        }

        if (newItem.name.trim().length < 1) {
            setFatSecretResults([]);
            setSelectedFatSecretFoodId(null);
            return;
        }

        const controller = new AbortController();

        setCalorieLoading(true);

        const autoFillTimeout = setTimeout(() => {
            fetch(
                `http://localhost:5050/food-diary/calories?name=${encodeURIComponent(newItem.name)}&amount=${encodeURIComponent(newItem.totalWeight || 100)}&unit=${encodeURIComponent(newItem.unit)}${newItem.fatSecretFoodId ? `&foodId=${encodeURIComponent(newItem.fatSecretFoodId)}` : ""}`,
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
                    const foodOptions = data.foodOptions || [];

                    const selectedOption = foodOptions.find((result) =>
                        String(result.foodId) === String(newItem.fatSecretFoodId)
                    );

                    const exactMatch = foodOptions.find((result) =>
                        result.foodName?.toLowerCase().trim() === newItem.name.toLowerCase().trim()
                    );

                    const matchedFoodId =
                        newItem.fatSecretFoodId ||
                        selectedOption?.foodId ||
                        exactMatch?.foodId ||
                        data.fatSecretFoodId ||
                        null;

                    const matchedBrandName =
                        newItem.brandName ||
                        selectedOption?.brandName ||
                        exactMatch?.brandName ||
                        "";

                    const sortedFoodOptions = [...foodOptions].sort((a, b) => {
                        const selectedA = String(a.foodId) === String(matchedFoodId);
                        const selectedB = String(b.foodId) === String(matchedFoodId);

                        if (selectedA && !selectedB) return -1;
                        if (!selectedA && selectedB) return 1;

                        return 0;
                    });

                    setFatSecretResults(sortedFoodOptions);

                    setSelectedFatSecretFoodId(matchedFoodId);

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
                    const calculatedPortions = newItem.totalWeight
                        ? Number(newItem.totalWeight) / recommendedPortionSize
                        : "";

                    setNewItem((prev) => ({
                        ...prev,
                        name: prev.fatSecretFoodId ? prev.name : selectedOption?.foodName || exactMatch?.foodName || prev.name,
                        brandName: matchedBrandName,
                        fatSecretFoodId: matchedFoodId || prev.fatSecretFoodId || "",
                        portionSize: recommendedPortionSize.toString(),
                        portions: calculatedPortions === "" ? "" : calculatedPortions.toFixed(1),
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
                        setFatSecretResults([]);
                        setSelectedFatSecretFoodId(null);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setCalorieLoading(false);
                    }
                });
        }, 500);

        return () => {
            clearTimeout(autoFillTimeout);
            controller.abort();
        };
    }, [autoFillEnabled, newItem.name, newItem.unit]);

    const selectFatSecretResult = (result) => {
        if (!autoFillEnabled || !result.foodId) {
            return;
        }

        setCalorieLoading(true);
        setSelectedFatSecretFoodId(result.foodId);

        fetch(
            `http://localhost:5050/food-diary/calories?name=${encodeURIComponent(result.foodName || newItem.name)}&amount=${encodeURIComponent(newItem.totalWeight || 100)}&unit=${encodeURIComponent(newItem.unit)}&foodId=${encodeURIComponent(result.foodId)}`
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to calculate calories");
                }
                return res.json();
            })
            .then((data) => {
                setCaloriesPer100g(Number(data.caloriesPer100g) || null);
                const returnedFoodOptions = data.foodOptions || fatSecretResults;
                const selectedResult = {
                    ...result,
                    foodId: String(result.foodId),
                    foodName: result.foodName || newItem.name,
                    brandName: result.brandName || "",
                };

                const selectedFirstFoodOptions = [
                    selectedResult,
                    ...returnedFoodOptions.filter((food) =>
                        String(food.foodId) !== String(result.foodId)
                    ),
                ];

                setFatSecretResults(selectedFirstFoodOptions);
                setSelectedFatSecretFoodId(String(result.foodId));
                setManualPortionFallback(false);

                const recommendedPortionSize = Number(data.recommendedPortionSize);
                const calculatedPortions = newItem.totalWeight
                    ? Number(newItem.totalWeight) / recommendedPortionSize
                    : "";

                setNewItem((prev) => ({
                    ...prev,
                    name: result.foodName || prev.name,
                    brandName: result.brandName || "",
                    fatSecretFoodId: result.foodId || "",
                    portionSize: recommendedPortionSize.toString(),
                    portions: calculatedPortions === "" ? "" : calculatedPortions.toFixed(1),
                    calories: data.caloriesPerRecommendedPortion?.toString() || data.calories?.toString() || "",
                }));
            })
            .catch((err) => {
                console.error("Failed to select FatSecret result:", err);
            })
            .finally(() => {
                setCalorieLoading(false);
            });
    };

    const shouldShowFatSecretResults =
        autoFillEnabled &&
        isFoodNameFocused &&
        newItem.name.trim().length >= 1 &&
        fatSecretResults.length > 0;

    const resetNewItem = () => {
        setNewItem({
            name: "",
            brandName: "",
            fatSecretFoodId: "",
            expiryDate: "",
            totalWeight: "",
            unit: "g",
            portionSize: "",
            portions: "",
            calories: "",
        });
        setAutoFillEnabled(generalSettings.autoFillEnabled);
        setCalorieLoading(false);
        setManualPortionFallback(false);
        setCaloriesPer100g(null);
        setFatSecretResults([]);
        setSelectedFatSecretFoodId(null);
        setIsFoodNameFocused(false);
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
            setShowNotificationSettings(false);
            setShowGeneralSettings(false);
            setShowResetAllPrompt(false);
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

    const getExpiryStatusKey = (expiryDate) => {
        if (!expiryDate) return "noExpiry";
        const dateOnly = expiryDate.slice(0, 10);
        if (dateOnly === noExpiryDateValue) {
            return "noExpiry";
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(dateOnly);
        expiry.setHours(0, 0, 0, 0);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= Number(notificationSettings.high.days)) {
            return "high";
        }
        if (daysUntilExpiry <= Number(notificationSettings.medium.days)) {
            return "medium";
        }
        return "low";
    };

    const getExpiryStatusStyle = (expiryDate) => {
        if (!notificationsEnabled) {
            return {};
        }
        const statusKey = getExpiryStatusKey(expiryDate);
        const statusSettings = notificationSettings[statusKey];
        if (!statusSettings?.visible) {
            return {};
        }
        return {
            backgroundColor: statusSettings.colour,
            color: "#fff",
            fontWeight: 700,
        };
    };

    const handleNotificationSettingChange = (priority, field, value) => {
        setNotificationSettings((prev) => {
            const updatedSettings = {
                ...prev,
                [priority]: {
                    ...prev[priority],
                    [field]: value,
                },
            };

            if (field === "days") {
                let highDays = Number(updatedSettings.high.days);
                let mediumDays = Number(updatedSettings.medium.days);

                if (Number.isNaN(highDays) || highDays < 0) {
                    highDays = 0;
                    updatedSettings.high = {
                        ...updatedSettings.high,
                        days: 0,
                    };
                }

                if (Number.isNaN(mediumDays)) {
                    mediumDays = highDays + 1;
                    updatedSettings.medium = {
                        ...updatedSettings.medium,
                        days: mediumDays,
                    };
                }

                if (priority === "medium" && mediumDays <= highDays) {
                    updatedSettings.high = {
                        ...updatedSettings.high,
                        days: Math.max(0, mediumDays - 1),
                    };
                }

                if (priority === "high" && highDays >= mediumDays) {
                    updatedSettings.medium = {
                        ...updatedSettings.medium,
                        days: highDays + 1,
                    };
                }
            }

            return updatedSettings;
        });
    };

    const resetNotificationSettings = () => {
        setNotificationsEnabled(true);
        setNotificationSettings(defaultNotificationSettings);
    };

    const handleGeneralSettingChange = (field, value) => {
        setGeneralSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetGeneralSettings = () => {
        setGeneralSettings(defaultGeneralSettings);
        setAutoFillEnabled(defaultGeneralSettings.autoFillEnabled);
        setManualPortionFallback(false);
    };

    const resetAllSettings = () => {
        setNotificationsEnabled(true);
        setNotificationSettings(defaultNotificationSettings);
        setGeneralSettings(defaultGeneralSettings);
        setAutoFillEnabled(defaultGeneralSettings.autoFillEnabled);
        setManualPortionFallback(false);
        setShowResetAllPrompt(false);
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

            if (name === "name" && value !== prev.name) {
                updatedItem.brandName = "";
                updatedItem.fatSecretFoodId = "";
                setSelectedFatSecretFoodId(null);
            }

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

            if (autoFillEnabled && (name === "unit" || name === "name")) {
                if (!updatedItem.name || !updatedItem.unit) {
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
        const { name, value } = e.target;
        if (name === "portionSize" && value !== "" && !isValidPortionSize(value)) {
            return;
        }
        setEditingItem({ ...editingItem, [name]: value });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleFoodDiarySort = (key) => {
        setFoodDiarySort((prev) => {
            if (prev.key !== key) {
                return { key, direction: "asc" };
            }

            if (prev.direction === "asc") {
                return { key, direction: "desc" };
            }

            return { key: null, direction: "asc" };
        });
    };

    const toggleBreakdownSort = (key) => {
        setBreakdownSort((prev) => {
            if (prev.key !== key) {
                return { key, direction: "asc" };
            }

            if (prev.direction === "asc") {
                return { key, direction: "desc" };
            }

            return { key: null, direction: "asc" };
        });
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
        const expiryDateToSave = newItem.expiryDate || getTodayDateString();

        if (expiryDateToSave !== noExpiryDateValue && expiryDateToSave < getTodayDateString()) {
            alert("Please enter a valid date");
            return;
        }

        if (
            !newItem.name ||
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
            alert("Portion size must be a whole number or up to 2 decimal places");
            return;
        }

        const itemToSave = {
            name: newItem.name,
            expiryDate: expiryDateToSave,
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

        if (!isValidPortionSize(editingItem.portionSize.toString())) {
            alert("Portion size must be a whole number or up to 2 decimal places");
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
        const itemPriority = getExpiryStatusKey(item.expiryDate);

        return (
            itemName.includes(filters.name.toLowerCase()) &&
            itemExpiryDate.includes(filters.expiryDate) &&
            itemCalories.includes(filters.calories) &&
            itemPortions.includes(filters.portions) &&
            (!filters.priority || itemPriority === filters.priority)
        );
    });

    const sortedFoodItems = [...filteredFoodItems].sort((a, b) => {
        if (!foodDiarySort.key) return 0;

        const sortTypes = {
            name: "text",
            expiryDate: "date",
            calories: "number",
            portions: "number",
            totalAmount: "number",
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
        <div
            className="foodDiary-container"
            style={{
                "--food-diary-primary-colour": generalSettings.primaryColour,
                "--food-diary-heading-text-colour": generalSettings.headingTextColour,
                "--food-diary-body-text-colour": generalSettings.bodyTextColour,
                "--food-diary-background-colour": generalSettings.backgroundColour,
                backgroundColor: generalSettings.backgroundColour,
                color: generalSettings.bodyTextColour,
            }}
        >
            <div className="foodDiary-controls" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div className="settings-wrapper" ref={settingsWrapperRef}>
                    <button
                        className="settings-btn"
                        type="button"
                        onClick={() => {
                            if (showSettings) {
                                closeSettings();
                            } else {
                                setIsClosingSettings(false);
                                setShowNotificationSettings(false);
                                setShowGeneralSettings(false);
                                setShowSettings(true);
                            }
                        }}
                    >
                        Settings
                    </button>

                    {showSettings && (
                        <div className={`settings-pane ${isClosingSettings ? "settings-pane-closing" : "settings-pane-opening"}`}>
                            {showNotificationSettings || showGeneralSettings ? (
                                <button
                                    type="button"
                                    className="settings-back-btn"
                                    onClick={() => {
                                        setShowNotificationSettings(false);
                                        setShowGeneralSettings(false);
                                    }}
                                >
                                    Settings
                                </button>
                            ) : (
                                <>
                                    <h3>Settings</h3>

                                    <button
                                        type="button"
                                        className="settings-menu-btn"
                                        onClick={() => {
                                            setShowResetAllPrompt(false);
                                            setShowNotificationSettings(true);
                                        }}
                                    >
                                        Notification Settings
                                    </button>

                                    <button
                                        type="button"
                                        className="settings-menu-btn"
                                        onClick={() => {
                                            setShowResetAllPrompt(false);
                                            setShowGeneralSettings(true);
                                        }}
                                    >
                                        General Settings
                                    </button>

                                    {showResetAllPrompt ? (
                                        <div className="reset-all-settings-prompt">
                                            <span>Reset?</span>
                                            <button
                                                type="button"
                                                className="reset-all-cancel-btn"
                                                onClick={() => setShowResetAllPrompt(false)}
                                            >
                                                ✕
                                            </button>
                                            <button
                                                type="button"
                                                className="reset-all-confirm-btn"
                                                onClick={resetAllSettings}
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="reset-all-settings-btn"
                                            onClick={() => setShowResetAllPrompt(true)}
                                        >
                                            Reset All Settings
                                        </button>
                                    )}
                                </>
                            )}

                            {showNotificationSettings && (
                                <div className="notification-settings-pane">
                                    <label className="notification-off-row">
                                        <span>Turn off Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={!notificationsEnabled}
                                            onChange={(e) => setNotificationsEnabled(!e.target.checked)}
                                        />
                                    </label>
                                    <div className="notification-setting-row">
                                        <span>High Priority</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.high.visible}
                                            onChange={(e) => handleNotificationSettingChange("high", "visible", e.target.checked)}
                                        />
                                        <input
                                            type="color"
                                            value={notificationSettings.high.colour}
                                            onChange={(e) => handleNotificationSettingChange("high", "colour", e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            value={notificationSettings.high.days}
                                            onChange={(e) => handleNotificationSettingChange("high", "days", e.target.value)}
                                        />
                                    </div>

                                    <div className="notification-setting-row">
                                        <span>Medium Priority</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.medium.visible}
                                            onChange={(e) => handleNotificationSettingChange("medium", "visible", e.target.checked)}
                                        />
                                        <input
                                            type="color"
                                            value={notificationSettings.medium.colour}
                                            onChange={(e) => handleNotificationSettingChange("medium", "colour", e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            value={notificationSettings.medium.days}
                                            onChange={(e) => handleNotificationSettingChange("medium", "days", e.target.value)}
                                        />
                                    </div>

                                    <div className="notification-setting-row">
                                        <span>Low Priority</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.low.visible}
                                            onChange={(e) => handleNotificationSettingChange("low", "visible", e.target.checked)}
                                        />
                                        <input
                                            type="color"
                                            value={notificationSettings.low.colour}
                                            onChange={(e) => handleNotificationSettingChange("low", "colour", e.target.value)}
                                        />
                                        <div className="notification-days-placeholder"></div>
                                    </div>

                                    <div className="notification-setting-row">
                                        <span>No Expiry</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.noExpiry.visible}
                                            onChange={(e) => handleNotificationSettingChange("noExpiry", "visible", e.target.checked)}
                                        />
                                        <input
                                            type="color"
                                            value={notificationSettings.noExpiry.colour}
                                            onChange={(e) => handleNotificationSettingChange("noExpiry", "colour", e.target.value)}
                                        />
                                        <div className="notification-days-placeholder"></div>
                                    </div>
                                    <button
                                        type="button"
                                        className="reset-notification-settings-btn"
                                        onClick={resetNotificationSettings}
                                    >
                                        Reset Notification Settings
                                    </button>
                                </div>
                            )}

                            {showGeneralSettings && (
                                <div className="general-settings-pane">
                                    <div className="general-setting-row">
                                        <span>Primary Colour</span>
                                        <input
                                            type="color"
                                            value={generalSettings.primaryColour}
                                            onChange={(e) => handleGeneralSettingChange("primaryColour", e.target.value)}
                                        />
                                    </div>

                                    <div className="general-setting-row">
                                        <span>Heading Text</span>
                                        <input
                                            type="color"
                                            value={generalSettings.headingTextColour}
                                            onChange={(e) => handleGeneralSettingChange("headingTextColour", e.target.value)}
                                        />
                                    </div>

                                    <div className="general-setting-row">
                                        <span>Body Text</span>
                                        <input
                                            type="color"
                                            value={generalSettings.bodyTextColour}
                                            onChange={(e) => handleGeneralSettingChange("bodyTextColour", e.target.value)}
                                        />
                                    </div>

                                    <div className="general-setting-row">
                                        <span>Background</span>
                                        <input
                                            type="color"
                                            value={generalSettings.backgroundColour}
                                            onChange={(e) => handleGeneralSettingChange("backgroundColour", e.target.value)}
                                        />
                                    </div>

                                    <label className="general-setting-row general-toggle-row">
                                        <span>AutoFill</span>
                                        <input
                                            type="checkbox"
                                            checked={generalSettings.autoFillEnabled}
                                            onChange={(e) => handleGeneralSettingChange("autoFillEnabled", e.target.checked)}
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        className="reset-general-settings-btn"
                                        onClick={resetGeneralSettings}
                                    >
                                        Reset General Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="food-form-slot">
                {showForm && (
                    <div className={`food-form ${shouldShowFatSecretResults ? "food-form-results-open" : ""} ${isClosingForm ? "food-form-closing" : "food-form-opening"}`}>
                        <label
                            className="food-form-field food-name-field"
                            onFocus={() => setIsFoodNameFocused(true)}
                            onBlur={() => {
                                setTimeout(() => {
                                    setIsFoodNameFocused(false);
                                }, 150);
                            }}
                        >
                            <span>Food Name</span>
                            <input name="name" placeholder="Food Name" onChange={handleChange} value={newItem.name} />
                            <input type="hidden" name="brandName" value={newItem.brandName} readOnly />
                            <input type="hidden" name="fatSecretFoodId" value={newItem.fatSecretFoodId} readOnly />

                            {shouldShowFatSecretResults && (
                                <div className="fatsecret-results-list">
                                    {fatSecretResults.map((result) => (
                                        <button
                                            type="button"
                                            key={result.foodId}
                                            className={`fatsecret-result ${
                                                String(result.foodId) === String(selectedFatSecretFoodId)
                                                    ? "fatsecret-result-selected"
                                                    : ""
                                            }`}
                                            onClick={() => selectFatSecretResult(result)}
                                        >
                                            <span>{result.foodName}</span>
                                            {result.brandName && <small>{result.brandName}</small>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </label>

                        <label className="food-form-field">
                            <span>Expiry Date</span>
                            <div className="expiry-input-row">
                                {newItem.expiryDate === noExpiryDateValue ? (
                                    <input value="NoExpiry" type="text" readOnly onClick={clearNewItemNoExpiry} />
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
                                    {!newItem.name
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
                                    {!newItem.name
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
                        {generalSettings.autoFillEnabled && (
                            <button
                                type="button"
                                onClick={() => {
                                    const nextValue = !autoFillEnabled;

                                    setAutoFillEnabled(nextValue);

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
                                }}
                            >
                                {autoFillEnabled ? "Turn Off Auto Fill" : "Turn On Auto Fill"}
                            </button>
                        )}
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

                        <label className="food-form-field expiry-filter-field">
                            <span>Expiry Date</span>
                            <div className="expiry-filter-content">
                                <input
                                    name="expiryDate"
                                    type="date"
                                    value={filters.expiryDate}
                                    onChange={handleFilterChange}
                                />

                                <div className="priority-key-row">
                                    <button
                                        type="button"
                                        className={`priority-key-item ${filters.priority === "high" ? "priority-key-item-active" : ""}`}
                                        onClick={() => setFilters((prev) => ({
                                            ...prev,
                                            priority: prev.priority === "high" ? "" : "high",
                                        }))}
                                    >
                                        <span className="priority-key-colour"
                                              style={{ backgroundColor: notificationSettings.high.colour }}>
                                        </span>
                                        High
                                    </button>
                                    <button
                                        type="button"
                                        className={`priority-key-item ${filters.priority === "medium" ? "priority-key-item-active" : ""}`}
                                        onClick={() => setFilters((prev) => ({
                                            ...prev,
                                            priority: prev.priority === "medium" ? "" : "medium",
                                        }))}
                                    >
                                        <span
                                            className="priority-key-colour"
                                            style={{ backgroundColor: notificationSettings.medium.colour }}
                                        ></span>
                                        Medium
                                    </button>
                                    <button
                                        type="button"
                                        className={`priority-key-item ${filters.priority === "low" ? "priority-key-item-active" : ""}`}
                                        onClick={() => setFilters((prev) => ({
                                            ...prev,
                                            priority: prev.priority === "low" ? "" : "low",
                                        }))}
                                    >
                                        <span
                                            className="priority-key-colour"
                                            style={{ backgroundColor: notificationSettings.low.colour }}
                                        ></span>
                                        Low
                                    </button>
                                    <button
                                        type="button"
                                        className={`priority-key-item ${filters.priority === "noExpiry" ? "priority-key-item-active" : ""}`}
                                        onClick={() => setFilters((prev) => ({
                                            ...prev,
                                            priority: prev.priority === "noExpiry" ? "" : "noExpiry",
                                        }))}
                                    >
                                        <span
                                            className="priority-key-colour"
                                            style={{ backgroundColor: notificationSettings.noExpiry.colour }}
                                        ></span>
                                        No Expiry
                                    </button>
                                </div>
                            </div>
                        </label>

                        <button onClick={() => setFilters({ name: "", expiryDate: "", calories: "",
                            portions: "", priority: "" })}>
                            Clear
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
                                                            <input value="NoExpiry" type="text" readOnly required onClick={clearEditingItemNoExpiry} />
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
                                                <td style={getExpiryStatusStyle(entry.expiryDate)}>
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
                                            <td style={getExpiryStatusStyle(entry.expiryDate)}>
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
                <div className="panel food-diary-panel-with-side-add">
                    <div className="side-table-button-column">
                        <button className="side-add-food-btn" onClick={() => {
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
                            {showForm ? "×" : "+"}
                        </button>
                        <button
                            className={`side-delete-btn ${mode === 'delete' ? 'active-mode-delete' : ''}`}
                            onClick={() => toggleMode('delete')}
                        >
                            Bin
                        </button>
                    </div>

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
                                <th className="sortable-heading" onClick={() => toggleFoodDiarySort("totalAmount")}>
                                    Total Amount <span className="sort-icon">{getSortIcon(foodDiarySort, "totalAmount")}</span>
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
                                        <td style={getExpiryStatusStyle(item.expiryDate)}>
                                            {formatExpiryDate(item.expiryDate)}
                                        </td>                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    <button className="side-filter-btn" onClick={() => {
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
                        {showFilters ? "Hide" : "Filter"}
                    </button>
                </div>

            )
            }
        </div>
    );
}

export default FoodDiary;