const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    console.log("Test");
    res.json('API is online!');
});

module.exports = router;