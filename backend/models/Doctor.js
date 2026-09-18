const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 }, // years
    qualification: { type: String, required: true, trim: true },
    availableDays: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Pick at least one available day',
      },
    },
    availableTime: { type: String, required: true }, // e.g. "10:00 AM - 4:00 PM"
    consultationFee: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
