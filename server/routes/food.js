const express = require('express');
const router = express.Router();
const { getFoodDiary, addFoodItem, updateFoodItem, deleteFoodItem } = require('../controllers/fridgeController');

router.get('/', getFoodDiary);
router.post('/', addFoodItem);
router.put('/:id', updateFoodItem);
router.delete('/:id', deleteFoodItem);

module.exports = router;