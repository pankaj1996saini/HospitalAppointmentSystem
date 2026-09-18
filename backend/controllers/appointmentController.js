const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];

async function bookAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { doctor: doctorId, date, time, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found or not currently accepting appointments' });
    }

    const appointmentDate = new Date(date);
    if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "You can't book an appointment in the past" });
    }

    const weekday = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availableDays.includes(weekday)) {
      return res.status(400).json({ success: false, message: `Dr. ${doctor.name} isn't available on ${weekday}s` });
    }

    // double check before hitting the unique index, gives a friendlier message
    const clash = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      time,
      status: { $in: ACTIVE_STATUSES },
    });
    if (clash) {
      return res.status(400).json({ success: false, message: 'That slot is already booked. Please pick another time.' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: appointmentDate,
      time,
      reason,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    const { status, doctor, sortBy, order } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (doctor) {
      query.doctor = doctor;
    }

    if (status) query.status = status;

    const sortField = ['date', 'createdAt'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization consultationFee')
      .populate('patient', 'name email phone')
      .sort({ [sortField]: sortOrder });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor')
      .populate('patient', 'name email phone');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isOwner = appointment.patient._id.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not your appointment to view' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

// lets a patient tweak date/time/reason while the appointment is still pending
async function updateAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isOwner = appointment.patient.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not your appointment to edit' });
    }

    if (appointment.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be rescheduled' });
    }

    const { date, time, reason } = req.body;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (reason) appointment.reason = reason;

    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

// admin-only: confirm / reject / complete an appointment
async function setStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

// patient cancelling their own booking, or admin cancelling on their behalf
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isOwner = appointment.patient.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not your appointment to cancel' });
    }

    if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Appointment is already ${appointment.status}` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  bookAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  setStatus,
  cancelAppointment,
};
