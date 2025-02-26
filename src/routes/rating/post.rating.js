const express = require('express');
const { createRating, getAverageRating } = require('../../controllers/rating');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    await createRating(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:doctorId', async (req, res, next) => {
  try {
    await getAverageRating(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
