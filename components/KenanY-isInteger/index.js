/**
 * Check if a Number is an integer
 *
 * @param {Number} x
 * @return {Boolean} is integer
 * @api public
 */
module.exports = function(x) {
  return (x === Math.round(x));
};