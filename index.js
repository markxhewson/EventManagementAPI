const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const authMiddleware = require('./src/auth/authMiddlware');

const connection = require('./src/database/connection');
const Event = require('./src/database/model/events');
const User = require('./src/database/model/users');
const EventRegistration = require('./src/database/model/eventRegistrations');

const authRouter = require('./src/routes/auth');
const eventsRouter = require('./src/routes/events');
const usersRouter = require('./src/routes/users');
const registrationsRouter = require('./src/routes/eventRegistrations');

const app = express();
const PORT = 3001;

// dependency injection models
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  req.app.locals.event = Event;
  req.app.locals.user = User;
  req.app.locals.eventRegistration = EventRegistration;
  next();
})

// auth middleware (api keys)
app.use(authMiddleware);

// endpoint routes
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/users", usersRouter);
app.use("/registrations", registrationsRouter)

// final middleware check for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const loadServer = async () => {
  await connection.authenticate();
  await Event.sync();
  await User.sync();
  await EventRegistration.sync();

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
    await User.create({ username: 'organiser', passwordHash: password, email: 'organiser@gmail.com', phone: '1234567890', emailNotifications: true, smsNotifications: true, twoFactorAuth: false, role: 'organiser' });
  }

  if (!attendee) {
    const password = await bcrypt.hash('attendee', 10);
    await User.create({ username: 'attendee', passwordHash: password, email: 'attendee@gmail.com', phone: '1234567890', emailNotifications: true, smsNotifications: true, twoFactorAuth: false, role: 'attendee' });
  }
}

loadServer();