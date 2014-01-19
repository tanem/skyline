
module.exports = function(min, max, truncate) {
  min = min || 0;
  max = max || min + 1;

  if(truncate)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  
  return Math.random() * (max - min) + min;
};
