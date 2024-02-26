const express = require('express');
const router = express.Router();

// create an event
router.post('/', async (req, res) => {
  const { name, date, description, location, publisher } = req.body;
  const { event } = req.app.locals;

  const newEvent = await event.create({ name, date, description, location, publisher, views: 0, interested: 0, going: 0 });

  return res.status(201).json(newEvent);
});

// get all events
router.get('/', async (req, res) => {
  const { event } = req.app.locals;

  const events = await event.findAll();

  return res.status(200).json(events);
});

router.post('/update/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { name, date, description, location, views, interested, going } = req.body;
  const { event } = req.app.locals;

  const eventFound = await event.findOne({ where: { id: eventId } });

  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Create an object containing only the properties that were passed in the request body
  const updatedEventData = {
    name: name || eventFound.name,
    date: date || eventFound.date,
    description: description || eventFound.description,
    location: location || eventFound.location,
    views: views || eventFound.views,
    interested: interested || eventFound.interested,
    going: going || eventFound.going
  };

  // Update the event with the merged data
  await event.update(updatedEventData, { where: { id: eventId } });
  const newEvent = await event.findOne({ where: { id: eventId } });

  return res.status(200).json(newEvent);
});


// get a specific event
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { event } = req.app.locals;

  const eventFound = await event.findOne({ where: { id } });

  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  return res.status(200).json(eventFound);
});

// delete a specific event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { event } = req.app.locals;

  const eventFound = await event.findOne({ where: { id } });

  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  await event.destroy({ where: { id } });

  return res.status(204).json();
});

module.exports = router;