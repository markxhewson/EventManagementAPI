const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const authMiddleware = require('./src/auth/authMiddlware');
const apiRouter = require('./src/api');

const connection = require('./src/database/connection');
const Event = require('./src/database/model/events');
const User = require('./src/database/model/users');
const EventRegistration = require('./src/database/model/eventRegistrations');
const Code = require('./src/database/model/codes');
const Review = require('./src/database/model/reviews');
const Application = require('./src/database/model/applications');

const app = express();
const PORT = 3001;

/**
 * Middlewares
 */
app.use(cors())
app.use(express.json())
// dependency injection models
app.use((req, res, next) => {
  req.app.locals.event = Event;
  req.app.locals.user = User;
  req.app.locals.eventRegistration = EventRegistration;
  req.app.locals.code = Code;
  req.app.locals.review = Review;
  req.app.locals.application = Application;
  next();
})

// Serve static files for the frontend
app.use(express.static('dist'));

// API routes are under `/api` (protected by the authMiddleware)
app.use('/api', authMiddleware, apiRouter);

// Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const loadServer = async () => {
  await connection.authenticate();
  await Event.sync();
  await User.sync();
  await EventRegistration.sync();
  await Code.sync();
  await Review.sync();
  await Application.sync();

  await createDefaultUsers();

  app.listen(PORT, () => {
    console.log('Events API running on port ' + PORT);
  });
}

const createDefaultUsers = async () => {
  const organiser = await User.findOne({ where: { username: 'organiser' } });
  const attendee = await User.findOne({ where: { username: 'attendee' } });

  if (!organiser) {
    const password = await bcrypt.hash('organiser', 10);
    await User.create({ username: 'organiser', passwordHash: password, email: 'organiser@gmail.com', phone: '1234567890', emailNotifications: true, smsNotifications: true, twoFactorAuth: false, preferredAuth: 'sms', authenticated: false, role: 'organiser' });
  }

  if (!attendee) {
    const password = await bcrypt.hash('attendee', 10);
    await User.create({ username: 'attendee', passwordHash: password, email: 'attendee@gmail.com', phone: '1234567890', emailNotifications: true, smsNotifications: true, twoFactorAuth: false, preferredAuth: 'sms', authenticated: false, role: 'attendee' });
  }
}

loadServer();