const express = require('express');

const authRouter = require('./routes/auth');
const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const registrationsRouter = require('./routes/eventRegistrations');
const reviewsRouter = require('./routes/reviews');
const applicationsRouter = require('./routes/applications');
const interestsRouter = require('./routes/interests');

/**
 * All the API routes are defined here
 */
const apiRouter = express.Router();

// Define individual endpoints
apiRouter.use("/auth", authRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/registrations", registrationsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/interests", interestsRouter);

// final middleware check for unknown endpoints
apiRouter.use((req, res, next) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = apiRouter;
