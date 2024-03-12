const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { rating, comment, userId } = req.body;
    const { review } = req.app.locals;

    const newReview = await review.create({ rating, comment, userId });

    return res.status(201).json({ review: { newReview } });
});

router.get('/', async (req, res) => {
    const { review } = req.app.locals;

    const reviews = await review.findAll();

    return res.status(200).json({ data: { reviews } });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { review } = req.app.locals;

    const reviewFound = await review.findOne({ where: { id } });

    if (!reviewFound) {
        return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ data: { reviewFound } });
});

module.exports = router;