var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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
  debate: { type: ObjectId, ref: 'Debate' },
  chain: [{ type: ObjectId, ref: 'Statement' }],
  responses: [{ type: ObjectId, ref: 'Statement' }]
});

Statement.methods.toJSON = function() {
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;

  obj.debate = this.debate.toJSON();
  obj.chain = this.chain.map(function(statement) { return statement.toJSON(); });
  obj.responses = this.responses.map(function(statement) { return statement.toJSON(); });

  return obj;
};

Statement.statics.fromJSON = function(obj) {
  var statement = new (mongoose.model('Statement', Statement))({
    body: obj.body,
    score: obj.score || 0,
    scores: obj.scores,
    type: obj.type,
    upvotes: obj.upvotes || 0,
    debate: obj.debate.id,
    chain: (obj.chain || []).map(function(statement) { return statement.id; }),
    responses: (obj.responses || []).map(function(response) { return response.id; })
  });

  if (obj.id) {
    statement._id = new ObjectId(obj.id);
  }

  return statement;
};

module.exports = Statement;