var mongoose = require('mongoose');
var Debate = mongoose.model('Debate', require('../models/debate'));

module.exports = function() {
  return {
    list: function(cb) {
      Debate.find({}).populate('statements').exec(cb);
    },

    get: function(cb, id) {
      Debate.findById(id).populate('statements').exec(cb);
    },

    create: function(cb, debate) {
      Debate.fromJSON(debate).save(cb);
    }
  };
}();