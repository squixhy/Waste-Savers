const express = require('express');
const router = express.Router();
const { getFoodDiary } = require('../controllers/foodDiaryController');

router.get('/', getFoodDiary);

module.exports = router;