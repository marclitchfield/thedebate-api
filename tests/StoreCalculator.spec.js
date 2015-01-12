var scores = require('../server/lib/ScoreCalculator');
var _ = require('lodash');

describe('Upvoting', function() {

  var statements = {};
  statements.statement = {};
  statements.response1 = { chain: [statements.statement] };
  statements.response2 = { chain: [statements.statement, statements.response1] };

  describe('statement', function() {
    itShouldVote(statements, {
      statement: { upvote: true }
    }, {
      statement: { score: 1, scores: [1, 0, 0] }
    });

    describe('supporting response', function() {
      itShouldVote(statements, {
        response1: { type: 'support', upvote: true }
      }, {
        statement: { score: 1, scores: [1, 0, 0] },
        response1: { score: 1, scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldVote(statements, {
          response1: { type: 'support' },
          response2: { type: 'support', upvote: true }
        }, {
          statement: { score: 1, scores: [1, 0, 0] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldVote(statements, {
          response1: { type: 'support' },
          response2: { type: 'opposition', upvote: true }
        }, {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
        itShouldVote(statements, {
          response1: { type: 'support' },
          response2: { type: 'objection', upvote: true }
        }, {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });

    });

    describe('opposing response', function() {
      itShouldVote(statements, {
        response1: { type: 'opposition', upvote: true }
      }, {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score: 1,  scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldVote(statements, {
          response1: { type: 'opposition' },
          response2: { type: 'support', upvote: true }
        }, {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: 1,  scores: [1, 0, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldVote(statements, {
          response1: { type: 'opposition' },
          response2: { type: 'opposition', upvote: true }
        }, {
          statement: { score: 1,  scores: [1, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
        itShouldVote(statements, {
          response1: { type: 'opposition' },
          response2: { type: 'objection', upvote: true }
        }, {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });
    });

    describe('with objecting response', function() {
      itShouldVote(statements, {
        response1: { type: 'objection', upvote: true }
      }, {
        statement: { score: 0, scores: [0, 0, 1] },
        response1: { score: 1, scores: [1, 0, 0] }
      });

      describe('support', function() {
        itShouldVote(statements, {
          response1: { type: 'objection' },
          response2: { type: 'support', upvote: true }
        }, {
          statement: { score: 0, scores: [0, 0, 1] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });

      describe('opposition', function() {
        itShouldVote(statements, {
          response1: { type: 'objection' },
          response2: { type: 'opposition', upvote: true }
        }, {
          statement: { score: 0,  scores: [0, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        });
      });

      describe('objection', function() {
        itShouldVote(statements, {
          response1: { type: 'objection' },
          response2: { type: 'objection', upvote: true }
        }, {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        });
      });
    });

  });

});


function itShouldVote(statementsTemplate, state, expected) {
  var statements = _.cloneDeep(statementsTemplate);

  Object.keys(statements).forEach(function(key) {
    var statement = statements[key];
    statements[key].score = 0;
    statements[key].scores = { support: 0, opposition: 0, objection: 0 };
    if (state[key]) {
      statement.type = state[key].type;
    }
  });

  vote(statements, state);

  Object.keys(expected).forEach(function(key) {
    var statement = statements[key];
    var description = key + (statement.type ? '(' + statement.type + ')' : '');

    it('should set ' + description + ' score to ' + expected[key].score, function() {
      expect(statement.score).toEqual(expected[key].score);
    });

    it('should set ' + description + ' support to ' + expected[key].scores[0], function() {
      expect(statement.scores.support).toEqual(expected[key].scores[0]);
    });

    it('should set ' + description + ' opposition to ' + expected[key].scores[1], function() {
      expect(statement.scores.opposition).toEqual(expected[key].scores[1]);
    });

    it('should set ' + description + ' objection to ' + expected[key].scores[2], function() {
      expect(statement.scores.objection).toEqual(expected[key].scores[2]);
    });

  });
}

function vote(statements, state) {
  Object.keys(state).forEach(function(key) {
    var statement = statements[key];
    if (state[key].upvote) {
      scores.upvote(statement);
    }
    if (state[key].downvote) {
      scores.downvote(statement);
    }
  });
}