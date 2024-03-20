const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { interests } = req.app.locals;
    const data = await interests.findAll();

    return res.status(200).json(data);
});


module.exports = router;