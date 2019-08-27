'use strict';
/**
 * API Server Module
 * @module src/auth/404
 */

/**
 * Middleware to send error message when resource not found
 * @param req
 * @param res
 * @param next
 */
module.exports = (req,res,next) => {
  let error = { error: 'Resource Not Found' };
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
};