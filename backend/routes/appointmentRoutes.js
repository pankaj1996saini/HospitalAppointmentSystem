const express = require('express');
const { body } = require('express-validator');
const {
  bookAppointment, listAppointments, getAppointment, updateAppointment, setStatus, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('patient'),
  [
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').trim().notEmpty().withMessage('Time slot is required'),
    body('reason').trim().notEmpty().withMessage('Please give a reason for the visit'),
  ],
  bookAppointment
);

router.get('/', protect, listAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.put('/:id/status', protect, authorize('admin'), setStatus);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
