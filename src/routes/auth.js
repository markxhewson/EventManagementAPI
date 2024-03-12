require('dotenv').config()

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendSMS = require('../sms/sendSMS');

router.post('/send-code', async (req, res) => {
  const { userId } = req.body;
  const { user } = req.app.locals;
  const { code } = req.app.locals;

  const userFound = await user.findOne({ where: { id: userId } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  const generatedCode = Math.floor(100000 + Math.random() * 900000);
  const record = await code.create({ code: generatedCode, authenticated: false, userId: userFound.id });

  // Send the code to the user's email or phone number
  sendSMS(userFound.phone, `Your verification code is: ${generatedCode}`);

  return res.status(200).json({ message: 'Verification code sent successfully' });
});

router.post('/verify-code', async (req, res) => {
  const { verificationCode, signup } = req.body;
  const { user } = req.app.locals;
  const { code } = req.app.locals;

  const codeFound = await code.findOne({ where: { code: verificationCode } });

  if (!codeFound) {
    return res.status(401).json({ error: 'Invalid verification code' });
  }

  const userFound = await user.findOne({ where: { id: codeFound.userId } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (signup) {
    await user.update({ authenticated: true }, { where: { id: codeFound.userId } });
  }

  await code.update({ authenticated: true }, { where: { code: verificationCode } });

  delete userFound.dataValues.passwordHash;
  return res.status(200).json({ message: 'Verification successful for ' + userFound.username + " with ID " + userFound.id, user: userFound });
});

router.post('/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  const { user } = req.app.locals;
  const { code } = req.app.locals;

  // Convert email and phone to lowercase
  const lowercaseEmail = email.toLowerCase();
  const lowercasePhone = phone.toLowerCase();

  // Check if the email already exists in the database
  const existingEmail = await user.findOne({ where: { email: lowercaseEmail } });
  if (existingEmail) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  // Check if the phone number already exists in the database
  const existingPhone = await user.findOne({ where: { phone: lowercasePhone } });
  if (existingPhone) {
    return res.status(400).json({ error: 'An account with this phone number already exists' });
  }

  // If neither the email nor the phone number exists, proceed with user registration
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await user.create({ username, passwordHash, email, phone, emailNotifications: true, smsNotifications: true, twoFactorAuth: false, authenticated: false, role: 'attendee' });

  // generate a code and send to phone for auth
  const generatedCode = Math.floor(100000 + Math.random() * 900000);
  const record = await code.create({ code: generatedCode, authenticated: false, userId: newUser.id });

  // Send the code to the user's email or phone number
  sendSMS(phone, `Your verification code is: ${generatedCode}`);

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