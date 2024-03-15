const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    return res.status(200).json([
        { id: 1, name: "Medical Research" },
        { id: 2, name: "Cervical Scanning" },
        { id: 3, name: "Breast Cancer" },
        { id: 4, name: "Awareness" },
        { id: 5, name: "Fundraising" },
        { id: 6, name: "Survivorship & Long-term Effects" }
    ]);
});


module.exports = router;