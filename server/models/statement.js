var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var StatementSummary = require('./statement-summary');

var Statement = new Schema({
  body: String,
  score: { type: Number, default: 0 },
  type: String,
  upvotes: { type: Number, default: 0 },
  scores: {
    support: { type: Number, default: 0 },
    opposition: { type: Number, default: 0 },
    objection: { type: Number, default: 0 },
  },
  debate: {
    _id: ObjectId,
    title: String,
    score: { type: Number, default: 0 },
  },
  chain: [StatementSummary],
  responses: [StatementSummary]
});

Statement.methods.toJSON = function() {
  return {
    id: this._id,
    body: this.body,
    score: this.score,
    type: this.type,
    upvotes: this.upvotes || 0,
    scores: {
      support: this.scores ? this.scores.support : 0,
      opposition: this.scores ? this.scores.opposition : 0,
      objection: this.scores ? this.scores.objection : 0
    },
    debate: {
      id: this.debate._id,
      title: this.debate.title,
      score: this.debate.score
    },
    chain: this.chain.map(function(summary) {
      return summary.toJSON();
    }),
    responses: this.responses.map(function(summary) {
      return summary.toJSON();
    })
  };
};

Statement.statics.fromJSON = function(obj) {
  var statement = new (mongoose.model('Statement', Statement))({
    body: obj.body,
    score: obj.score || 0,
    scores: obj.scores,
    type: obj.type,
    upvotes: obj.upvotes || 0,
    debate: {
      _id: obj.debate.id,
      title: obj.debate.title,
      score: obj.debate.score || 0
    },
    chain: (obj.chain || []).map(function(statement) {
      return StatementSummary.fromJSON(statement);
    }),
    responses: (obj.responses || []).map(function(response) {
      return StatementSummary.fromJSON(response);
    })
  });

  if (obj.id) {
    statement._id = new ObjectId(obj.id);
  }

  return statement;
};

Statement.methods.summary = function() {
  return new (mongoose.model('StatementSummary', StatementSummary))({
    _id: this._id,
    body: this.body,
    score: this.score,
    type: this.type,
    scores: {
      support: this.scores.support,
      opposition: this.scores.opposition,
      objection: this.scores.objection
    }
  });
};

module.exports = Statement;