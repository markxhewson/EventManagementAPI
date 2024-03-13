const express = require('express');
const router = express.Router();

// create an event
router.post('/', async (req, res) => {
  const { name, description, image_url, start_date, end_date, location } = req.body;
  const { event } = req.app.locals;

  const newEvent = await event.create({ name, description, image_url, start_date, end_date, location, createdBy: 1 });

  return res.status(201).json(newEvent);
});

// get all events
router.get('/', async (req, res) => {
  const { event } = req.app.locals;

  const events = await event.findAll();

  return res.status(200).json(events);
});

router.put('/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { name, description, image_url, start_date, end_date, location } = req.body;
  const { event } = req.app.locals;

  const eventFound = await event.findOne({ where: { id: eventId } });

  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Update specified fields
  eventFound.name = name || eventFound.name,
  eventFound.description = description || eventFound.description,
  eventFound.image_url = image_url || eventFound.image_url,
  eventFound.start_date = start_date || eventFound.start_date,
  eventFound.end_date = end_date || eventFound.end_date,
  eventFound.location = location || eventFound.location

  // Update the event with the merged data
  await eventFound.save();
  return res.status(200).json(eventFound);
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