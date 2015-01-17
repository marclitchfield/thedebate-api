var scores = require('../../server/lib/score-calculations');
var _ = require('lodash');

var statements = {};
statements.statement = { id: 0 };
statements.response1 = { id: 1, chain: [statements.statement] };
statements.response2 = { id: 2, chain: [statements.statement, statements.response1] };
statements.response3 = { id: 3, chain: [statements.statement, statements.response1, statements.response2] };

describe('statement score calculations', function() {
  itShouldUpvote(statements, {
    statement: 'statement', 
    given: {}, 
    expect: {
      statement: { score: 1, scores: [1, 0, 0] }
    }
  });

  describe('statement:support', function() {
    itShouldUpvote(statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'support' }
      }, 
      expect: {
        statement: { score: 1, scores: [1, 0, 0] },
        response1: { score: 1, scores: [1, 0, 0] }
      }
    });

    itShouldDeactivate(statements, {
      statement: 'response1', 
      given: {
        statement: { score: 5, scores: [5, 3, 1] },
        response1: { score: 3, scores: [3, 0, 0], type: 'support' }
      }, 
      expect: {
        statement: { score: -3, scores: [-3, 0, 0] }
      }
    });

    // // itShouldReactivate(statements, 'response1', {
    // //   statement: { score: 2, scores: [2, 3, 1] },
    // //   response1: { score: 3, scores: [0, 0, 0], type: 'support' }
    // // }, {
    // //   statement: { score: 3, scores: [3, 0, 0] }
    // // });


    describe('statement:support:support', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'support' }
        }, 
        expect: {
          statement: { score: 1, scores: [1, 0, 0] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:support:opposition', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'opposition' }
        }, 
        expect: {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:support:objection', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'objection' }
        }, 
        expect: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });

  });

  describe('statement:opposition', function() {
    itShouldUpvote(statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'opposition' }
      }, 
      expect: {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score: 1,  scores: [1, 0, 0] }
      }
    });

    describe('statement:opposition:support', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'support' }
        }, 
        expect: {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: 1,  scores: [1, 0, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:opposition:opposition', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'opposition' }
        }, 
        expect: {
          statement: { score: 1,  scores: [1, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:opposition:objection', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'objection' }
        }, 
        expect: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });
  });

  describe('statement:objection', function() {
    itShouldUpvote(statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'objection' }
      }, 
      expect: {
        statement: { score: 0, scores: [0, 0, 1] },
        response1: { score: 1, scores: [1, 0, 0] }
      }
    });

    describe('statement:objection:support', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'support' }
        }, 
        expect: {
          statement: { score: 0, scores: [0, 0, 1] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:objection:opposition', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'opposition' }
        }, 
        expect: {
          statement: { score: 0,  scores: [0, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });

      describe('statement:objection:opposition:support', function() {
        itShouldUpvote(statements, {
          statement: 'response3', 
          given: {
            response1: { type: 'objection' },
            response2: { type: 'opposition' },
            response3: { type: 'support' }
          }, 
          expect: {
            statement: { score: 0, scores: [0, 0, 0] },
          }
        });
      });

    });

    describe('statement:objection:objection', function() {
      itShouldUpvote(statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'objection' }
        }, 
        expect: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });
  });

});


function itShouldUpvote(statementsTemplate, parameters) {
  var statements = givenStatements(statementsTemplate, parameters.given);
  var expectedDeltas = getExpectedDeltas(statements, parameters.expect);
  var actualDeltas = scores.upvote(statements[parameters.statement]);
  describeDeltas('upvote', statements, expectedDeltas, actualDeltas);
}

function itShouldDeactivate(statementsTemplate, parameters) {
  var statements = givenStatements(statementsTemplate, parameters.given);
  var expectedDeltas = getExpectedDeltas(statements, parameters.expect);
  var actualDeltas = scores.deactivate(statements[parameters.statement]);
  describeDeltas('deactivate', statements, expectedDeltas, actualDeltas);
}

function itShouldReactivate(statementsTemplate, parameters) {
  var statements = givenStatements(statementsTemplate, parameters.given);
  var expectedDeltas = getExpectedDeltas(statements, parameters.expect);
  var actualDeltas = scores.deactivate(statements[parameters.statement]);
  describeDeltas('reactivate', statements, expectedDeltas, actualDeltas);
}

function describeDeltas(message, statements, expectedDeltas, actualDeltas) {
  var actualDelta = function(key) {
    var delta = _.find(actualDeltas, function(delta) {
      return delta.id === statements[key].id;
    });
    expect(delta).toBeDefined();
    return _.merge({ score: 0, scores: { support: 0, opposition: 0, objection: 0 } }, delta);
  };

  describe(message, function() {
    Object.keys(expectedDeltas).forEach(function(key) {
      var statement = statements[key];
      var description = key + (statement.type ? '(' + statement.type + ')' : '');

      it('should change ' + description + ' score by ' + expectedDeltas[key].score, function() {
        expect(actualDelta(key).score).toEqual(expectedDeltas[key].score);
      });

      it('should change ' + description + ' support by ' + expectedDeltas[key].scores.support, function() {
        expect(actualDelta(key).scores.support).toEqual(expectedDeltas[key].scores.support);
      });

      it('should change ' + description + ' opposition by ' + expectedDeltas[key].scores.opposition, function() {
        expect(actualDelta(key).scores.opposition).toEqual(expectedDeltas[key].scores.opposition);
      });

      it('should change ' + description + ' objection by ' + expectedDeltas[key].scores.objection, function() {
        expect(actualDelta(key).scores.objection).toEqual(expectedDeltas[key].scores.objection);
      });      
    });
  });
}

function givenStatements(statementsTemplate, givens) {
  var statements = _.cloneDeep(statementsTemplate);
  Object.keys(givens).forEach(function(key) {
    statements[key].type = givens[key].type;
    statements[key].score = givens[key].score || 0;
    if (givens[key].scores) {
      statements[key].scores = expandScores(givens[key].scores)
    }
  });
  return statements;
}

function getExpectedDeltas(baseStatements, expected) {
  var deltas = {};
  Object.keys(expected).forEach(function(key) {
    deltas[key] = { 
      score: expected[key].score, 
      scores: {
        support: expected[key].scores[0],
        opposition: expected[key].scores[1],
        objection: expected[key].scores[2]
      }
    };
  });
  return deltas;
}

function expandScores(scores) {
  return {
    support: scores[0],
    opposition: scores[1],
    objection: scores[2]
  };
}