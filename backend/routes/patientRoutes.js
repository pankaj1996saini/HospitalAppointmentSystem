const express = require('express');
const { listPatients, updatePatientStatus } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), listPatients);
router.put('/:id/status', protect, authorize('admin'), updatePatientStatus);

module.exports = router;
