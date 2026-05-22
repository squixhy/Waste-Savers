const express = require('express');
const router = express.Router();
const { getFoodDiary, addFoodItem, updateFoodItem, deleteFoodItem, getCaloriesFromUsda } = require('../controllers/fridgeController');

router.get('/', getFoodDiary);
router.get('/calories', getCaloriesFromUsda);
router.post('/', addFoodItem);
router.put('/:id', updateFoodItem);
router.delete('/:id', deleteFoodItem);

module.exports = router;