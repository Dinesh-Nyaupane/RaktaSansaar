const express = require('express');
const User = require('../models/User'); // Assuming you have a User model
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken'); // Make sure you have a middleware to authenticate the token

// Route to get user's location based on the token
router.get('/userLocation', authenticateToken, async (req, res) => {
  try {
    // Extract user ID from the token (middleware should set req.user)
    const userId = req.user.id;
    
    // Retrieve user location from the database (assuming location is stored in User model)
    const user = await User.findById(userId).select('location'); // Adjust based on how location is stored
    
    if (!user || !user.location || !user.location.coordinates) {
      return res.status(404).json({ message: 'User location not found' });
    }
    
    // Extract latitude and longitude from the coordinates array (MongoDB stores as [longitude, latitude])
    const [longitude, latitude] = user.location.coordinates; // coordinates is an array: [longitude, latitude]
    
    // Send the user's latitude and longitude as the response
    res.json({ latitude, longitude });
  } catch (error) {
    console.error('Error fetching user location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
