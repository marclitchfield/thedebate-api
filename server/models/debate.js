var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Statement = require('./statement');

var Debate = new Schema({
  title: String,
  score: Number,
  statements: [{ type: ObjectId, ref:'Statement'}]
});

Debate.methods.toJSON = function() {
  var obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;

  obj.statements = this.statements.map(function(statement) {
    return statement.toJSON();
  });

  return obj;
};

Debate.statics.fromJSON = function(obj) {
  var debate = new (mongoose.model('Debate', Debate))({
    title: obj.title,
    score: obj.score,
    statements: (obj.statements || []).map(function(statement) {
      return Statement.fromJSON(statement);
    })
  });

  if (obj.id) {
    debate._id = new ObjectId(obj.id);
  }

  return debate;
};

module.exports = Debate;