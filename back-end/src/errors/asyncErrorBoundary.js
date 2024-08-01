/**
 * Wraps an asynchronous function and ensures that any errors are caught and passed to the next error-handling middleware.
 * 
 * @param {Function} delegate - The asynchronous function to wrap.
 * @param {number} [defaultStatus] - The default status code to use if the error does not specify one.
 * @returns {Function} A middleware function that handles errors from delegate function.
 */

function asyncErrorBoundary(delegate, defaultStatus) {
    return (request, response, next) => {
      Promise.resolve()
        .then(() => delegate(request, response, next))
        .catch((error = {}) => {
          const { status = defaultStatus, message = error } = error;
          next({
            status,
            message,
          });
        });
    };
  }
  
  module.exports = asyncErrorBoundary;