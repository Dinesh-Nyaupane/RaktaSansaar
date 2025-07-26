const express = require('express');
const router = express.Router();
const DonationRequest = require('../models/donationRequest');
const User = require('../models/User');

// Utils
const sendMail = require('../utils/sendMail');
const sendSMS = require('../utils/sendSMS');

// ✅ POST: Create a donation request
router.post('/request-donation', async (req, res) => {
  const { donorId, userId } = req.body;

  try {
    // Prevent duplicate requests
    const exists = await DonationRequest.findOne({ donorId, requesterId: userId });
    if (exists) {
      return res.status(400).json({ message: 'Request already sent.' });
    }

    // Create new request
    const request = await DonationRequest.create({ donorId, requesterId: userId });

    // Fetch user info
    const donor = await User.findById(donorId);
    const requester = await User.findById(userId);

    // 📨 Send email
    if (donor?.email) {
      await sendMail(
        donor.email,
        '🩸 New Blood Donation Request',
        `Hello ${donor.name},\n\nYou have a new blood donation request from ${requester.name}.\nPlease log in to Rakta Sansaar to respond.\n\nThank you!`
      );
    }

    // 📲 Send SMS
    if (donor?.phone) {
      await sendSMS(
        donor.phone,
        `🩸 Hello ${donor.name}, you have a new blood donation request from ${requester.name} via Rakta Sansaar.`
      );
    }

    res.status(200).json({ message: 'Request sent and notification delivered.' });
  } catch (err) {
    console.error('❌ Error in /request-donation:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ✅ GET: Fetch all requests made by a user
router.get('/my-requests/:userId', async (req, res) => {
  try {
    const requests = await DonationRequest.find({ requesterId: req.params.userId })
      .populate('donorId', 'name email bloodType');
    res.json({ requests });
  } catch (err) {
    console.error('❌ Error in /my-requests:', err);
    res.status(500).json({ message: 'Error fetching requests.' });
  }
});

// GET: All requests where current user is the donor
router.get('/my-donations/:donorId', async (req, res) => {
  try {
    const requests = await DonationRequest.find({ donorId: req.params.donorId })
      .populate('requesterId', 'name email bloodType location'); // populate requester info
    res.json({ requests });
  } catch (err) {
    console.error('❌ Error in /my-donations:', err);
    res.status(500).json({ message: 'Failed to fetch donor-side requests.' });
  }
});

// Express route example (Node.js + MongoDB)
router.delete('/delete-request/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const result = await DonationRequest.findByIdAndDelete(requestId);

    if (!result) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FINAL: PUT route to update status and send email to requester
router.put('/update-request-status/:requestId', async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await DonationRequest.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    ).populate('requesterId donorId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // ✅ Send email to requester
    const requester = request.requesterId;
    const donor = request.donorId;

    if (requester?.email) {
      const subject = `Your Blood Donation Request Has Been ${status.toUpperCase()}`;
      const html = `
        <p>Hi <strong>${requester.name}</strong>,</p>
        <p>Your blood donation request to <strong>${donor.name}</strong> has been <span style="color:${status === 'approved' ? 'green' : 'red'}">${status}</span>.</p>
        <p>Visit your <a href="https://rakta-sansaar.com/my-requests">My Requests</a> page for more info.</p>
        <p>🩸 Stay healthy,<br/>Rakta Sansaar Team</p>
      `;

      const plainText = `Hi ${requester.name},\n\nYour request to ${donor.name} has been ${status}.\nVisit your My Requests page on Rakta Sansaar.\n\nThanks,\nRakta Sansaar Team`;

      await sendMail(requester.email, subject, plainText, html);
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error('❌ Error updating donation request status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
