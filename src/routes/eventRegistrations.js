const express = require('express');
const { Op } = require('sequelize');
const PDFDocument = require("pdfkit-table");
const router = express.Router();

// generate pdf for event regsitrations
router.post('/event/:id/pdf', async(req, res) => {
  const { id } = req.params;
  const { event, eventRegistration, user } = req.app.locals;

  const eventData = await event.findOne({ where: { id } });
  const regData = await eventRegistration.findAll({ where: { eventId: id } });
  const usersData = await user.findAll({ where:
    {
      id: {
        [Op.in]: regData.map(registration => registration.userId)
      }
    }
  });

  if (!eventData) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  // Prepare the data for the PDF tables
  const { name, max_registrations } = eventData;
  const data = regData.map((reg, idx) => {
    const user = usersData.find(u => u.id === reg.userId);
    return [
      idx + 1,
      user.username,
      user.email,
      user.phone
    ]
  });

  // Slice the registrations depending on the max_registrations
  let registrations = data;
  let waitingList = [];

  if (max_registrations && data.length > max_registrations) {
    registrations = data.slice(0, max_registrations);
    waitingList = data.slice(max_registrations);
  }

  // Create a new PDF document
  const doc = new PDFDocument();

  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline;filename=${name}_registrations.pdf`);

  // Pipe the PDF document to the response stream
  doc.pipe(res);

  const table1 = { 
    title: name,
    subtitle: 'Event Registrations',
    headers: ['#', 'Username', 'Email', 'Phone'],
    rows: registrations
  };
  await doc.table(table1, { columnsSize: [ 50, 100, 200, 100  ] });

  if (waitingList.length > 0) {
    doc.addPage();

    const table2 = {
      subtitle: 'Waiting List',
      headers: ['#', 'Username', 'Email', 'Phone'],
      rows: waitingList
    };
    await doc.table(table2, { columnsSize: [ 50, 100, 200, 100  ] });
  }

  // Finalize the PDF document
  doc.end();
})

// get all user registrations for a specific event id
router.get('/event/:id', async (req, res) => {
  const { id } = req.params;
  const { eventRegistration, user } = req.app.locals;

  const registrations = await eventRegistration.findAll({ where: { eventId: id } });
  const usersData = await user.findAll({ where:
    {
      id: {
        [Op.in]: registrations.map(registration => registration.userId)
      }
    }
  });

  return res.status(200).json(
    registrations.map(r => {
      const user = usersData.find(u => u.id === r.userId);
      return {
        ...r.dataValues,
        username: user.username,
        email: user.email,
        phone: user.phone
      };
    })
  );
});

// get all events a user has signed up for
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { eventRegistration } = req.app.locals;

  const registrations = await eventRegistration.findAll({ where: { userId: id } });

  return res.status(200).json(registrations);
});

// create a new event registration
router.post('/register', async (req, res) => {
  const { userId, eventId, event } = req.body;

  const { eventRegistration } = req.app.locals;

  const eventFound = await event.findOne({ where: { id: eventId } });
  if (eventFound.status === 'paused') {
    return res.status(400).json({ error: 'Event registration is paused' });
  }
  else if (eventFound.status === 'cancelled') {
    return res.status(400).json({ error: 'Event is cancelled' });
  }

  const newRegistration = await eventRegistration.create({ userId, eventId });
  return res.status(201).json(newRegistration);
});

module.exports = router;