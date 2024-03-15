const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { application } = req.app.locals;

    try {
        const applications = await application.findAll({
            order: [['createdAt', 'DESC']] // Ordering by createdAt in descending order
        });

        for (const application of applications) {
            const { user } = req.app.locals;
            const userFound = await user.findOne({ where: { id: application.userId } });
            application.dataValues.user = userFound;
        }

        return res.status(200).json(applications);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// get all applications for a specific user
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { application } = req.app.locals;

    const applications = await application.findAll({ where: { userId: id } });

    return res.status(200).json(applications);
});

// create a new application
router.post('/apply', async (req, res) => {
    const { userId, why, ideas } = req.body;

    console.log(req.body)
    const { application } = req.app.locals;

    const newApplication = await application.create({ userId, why, ideas });

    return res.status(201).json(newApplication);
});

// approve an application
router.post('/approve/:id', async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body;
    const { application, user } = req.app.locals;

    const applicationFound = await application.findOne({ where: { id } });

    if (!applicationFound) {
        return res.status(404).json({ error: 'Application not found' });
    }

    if (!approved) {
        await application.destroy({ where: { id } });
        return res.status(200).json({ message: 'Application rejected' });
    }

    const userFound = await user.findOne({ where: { id: applicationFound.userId } });

    if (!userFound) {
        return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role: 'organiser' }, { where: { id: userFound.id } });
    await application.update({ approved: true }, { where: { id } });

    return res.status(200).json({ message: 'Application approved, assigned ' + userFound.username + ' as organiser' });
});

module.exports = router;