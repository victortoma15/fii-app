const express = require('express');
const router = express.Router();

router.post("/", (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
});

module.exports = router;