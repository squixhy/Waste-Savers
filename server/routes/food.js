const express = require('express');
const router = express.Router();
const { getFoodDiary, addFoodItem } = require('../controllers/fridgeController');

router.get('/', getFoodDiary);
router.post('/', addFoodItem);  // ← add this

module.exports = router;