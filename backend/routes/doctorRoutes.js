const express = require('express');
const { body } = require('express-validator');
const {
  listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const doctorValidation = [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('qualification').trim().notEmpty().withMessage('Qualification is required'),
  body('availableDays').isArray({ min: 1 }).withMessage('Pick at least one available day'),
  body('availableTime').trim().notEmpty().withMessage('Available time is required'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
];

router.get('/', listDoctors);
router.get('/:id', getDoctor);

router.post('/', protect, authorize('admin'), doctorValidation, createDoctor);
router.put('/:id', protect, authorize('admin'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;
