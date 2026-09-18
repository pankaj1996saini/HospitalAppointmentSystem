// Dummy data seeder for demo purposes - doctors + patients.
//
// This has to go through the actual Mongoose models (not a raw mongosh
// insert) so patient passwords get bcrypt-hashed by the User model's
// pre('save') hook the same way a real registration would. Doctors don't
// have passwords so they'd be fine either way, but keeping everything in
// one script is simpler.
//
// Usage:
//   1. Drop this file into hospital-appointment-system/backend/seed/
//   2. From the backend folder, run: node seed/seed-dummy-data.js
//
// Safe to re-run - it skips anything that already exists by email/name.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const doctors = [
  {
    name: 'Ananya Sharma',
    specialization: 'Cardiologist',
    experience: 12,
    qualification: 'MBBS, MD (Cardiology)',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTime: '10:00 AM - 4:00 PM',
    consultationFee: 800,
    bio: 'Specializes in interventional cardiology and preventive heart care.',
  },
  {
    name: 'Rohit Mehta',
    specialization: 'Orthopedic Surgeon',
    experience: 8,
    qualification: 'MBBS, MS (Orthopedics)',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableTime: '9:00 AM - 1:00 PM',
    consultationFee: 700,
    bio: 'Focuses on sports injuries and joint replacement surgery.',
  },
  {
    name: 'Priya Nair',
    specialization: 'Pediatrician',
    experience: 15,
    qualification: 'MBBS, DCH',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTime: '11:00 AM - 5:00 PM',
    consultationFee: 600,
    bio: 'Fifteen years treating newborns through teens, with a focus on vaccination care.',
  },
  {
    name: 'Karan Verma',
    specialization: 'Dermatologist',
    experience: 6,
    qualification: 'MBBS, MD (Dermatology)',
    availableDays: ['Wednesday', 'Friday', 'Saturday'],
    availableTime: '2:00 PM - 6:00 PM',
    consultationFee: 650,
    bio: 'Treats acne, skin allergies, and cosmetic dermatology cases.',
  },
  {
    name: 'Sneha Iyer',
    specialization: 'General Physician',
    experience: 10,
    qualification: 'MBBS, MD (General Medicine)',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableTime: '9:00 AM - 3:00 PM',
    consultationFee: 500,
    bio: 'First point of contact for general health concerns and referrals.',
  },
  {
    name: 'Arjun Reddy',
    specialization: 'Neurologist',
    experience: 14,
    qualification: 'MBBS, DM (Neurology)',
    availableDays: ['Tuesday', 'Thursday'],
    availableTime: '10:00 AM - 2:00 PM',
    consultationFee: 900,
    bio: 'Handles migraines, seizure disorders, and post-stroke care.',
  },
];

const patients = [
  {
    name: 'Meera Joshi',
    email: 'meera.joshi@example.com',
    phone: '9876500001',
    dob: '1994-03-12',
    gender: 'female',
    address: '14 Lake View Road, Pune',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '9876500002',
    dob: '1988-07-22',
    gender: 'male',
    address: '221 MG Road, Bengaluru',
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha.khan@example.com',
    phone: '9876500003',
    dob: '1996-11-05',
    gender: 'female',
    address: '7 Green Park, New Delhi',
  },
  {
    name: 'Rahul Kapoor',
    email: 'rahul.kapoor@example.com',
    phone: '9876500004',
    dob: '1991-01-30',
    gender: 'male',
    address: '58 Anna Salai, Chennai',
  },
  {
    name: 'Divya Menon',
    email: 'divya.menon@example.com',
    phone: '9876500005',
    dob: '1999-09-18',
    gender: 'female',
    address: '3 Marine Drive, Kochi',
  },
];

const DEMO_PASSWORD = 'Patient@123';

(async () => {
  await connectDB();

  let doctorsAdded = 0;
  for (const doc of doctors) {
    const exists = await Doctor.findOne({ name: doc.name });
    if (exists) continue;
    await Doctor.create(doc);
    doctorsAdded++;
  }
  console.log(`Doctors added: ${doctorsAdded} (skipped ${doctors.length - doctorsAdded} already present)`);

  let patientsAdded = 0;
  for (const p of patients) {
    const exists = await User.findOne({ email: p.email });
    if (exists) continue;
    await User.create({ ...p, password: DEMO_PASSWORD, role: 'patient' });
    patientsAdded++;
  }
  console.log(`Patients added: ${patientsAdded} (skipped ${patients.length - patientsAdded} already present)`);

  if (patientsAdded > 0) {
    console.log(`\nAll new patients can log in with password: ${DEMO_PASSWORD}`);
    console.log('Emails:', patients.map((p) => p.email).join(', '));
  }

  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
