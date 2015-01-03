var mongoose = require('mongoose');
var Debate = mongoose.model('Debate', require('../models/debate'));

module.exports = function() {
  return {
    list: function(cb) {
      Debate.find({}).populate('statements').exec(cb);
    },

    get: function(id, cb) {
      Debate.findById(id).populate('statements').exec(cb);
    },
 
    create: function(debate, cb) {
      Debate.fromJSON(debate).save(cb);
    }
  };
}();