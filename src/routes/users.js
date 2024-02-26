const express = require('express');
const router = express.Router();

// get all users
router.get('/', async (req, res) => {
  const { user } = req.app.locals;

  const users = await user.findAll();

  return res.status(200).json(users);
});

// get a user by specific id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { user } = req.app.locals;

  const userFound = await user.findOne({ where: { id } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(userFound);
});

// update a user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, role } = req.body;
  const { user } = req.app.locals;

  const userFound = await user.findOne({ where: { id } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedUser = await user.update({ username, email, phone, role }, { where: { id } });

  return res.status(200).json(updatedUser);
});

