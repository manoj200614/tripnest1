const express = require('express');
const Trip = require('../models/Trip');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // every trip route needs login

// Helper: find a trip only if the user is the owner or a shared member
const findMyTrip = (tripId, userId) =>
  Trip.findOne({ _id: tripId, $or: [{ owner: userId }, { members: userId }] });

/* ---------- TRIP CRUD ---------- */

// Create trip
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, budget } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const trip = await Trip.create({
      title, description, startDate, endDate, budget, owner: req.userId,
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all my trips (own + shared with me)
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [{ owner: req.userId }, { members: req.userId }],
    }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await findMyTrip(req.params.id, req.userId)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update trip basic details
router.put('/:id', async (req, res) => {
  try {
    const trip = await findMyTrip(req.params.id, req.userId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    ['title', 'description', 'startDate', 'endDate', 'budget'].forEach((f) => {
      if (req.body[f] !== undefined) trip[f] = req.body[f];
    });
    await trip.save();
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete trip (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not the owner' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- DESTINATIONS / ITINERARY / EXPENSES ---------- */
// One helper creates add + delete routes for each list inside a trip
const addListRoutes = (path, field) => {
  router.post(`/:id/${path}`, async (req, res) => {
    try {
      const trip = await findMyTrip(req.params.id, req.userId);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      trip[field].push(req.body);
      await trip.save();
      res.status(201).json(trip[field]);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.delete(`/:id/${path}/:itemId`, async (req, res) => {
    try {
      const trip = await findMyTrip(req.params.id, req.userId);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      trip[field].pull({ _id: req.params.itemId });
      await trip.save();
      res.json(trip[field]);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
};

addListRoutes('destinations', 'destinations');
addListRoutes('itinerary', 'itinerary');
addListRoutes('expenses', 'expenses');

// Expense estimate: total, per-category, remaining budget
router.get('/:id/expenses/summary', async (req, res) => {
  try {
    const trip = await findMyTrip(req.params.id, req.userId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const byCategory = {};
    let total = 0;
    trip.expenses.forEach((e) => {
      total += e.amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const people = trip.members.length + 1;
    res.json({
      budget: trip.budget,
      totalSpent: total,
      remaining: trip.budget - total,
      perPerson: Math.round((total / people) * 100) / 100,
      byCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- SHARING ---------- */

// Share trip with a friend by their registered email
router.post('/:id/share', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, owner: req.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found or you are not the owner' });

    const friend = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!friend) return res.status(404).json({ message: 'No user with that email' });
    if (friend._id.equals(req.userId))
      return res.status(400).json({ message: 'You already own this trip' });

    if (!trip.members.some((m) => m.equals(friend._id))) {
      trip.members.push(friend._id);
      await trip.save();
    }
    res.json({ message: `Trip shared with ${friend.name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
