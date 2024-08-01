/**
 * Middleware to handle HTTP methods that are not allowed for a particular route.
 * 
 * @param {Object} request - The Express request object.
 * @param {Object} response - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 */

function methodNotAllowed(request, response, next) {
    next({
      status: 405,
      message: `${request.method} not allowed for ${request.originalUrl}`,
    });
  }
  
  module.exports = methodNotAllowed;