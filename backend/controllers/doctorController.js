const { validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

async function listDoctors(req, res, next) {
  try {
    const { search, specialization, day, sortBy, order, status, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (day) query.availableDays = day;

    if (status === 'all') {
      // admin view - no filter
    } else if (status === 'inactive') {
      query.isActive = false;
    } else {
      query.isActive = true;
    }

    const sortField = ['name', 'experience', 'consultationFee', 'createdAt'].includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? -1 : 1;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limitNum),
      Doctor.countDocuments(query),
    ]);

    res.json({ success: true, count: doctors.length, total, page: pageNum, pages: Math.ceil(total / limitNum), data: doctors });
  } catch (err) {
    next(err);
  }
}

async function getDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
}

async function createDoctor(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
}

async function updateDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const editable = [
      'name', 'specialization', 'experience', 'qualification',
      'availableDays', 'availableTime', 'consultationFee', 'image', 'bio', 'isActive',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
}

async function deleteDoctor(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // clear out any pending/confirmed appointments tied to this doctor rather
    // than leaving dangling references behind
    await Appointment.deleteMany({ doctor: doctor._id });
    await doctor.deleteOne();

    res.json({ success: true, message: 'Doctor and their appointments removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };
