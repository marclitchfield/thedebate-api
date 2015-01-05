var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var Statement = new Schema({
  body: String,
  type: String,
  score: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  scores: {
    support: { type: Number, default: 0 },
    opposition: { type: Number, default: 0 },
    objection: { type: Number, default: 0 },
  },
  debate: { type: ObjectId, ref: 'Debate' },
  chain: [{ type: ObjectId, ref: 'Statement' }],
  responses: [{ type: ObjectId, ref: 'Statement' }],
  objection: {
    type: { type: String },
    edit: { version: { type: Number } },
    junk: {},
    logic: { fallacy: { type: String } }
  }
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
  obj.debate = obj.debate.id;
  obj.chain = (obj.chain || []).map(function(statement) { return statement.id; });
  obj.responses = (obj.responses || []).map(function(response) { return response.id; });

  var statement = new (mongoose.model('Statement', Statement))(obj);

  if (obj.id) {
    statement._id = new ObjectId(obj.id);
  }

  delete statement.id;
  return statement;
};

module.exports = Statement;