var createStatement = require('../../../server/lib/statement');
var statementUpdate = require('../../../server/lib/statement-update');
var givenStatement;

module.exports = {
  given: function(statement) {
    givenStatement = createStatement(statement);
  },
  
  get: function(id) {
    return statementUpdate.findStatement(givenStatement, id);    
  },
  
  upvote: function(id) {
    var deltas = statementUpdate.calculate('upvote', this.get(id));
    statementUpdate.applyDeltas(givenStatement, deltas);
  },
   
  applyDelta: function(delta) {
    statementUpdate.applyDeltas(givenStatement, [delta]);
  }
};
