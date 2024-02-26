const express = require('express');

const authMiddleware = require('./src/auth/authMiddlware');

const connection = require('./src/database/connection');
const Event = require('./src/database/model/events');
const User = require('./src/database/model/users');
const EventRegistration = require('./src/database/model/eventRegistrations');

const authRouter = require('./src/routes/auth');
const eventsRouter = require('./src/routes/events');

const app = express();
const PORT = 3000;

// dependency injection models
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
app.use("/events/auth", authRouter);
app.use("/events", eventsRouter);

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
    await User.create({ username: 'organiser', passwordHash: 'organiser', email: 'organiser@gmail.com', phone: '1234567890', role: 'organiser' });
  }

  if (!attendee) {
    await User.create({ username: 'attendee', passwordHash: 'attendee', email: 'attendee@gmail.com', phone: '1234567890', role: 'attendee' });
  }
}

loadServer();