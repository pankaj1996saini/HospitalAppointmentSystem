// Creates a default admin login so there's a way into the admin dashboard
// after a fresh install. Doesn't touch doctors/appointments - those get
// added through the app itself, per the "no hard-coded records" rule.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();

  const adminEmail = 'admin@hospital.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log('Admin account already exists, nothing to do.');
  } else {
    await User.create({
      name: 'Hospital Admin',
      email: adminEmail,
      password: 'Admin@123',
      phone: '0000000000',
      role: 'admin',
    });
    console.log(`Admin created -> ${adminEmail} / Admin@123`);
  }

  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
