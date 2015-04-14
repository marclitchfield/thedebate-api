var statementUpdate = require('../../../server/lib/statement-update');
var givenStatement;

module.exports = {
  given: function(statement) {
    givenStatement = statement;
  },
  
  get: function(id) {
    givenStatement.chain = givenStatement.chain || [];
    return findStatement(givenStatement, id);    
  },
  
  upvote: function(id) {
    var deltas = statementUpdate.calculate('upvote', this.get(id));
    applyDeltas(givenStatement, deltas);
  }
};

function applyDeltas(statement, deltas) {
  deltas.forEach(function(delta) {
    var target = findStatement(statement, delta.id);
    target.score = (target.score || 0) + (delta.score || 0);
    target.scores.support = (target.scores.support || 0) + (delta.scores.support || 0);
    target.scores.opposition = (target.scores.opposition || 0) + (delta.scores.opposition || 0);
    target.scores.objection = (target.scores.objection || 0) + (delta.scores.objection || 0);
    if (delta.tag !== undefined) {
      target.tag = delta.tag;
    }
  });
}

function findStatement(node, id) {
  if (node.id === id) {
    return populateStatement(node);
  }
  if (node.responses) {
    for(var i=0; i<node.responses.length; i++) {
      var response = populateStatement(node.responses[i]);
      response.chain = node.chain.concat(node);
      var found = findStatement(response, id);
      if (found !== undefined) {
        return populateStatement(found);
      }
    }
  }
}

function populateStatement(statement) {
  statement.score = statement.score || 0;
  statement.scores = statement.scores || {};
  statement.scores.support = statement.scores.support || 0;
  statement.scores.opposition = statement.scores.opposition || 0;
  statement.scores.objection = statement.scores.objection || 0;
  return statement;
}
