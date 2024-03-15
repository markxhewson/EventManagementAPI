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
  const { username, password, email, phone, emailNotifications, smsNotifications, twoFactorAuth, role, preferredAuth } = req.body;
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
    emailNotifications: emailNotifications !== undefined ? !!parseInt(emailNotifications) : userFound.emailNotifications,
    smsNotifications: smsNotifications !== undefined ? !!parseInt(smsNotifications) : userFound.smsNotifications,
    twoFactorAuth: twoFactorAuth !== undefined ? !!parseInt(twoFactorAuth) : userFound.twoFactorAuth,
    role: role || userFound.role,
    preferredAuth: preferredAuth || userFound.preferredAuth
};


  // Update the user with the merged data
  await user.update(updatedUserData, { where: { id } });
  const newUser = await user.findOne({ where: { id } });

  return res.status(200).json(newUser);
});


module.exports = router;

