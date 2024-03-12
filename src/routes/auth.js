require('dotenv').config()

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  const { user } = req.app.locals;

  // Check if the email or phone number already exists in the database
  const existingUser = await user.findOne({
      $or: [{ email: email }, { phone: phone }]
  });

  if (existingUser) {
      return res.status(400).json({ error: 'An account with this email or phone number already exists' });
  }

  // If the email and phone number are unique, proceed with user registration
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await user.create({ username, passwordHash, email, phone, emailNotifications: true, smsNotifications: true, twoFactorAuth: false, role: 'attendee' });

  return res.status(201).json(newUser);
});


router.get('/verify', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { user } = req.app.locals;

  try {
    const userFound = await user.findOne({ where: { username } });

    if (!userFound) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, userFound.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: userFound.username, role: userFound.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    delete userFound.dataValues.passwordHash;
    return res.status(200).json({ message: 'Login successful', user: userFound, token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;