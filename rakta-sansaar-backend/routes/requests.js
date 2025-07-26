const express = require('express');
const { body } = require('express-validator');
const requestController = require('../controllers/requestController');
const router = express.Router();

// Route: Create request
router.post(
  '/create',
  requestController.validateCreateRequest,
  requestController.createRequest
);

// Route: Get all requests
router.get('/all', requestController.getAllRequests);

// Route: Get single request by ID
router.get('/:id', requestController.getRequestById);

// Route: Update request status
router.put('/update/:id', requestController.updateRequestStatus);

module.exports = router;
