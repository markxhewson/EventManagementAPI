const express = require('express');
const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { user } = req.app.locals;

  const userFound = await user.findOne({ where: { id } });

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(userFound);
});

