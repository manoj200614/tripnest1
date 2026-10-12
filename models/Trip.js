const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  notes: String,
});

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },       // Day 1, Day 2...
  title: { type: String, required: true },     // e.g. "Visit Eiffel Tower"
  time: String,                                // e.g. "10:00 AM"
  location: String,
  notes: String,
});

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Travel', 'Stay', 'Food', 'Activities', 'Shopping', 'Other'],
    default: 'Other',
  },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    startDate: Date,
    endDate: Date,
    budget: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // shared with
    destinations: [destinationSchema],
    itinerary: [itinerarySchema],
    expenses: [expenseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
