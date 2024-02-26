const express = require('express');
const router = express.Router();

// get all user registrations for a specific event id
router.get('/event/:id', async (req, res) => {
  const { id } = req.params;
  const { eventRegistration } = req.app.locals;

  const registrations = await eventRegistration.findAll({ where: { eventId: id } });

  return res.status(200).json(registrations);
});

// get all events a user has signed up for
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { eventRegistration } = req.app.locals;

  const registrations = await eventRegistration.findAll({ where: { userId: id } });

  return res.status(200).json(registrations);
});

// create a new event registration
router.post('/register', async (req, res) => {
  const { userId, eventId } = req.body;

  const { eventRegistration } = req.app.locals;

  const newRegistration = await eventRegistration.create({ userId, eventId, status: "GOING" });

  return res.status(201).json(newRegistration);
});

module.exports = router;