const express = require('express');
const { Op } = require('sequelize');
const PDFDocument = require("pdfkit-table");
const router = express.Router();

// generate pdf for event regsitrations
router.get('/event/:id/pdf', async(req, res) => {
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
  
  // Prepare the data for the PDF tables
  let regs = [];
  let waitingList = [];

  for (const reg of registrations) {
    const user = usersData.find(u => u.id === reg.userId);
    if (reg.status === 'GOING') {
      regs.push([
        user.username,
        user.email,
        user.phone
      ]);
    }
    else {
      waitingList.push([
        user.username,
        user.email,
        user.phone
      ]);
    }
  }
  // Table arrays
  regs = regs.map((r, idx) => [idx + 1, ...r]);
  waitingList = waitingList.map((r, idx) => [idx + 1, ...r]);

  // Create a new PDF document
  const doc = new PDFDocument();

  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=event_registrations.pdf');

  // Pipe the PDF document to the response stream
  doc.pipe(res);

  const table1 = { 
    title: 'Event Registrations',
    headers: ['#', 'Username', 'Email', 'Phone'],
    rows: regs
  };
  await doc.table(table1, { columnsSize: [ 50, 100, 200, 100  ] });

  if (waitingList.length > 0) {
    doc.addPage();

    const table2 = {
      title: 'Waiting List',
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
  const { userId, eventId } = req.body;

  const { eventRegistration } = req.app.locals;

  const newRegistration = await eventRegistration.create({ userId, eventId, status: "GOING" });

  return res.status(201).json(newRegistration);
});

module.exports = router;