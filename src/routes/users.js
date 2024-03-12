const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

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
  const { username, password, email, phone, role } = req.body;
  const { user } = req.app.locals;

  const userFound = await user.findOne({ where: { id } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create an object containing only the properties that were passed in the request body
  const updatedUserData = {
    username: username || userFound.username,
    passwordHash: password ? await bcrypt.hash(password, 10) : userFound.password,
    email: email || userFound.email,
    phone: phone || userFound.phone,
    role: role || userFound.role
  };

  // Update the user with the merged data
  await user.update(updatedUserData, { where: { id } });
  const newUser = await user.findOne({ where: { id } });

  return res.status(200).json(newUser);
});


module.exports = router;

