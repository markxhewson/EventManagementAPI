const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { username, password, email, phone, role } = req.body;
  const { user } = req.app.locals;

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await user.create({ username, passwordHash, email, phone, role });

  return res.status(201).json(newUser);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { user } = req.app.locals;

  const userFound = await user.findOne({ where: { username } });

  if (!userFound) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const validPassword = await bcrypt.compare(password, userFound.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  return res.status(200).json({ message: 'Login successful' });
});

module.exports = router;