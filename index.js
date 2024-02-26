const express = require('express');

const authMiddleware = require('./src/auth/authMiddlware');

const connection = require('./src/database/connection');
const Event = require('./src/database/model/events');
const User = require('./src/database/model/users');

const authRouter = require('./src/routes/auth');
const eventsRouter = require('./src/routes/events');

const app = express();
const PORT = 3000;

// dependency injection models
app.use(express.json())
app.use((req, res, next) => {
  req.app.locals.event = Event;
  req.app.locals.user = User;
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

  app.listen(PORT, () => {
    console.log('Events API running on port ' + PORT);
  });
}

loadServer();