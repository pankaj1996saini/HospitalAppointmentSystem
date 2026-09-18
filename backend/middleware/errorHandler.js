function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let status = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    status = 400;
    // our only unique-index collision right now is the double-booking guard
    if (err.keyPattern && err.keyPattern.doctor) {
      message = 'This doctor is already booked for that date and time';
    } else {
      const field = Object.keys(err.keyValue || {})[0];
      message = `Duplicate value for ${field}`;
    }
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(status).json({
    success: false,
    message: message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
