var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Statement = require('./statement');

var Debate = new Schema({
  title: String,
  score: { type: Number, default: 0 },
  statements: [{ type: ObjectId, ref:'Statement'}]
});

Debate.methods.summary = function() {
  this.statements = undefined;
  return this;
};

Debate.methods.toJSON = function() {
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;

  if (this.statements !== undefined) {
    obj.statements = this.statements.map(function(statement) {
      return statement.toJSON();
    });
  }

  return obj;
};

Debate.statics.summarize = function(debates) {
  return debates.map(function(debate) { 
    return debate.summary(); 
  });
};

Debate.statics.fromJSON = function(obj) {
  var debate = new (mongoose.model('Debate', Debate))(obj);
  debate.statements = (obj.statements || []).map(function(statement) {
    return Statement.fromJSON(statement);
  });

  if (obj.id) {
    debate._id = new ObjectId(obj.id);
  }

  delete debate.id;
  return debate;
};

module.exports = Debate;