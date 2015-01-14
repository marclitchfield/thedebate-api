var scores = require('../../server/lib/score-calculations');
var _ = require('lodash');

var statements = {};
statements.statement = { id: 0 };
statements.response1 = { id: 1, chain: [statements.statement] };
statements.response2 = { id: 2, chain: [statements.statement, statements.response1] };
statements.response3 = { id: 3, chain: [statements.statement, statements.response1, statements.response2] };

describe('statement score calculations', function() {
  // itShouldUpvote(statements, 'statement', {}, {
  //   statement: { score: 1, scores: [1, 0, 0] }
  // });


  describe('statement:support', function() {
    itShouldUpvote(statements, 'response1', {
      response1: { type: 'support' }
    }, {
      statement: { score: 1, scores: [1, 0, 0] },
      response1: { score: 1, scores: [1, 0, 0] }
    });

    // itShouldDeactivate(statements, 'response1', {
    //   statement: { score: 5, scores: [5, 3, 1] },
    //   response1: { score: 3, scores: [3, 0, 0], type: 'support' }
    // }, {
    //   statement: { score: -3, scores: [-3, 0, 0] }
    // });

    // // itShouldReactivate(statements, 'response1', {
    // //   statement: { score: 2, scores: [2, 3, 1] },
    // //   response1: { score: 3, scores: [0, 0, 0], type: 'support' }
    // // }, {
    // //   statement: { score: 3, scores: [3, 0, 0] }
    // // });


    describe('statement:support:support', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'support' },
        response2: { type: 'support' }
      }, {
        statement: { score: 1, scores: [1, 0, 0] },
        response1: { score: 1, scores: [1, 0, 0] },
        response2: { score: 1, scores: [1, 0, 0] }
      });
    });

    describe('statement:support:opposition', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'support' },
        response2: { type: 'opposition' }
      }, {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score: -1, scores: [0, 1, 0] },
        response2: { score: 1,  scores: [1, 0, 0] }
      });
    });

    describe('statement:support:objection', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'support' },
        response2: { type: 'objection' }
      }, {
        statement: { score: 0, scores: [0, 0, 0] },
        response1: { score: 0, scores: [0, 0, 1] },
        response2: { score: 1, scores: [1, 0, 0] }
      });
    });

  });

  describe('statement:opposition', function() {
    itShouldUpvote(statements, 'response1', {
      response1: { type: 'opposition' }
    }, {
      statement: { score: -1, scores: [0, 1, 0] },
      response1: { score: 1,  scores: [1, 0, 0] }
    });

    describe('statement:opposition:support', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'opposition' },
        response2: { type: 'support' }
      }, {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score: 1,  scores: [1, 0, 0] },
        response2: { score: 1,  scores: [1, 0, 0] }
      });
    });

    describe('statement:opposition:opposition', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'opposition' },
        response2: { type: 'opposition' }
      }, {
        statement: { score: 1,  scores: [1, 0, 0] },
        response1: { score: -1, scores: [0, 1, 0] },
        response2: { score: 1,  scores: [1, 0, 0] }
      });
    });

    describe('statement:opposition:objection', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'opposition' },
        response2: { type: 'objection' }
      }, {
        statement: { score: 0, scores: [0, 0, 0] },
        response1: { score: 0, scores: [0, 0, 1] },
        response2: { score: 1, scores: [1, 0, 0] }
      });
    });
  });

  describe('statement:objection', function() {
    itShouldUpvote(statements, 'response1', {
      response1: { type: 'objection' }
    }, {
      statement: { score: 0, scores: [0, 0, 1] },
      response1: { score: 1, scores: [1, 0, 0] }
    });

    describe('statement:objection:support', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'objection' },
        response2: { type: 'support' }
      }, {
        statement: { score: 0, scores: [0, 0, 1] },
        response1: { score: 1, scores: [1, 0, 0] },
        response2: { score: 1, scores: [1, 0, 0] }
      });
    });

    describe('statement:objection:opposition', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'objection' },
        response2: { type: 'opposition' }
      }, {
        statement: { score: 0,  scores: [0, 0, 0] },
        response1: { score: -1, scores: [0, 1, 0] },
        response2: { score: 1,  scores: [1, 0, 0] }
      });

      describe('statement:objection:opposition:support', function() {
        itShouldUpvote(statements, 'response3', {
          response1: { type: 'objection' },
          response2: { type: 'opposition' },
          response3: { type: 'support' }
        }, {
          statement: { score: 0, scores: [0, 0, 0] },

        })
      });
    });

    describe('statement:objection:objection', function() {
      itShouldUpvote(statements, 'response2', {
        response1: { type: 'objection' },
        response2: { type: 'objection' }
      }, {
        statement: { score: 0, scores: [0, 0, 0] },
        response1: { score: 0, scores: [0, 0, 1] },
        response2: { score: 1, scores: [1, 0, 0] }
      });
    });
  });

});


function itShouldUpvote(statementsTemplate, upvoteStatementKey, initialState, expected) {
  var statements = initializeStatements(statementsTemplate, initialState);
  var expectedDeltas = getExpectedDeltas(statements, expected);
  var actualDeltas = scores.upvote(statements[upvoteStatementKey]);
  describeDeltas('upvote', statements, expectedDeltas, actualDeltas);
}

function itShouldDeactivate(statementsTemplate, deactivateStatementKey, initialState, expected) {
  var statements = initializeStatements(statementsTemplate, initialState);
  var expectedDeltas = getExpectedDeltas(statements, expected);
  var actualDeltas = scores.deactivate(statements[deactivateStatementKey]);
  describeDeltas('deactivate', statements, expectedDeltas, actualDeltas);
}

function itShouldReactivate(statementsTemplate, reactivateStatementKey, initialState, expected) {
  var statements = initializeStatements(statementsTemplate, initialState);
  var expectedDeltas = getExpectedDeltas(statements, expected);
  var actualDeltas = scores.deactivate(statements[reactivateStatementKey]);
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

function initializeStatements(statementsTemplate, state) {
  var statements = _.cloneDeep(statementsTemplate);
  Object.keys(statements).forEach(function(key) {
    var statement = statements[key];
    statements[key].score = 0;
    statements[key].scores = { support: 0, opposition: 0, objection: 0 };
  });
  return _.merge(statements, state);
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
