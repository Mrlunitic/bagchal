const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    result: {
      type: String,
      enum: ['win', 'loss', 'draw'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['pvp', 'ai'],
      default: 'pvp',
    },
    side: {
      type: String,
      enum: ['tiger', 'goat'],
      default: 'goat',
    },
    capturedGoats: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
