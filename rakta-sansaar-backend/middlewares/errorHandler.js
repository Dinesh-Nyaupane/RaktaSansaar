const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the full error stack to the console
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    // Return a 400 Bad Request status for validation errors
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors, // List all validation error details
    });
  }

  if (err.name === 'MongoNetworkError') {
    // Special handling for MongoDB connection errors
    return res.status(500).json({
      message: 'Database connection error',
      error: err.message,
    });
  }

  // Handle other generic errors (e.g., missing resources, etc.)
  return res.status(500).json({
    message: 'Something went wrong!',
    error: err.message || 'Unknown error',
  });
};

module.exports = { errorHandler };
