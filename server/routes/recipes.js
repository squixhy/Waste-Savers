const express = require('express');
const router = express.Router();
const { getRecipes } = require('../controllers/recipesController');

router.get('/', getRecipes);

module.exports = router;