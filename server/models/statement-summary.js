var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatementSummary = new Schema({
  body: String,
  score: Number,
  type: String,
  scores: {
    support: Number,
    opposition: Number,
    objection: Number
  }
});

StatementSummary.methods.toJSON = function() {
  var summary = {
    id: this._id,
    body: this.body,
    score: this.score,
    type: this.type,
    scores: {
      support: this.scores ? this.scores.support : 0,
      opposition: this.scores ? this.scores.opposition : 0,
      objection: this.scores ? this.scores.objection : 0
    }
  };

  return summary;
};

StatementSummary.fromJSON = function(obj) {
  var summary = new (mongoose.model('StatementSummary', StatementSummary))({
    _id: obj.id,
    body: obj.body,
    score: obj.score,
    type: obj.type,
    scores: {
      support: obj.scores.support,
      opposition: obj.scores.opposition,
      objection: obj.scores.objection
    }
  });

  return summary;
};

module.exports = StatementSummary;