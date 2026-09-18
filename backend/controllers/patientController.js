const User = require('../models/User');

// admin-facing: list/search patients, block or reactivate accounts
async function listPatients(req, res, next) {
  try {
    const { search, status } = req.query;
    const query = { role: 'patient' };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    next(err);
  }
}

async function updatePatientStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'blocked'" });
    }

    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.status = status;
    await patient.save();

    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPatients, updatePatientStatus };
