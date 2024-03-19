const path = require('path');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const multer = require('multer');

/**
 * Image upload middleware
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomUUID();
    file.mimetype
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only images are allowed."))
    }
  }
});

// create an event
router.post('/', async (req, res) => {
  imageUpload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Image upload error' });
    }
    else if (err) {
      return res.status(400).json({ error: 'Image upload error' });
    }

    const { name, description, start_date, end_date, location } = req.body;
    const { event } = req.app.locals;

    const newEvent = await event.create({
      name,
      description,
      start_date,
      end_date,
      location,
      createdBy: 1,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
    });

    return res.status(201).json(newEvent);
  });
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