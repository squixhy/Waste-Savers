const mongoose = require('mongoose'); 

const ingredientScheme = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dateAdded: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  calories: { type: Number },
  quantity: { type: Number }
});
// Ingredients are sorted by name, dateAdded, expiryDate, calories, quantity. 

module.exports = mongoose.model('Ingredients', ingredientScheme);