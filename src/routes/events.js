const path = require('path');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const sendEmail = require('../verification/sendEmail');
const sendSMS = require('../verification/sendSMS');
const { Op } = require('sequelize');

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
router.post('/', imageUpload.single('image'), async (req, res) => {
  const { name, description, start_date, end_date, location, max_registrations, interests } = req.body;
  const { event, eventInterests } = req.app.locals;

  const newEvent = await event.create({
    name,
    description,
    start_date,
    end_date,
    location,
    image_url: req.file ? `/uploads/${req.file.filename}` : null,
    max_registrations: Number(max_registrations)
  });

  if (interests) {
    const arr = Array.isArray(interests) ? interests : [interests];
    for (const interestId of arr) {
      await eventInterests.create({
        eventId: newEvent.id,
        interestId: Number(interestId)
      });
    }
  }

  return res.status(201).json(newEvent);
});

// get all events
router.get('/', async (req, res) => {
  const { event } = req.app.locals;

  const events = await event.findAll();

  return res.status(200).json(events);
});

// update event status
router.put('/status/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { status, sendAlerts } = req.body;
  const { event, eventRegistration, user } = req.app.locals;

  const eventFound = await event.findOne({ where: { id: eventId } });
  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Update status
  eventFound.status = status;
  await eventFound.save();

  if (!sendAlerts || status !== 'cancelled') {
    // No alerts to send
    return res.status(200).json({});
  }

  // Send alert email or SMS to all registered users
  const regData = await eventRegistration.findAll({ where: { eventId } });
  const usersData = await user.findAll({ where: {
    id: {
      [Op.in]: regData.map(registration => registration.userId)
    }
  }});

  // send off all alerts simultaneously and collect errors silently
  const results = await Promise.allSettled(
    usersData.map(async (user) => {
      // respect contact preferences
      const date = new Date(eventFound.start_date).toLocaleDateString('en-GB');
      const content = `The event '${eventFound.name}' that you've registered for on ${date} has been cancelled. We apologize for any inconvenience.`;

      try {
        if (user.emailNotifications) {
          const subject = 'Event Cancelled!';
          return await sendEmail(subject, user.email, content);
        }
        else if (user.smsNotifications) {
          const recipient = user.phone;
          return await sendSMS(recipient, content);
        }
      } catch(err) {
        throw {
          username: user.username,
          code: 'SEND_FAILED',
          message: err.message
        }
      }
      throw {
        username: user.username,
        code: 'CONTACT_PREFS_DISABLED'
      }
    })
  );

  // collect errors and return them
  const alertErrors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  if (alertErrors.length !== 0) {
    console.error('Failed to send cancellation alerts: ', alertErrors);
  }
  return res.status(200).json({
    alertErrors
  });
});

// update event details
router.put('/:eventId', imageUpload.single('image'), async (req, res) => {
  const { eventId } = req.params;
  const { name, description, start_date, end_date, location, max_registrations, interests } = req.body;
  const { event, eventInterests } = req.app.locals;

  const eventFound = await event.findOne({ where: { id: eventId } });

  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Update specified fields
  eventFound.name = name || eventFound.name;
  eventFound.description = description || eventFound.description;
  eventFound.start_date = start_date || eventFound.start_date;
  eventFound.end_date = end_date || eventFound.end_date;
  eventFound.location = location || eventFound.location;
  eventFound.max_registrations = Number(max_registrations) || (max_registrations ? eventFound.max_registrations : null);
  eventFound.image_url = req.file ? `/uploads/${req.file.filename}` : eventFound.image_url;

  await eventInterests.destroy({ where: { eventId } });
  if (interests) {
    const arr = Array.isArray(interests) ? interests : [interests];
    for (const interestId of arr) {
      await eventInterests.create({
        eventId,
        interestId: Number(interestId)
      });
    }
  }

  // Update the event with the merged data
  await eventFound.save();
  return res.status(200).json(eventFound);
});

// get a specific event
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { event, eventInterests, interests } = req.app.locals;

  const eventFound = await event.findOne({ where: { id } });
  if (!eventFound) {
    return res.status(404).json({ error: 'Event not found' });
  }

  eventFound.views += 1;
  eventFound.save();
  
  const names = await interests.findAll();
  const eventInts = await eventInterests.findAll({ where: { eventId: id } });

  res.status(200).json({
    ...eventFound.dataValues,
    interests: eventInts.map(e => {
      return {
        ...e.dataValues,
        name: names.find(n => n.id === e.interestId)?.name
      };
    })
  });
});



module.exports = router;