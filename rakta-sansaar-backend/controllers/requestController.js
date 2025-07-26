const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const User = require('../models/User');

// ✳️ Validation rules for creating a request
const validateCreateRequest = [
  body('bloodType').notEmpty().withMessage('Blood type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity should be a positive number'),
  body('requesterId').notEmpty().withMessage('Requester ID is required'),
  body('location').notEmpty().withMessage('Location is required'),
];

// ✳️ Create a blood donation request
const createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { bloodType, quantity, requesterId, location } = req.body;

  try {
    const requester = await User.findById(requesterId);
    if (!requester) return res.status(404).json({ message: 'Requester not found' });

    const newRequest = new Request({
      bloodType,
      quantity,
      requester: requesterId,
      location,
      status: 'Pending',
      createdAt: new Date(),
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request created successfully', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✳️ Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('requester', 'name email bloodType');
    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✳️ Get request by ID
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('requester', 'name email bloodType');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.status(200).json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✳️ Update request status
const updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();
    res.status(200).json({ message: 'Request status updated', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  validateCreateRequest,
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
};
