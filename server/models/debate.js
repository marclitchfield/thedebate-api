var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var StatementSummary = require('./statement-summary');

var Debate = new Schema({
  title: String,
  score: Number,
  statements: [StatementSummary]
});

Debate.methods.toJSON = function() {
  console.log('Debate.toJSON', this);
  return {
    id: this._id,
    title: this.title,
    score: this.score,
    statements: this.statements.map(function(statement) {
      return {
        id: statement._id,
        body: statement.body,
        score: statement.score,
        scores: {
          support: statement.scores.support,
          opposition: statement.scores.opposition,
          objection: statement.scores.objection
        }
      };
    })
  };
};

Debate.statics.fromJSON = function(obj) {
  var debate = new (mongoose.model('Debate', Debate))({
    title: obj.title,
    score: obj.score,
    statements: (obj.statements || []).map(function(statement) {
      return StatementSummary.fromJSON(statement);
    })
  });

  if (obj.id) {
    debate._id = new ObjectId(obj.id);
  }

  return debate;
};

module.exports = Debate;