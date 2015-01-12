var scores = require('../server/lib/ScoreCalculator');
var _ = require('lodash');

describe('Upvoting', function() {

  var statements = {};
  statements.statement = { id: 1 };
  statements.response1 = { id: 2, chain: [statements.statement] };
  statements.response2 = { id: 3, chain: [statements.statement, statements.response1] };

  describe('statement', function() {
    itShouldUpvote(statements, 'statement', {}, {
      statement: { score: 1, scores: [1, 0, 0] }
    });

    describe('supporting response', function() {
      itShouldUpvote(statements, 'response1', {
        response1: { type: 'support' }
      }, {
        statement: { score: 1, scores: [1, 0, 0] },
        response1: { score: 1, scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'support' },
          response2: { type: 'support' }
        }, {
          statement: { score: 1, scores: [1, 0, 0] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'support' },
          response2: { type: 'opposition' }
        }, {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
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

    describe('opposing response', function() {
      itShouldUpvote(statements, 'response1', {
        response1: { type: 'opposition' }
      }, {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score: 1,  scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'opposition' },
          response2: { type: 'support' }
        }, {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: 1,  scores: [1, 0, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'opposition' },
          response2: { type: 'opposition' }
        }, {
          statement: { score: 1,  scores: [1, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
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

    describe('objecting response', function() {
      itShouldUpvote(statements, 'response1', {
        response1: { type: 'objection' }
      }, {
        statement: { score: 0, scores: [0, 0, 1] },
        response1: { score: 1, scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'objection' },
          response2: { type: 'support' }
        }, {
          statement: { score: 0, scores: [0, 0, 1] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldUpvote(statements, 'response2', {
          response1: { type: 'objection' },
          response2: { type: 'opposition' }
        }, {
          statement: { score: 0,  scores: [0, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
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

});


function itShouldUpvote(statementsTemplate, upvoteStatementKey, state, expected) {
  var statements = _.cloneDeep(statementsTemplate);

  Object.keys(statements).forEach(function(key) {
    var statement = statements[key];
    statements[key].score = 0;
    statements[key].scores = { support: 0, opposition: 0, objection: 0 };
    if (state[key]) {
      statement.type = state[key].type;
    }
  });

  var expectedDeltas = getExpectedDeltas(statements, expected);
  var actualDeltas = scores.upvote(statements[upvoteStatementKey]);

  var actualDelta = function(key) {
    var delta = _.find(actualDeltas, function(delta) {
      return delta.id === statements[key].id;
    });
    return _.merge({ score: 0, scores: { support: 0, opposition: 0, objection: 0 } }, delta);
  };

  Object.keys(expected).forEach(function(key) {
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
}

function getExpectedDeltas(baseStatements, expected) {
  var deltas = {};
  Object.keys(expected).forEach(function(key) {
    expected[key] = _.assign({ score: 0, scores: [0, 0, 0] }, expected[key]);

    deltas[key] = {
      score: expected[key].score - baseStatements[key].score,
      scores: { 
        support: expected[key].scores[0] - baseStatements[key].scores.support,
        opposition: expected[key].scores[1] - baseStatements[key].scores.opposition,
        objection: expected[key].scores[2] - baseStatements[key].scores.objection
      }
    };
  });

  return deltas;
}

