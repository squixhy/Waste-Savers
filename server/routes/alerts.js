const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, title: "Library closing early", date: "2026-05-13" },
    { id: 2, title: "Free food in cafeteria", date: "2026-05-14" }
  ]);
});

module.exports = router;
