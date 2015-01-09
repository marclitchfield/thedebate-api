var mongoose = require('mongoose');
var Debate = mongoose.model('Debate', require('../models/debate'));

function populate(query) {
  query.populate({
    path: 'statements',
    match: { tag: { $nin: ['junk'] } }
  });
  return query;
}

module.exports = function() {
  return {
    list: function(cb) {
      Debate.find({}, function(err, debates) { cb(err, Debate.summarize(debates)); });
    },

    get: function(id, cb) {
      populate(Debate.findById(id)).exec(cb);
    },
 
    create: function(debate, cb) {
      Debate.fromJSON(debate).save(cb);
    }
  };
}();