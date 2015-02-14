require('jasmine-only');
var scores = require('../../server/lib/score-calculations');
var _ = require('lodash');

var statements = {};
statements.statement = { id: '0' };
statements.response1 = { id: '1', chain: [statements.statement] };
statements.response2 = { id: '2', chain: [statements.statement, statements.response1] };
statements.response3 = { id: '3', chain: [statements.statement, statements.response1, statements.response2] };

describe('upvote score calculations', function() {
  itShould('upvote', statements, {
    statement: 'statement', 
    given: {}, 
    expectDeltas: {
      statement: { score: 1, scores: [1, 0, 0] }
    }
  });

  describe('statement:support', function() {
    itShould('upvote', statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'support' }
      }, 
      expectDeltas: {
        statement: { score: 1, scores: [1, 0, 0] },
        response1: { score: 1, scores: [1, 0, 0] }
      }
    });

    describe('statement:support:support', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: 1, scores: [1, 0, 0] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:support:opposition', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score:  1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:support:objection', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'support' },
          response2: { type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });

  });

  describe('statement:opposition', function() {
    itShould('upvote', statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'opposition' }
      }, 
      expectDeltas: {
        statement: { score: -1, scores: [0, 1, 0] },
        response1: { score:  1, scores: [1, 0, 0] }
      }
    });

    describe('statement:opposition:support', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: -1, scores: [0, 1, 0] },
          response1: { score:  1, scores: [1, 0, 0] },
          response2: { score:  1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:opposition:opposition', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: 1,  scores: [1, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:opposition:objection', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'opposition' },
          response2: { type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });
  });

  describe('statement:objection', function() {
    itShould('upvote', statements, {
      statement: 'response1', 
      given: {
        response1: { type: 'objection' }
      }, 
      expectDeltas: {
        statement: { score: 0, scores: [0, 0, 1] },
        response1: { score: 1, scores: [1, 0, 0] }
      }
    });

    describe('statement:objection:support', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 1] },
          response1: { score: 1, scores: [1, 0, 0] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });

      itShould('upvote', statements, {
        statement: 'response2',
        given: {
          statement: { score:  0, scores: [0, 0, 0] },
          response1: { score: -1, scores: [0, 0, 0], type: 'objection' },
          response2: { score:  0, scores: [0, 0, 0], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [0, 0, 0] },
          response1: { score:  1, scores: [1, 0, 0] },
          response2: { score:  1, scores: [1, 0, 0] }
        }
      });
    });

    describe('statement:objection:opposition', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: 0,  scores: [0, 0, 0] },
          response1: { score: -1, scores: [0, 1, 0] },
          response2: { score: 1,  scores: [1, 0, 0] }
        }
      });

      itShould('upvote', statements, {
        statement: 'response2',
        given: {
          statement: { score:  0, scores: [0,  0,  1] },
          response1: { score:  1, scores: [0,  0,  0], type: 'objection' },
          response2: { score:  0, scores: [0,  0,  0], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [0,  0, -1] },
          response1: { score: -1, scores: [0,  1,  0] },
          response2: { score:  1, scores: [1,  0,  0] }
        }
      });      

      describe('statement:objection:opposition:support', function() {
        itShould('upvote', statements, {
          statement: 'response3', 
          given: {
            response1: { type: 'objection' },
            response2: { type: 'opposition' },
            response3: { type: 'support' }
          }, 
          expectDeltas: {
            statement: { score: 0, scores: [0, 0, 0] },
          }
        });
      });

    });

    describe('statement:objection:objection', function() {
      itShould('upvote', statements, {
        statement: 'response2', 
        given: {
          response1: { type: 'objection' },
          response2: { type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 1] },
          response2: { score: 1, scores: [1, 0, 0] }
        }
      });
    });
  });

});

describe('deactivate score calculations', function() {
  describe('statement:support', function() {
    itShould('deactivate', statements, {
      statement: 'response1', 
      given: {
        statement: { score: 4, scores: [9, 5, 0] },
        response1: { score: 2, scores: [4, 2, 0], type: 'support' }
      }, 
      expectDeltas: {
        statement: { score: -2, scores: [-4, -2, 0] }
      }
    });

    describe('statement:support:support', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score: 4, scores: [9, 5, 0] },
          response1: { score: 2, scores: [4, 2, 0], type: 'support' },
          response2: { score: 2, scores: [3, 1, 0], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: -2, scores: [-3, -1, 0] },
          response1: { score: -2, scores: [-3, -1, 0] }
        }
      });

    });

    describe('statement:support:opposition', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  6, scores: [11, 5, 0] },
          response1: { score:  4, scores: [6,  2, 0], type: 'support' },
          response2: { score: -1, scores: [1,  2, 0], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: -1, scores: [-2, -1, 0] },
          response1: { score: -1, scores: [-2, -1, 0] }
        }
      });
    });

    describe('statement:support:objection', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score: 6, scores: [11, 5, 0] },
          response1: { score: 4, scores: [6,  2, 3], type: 'support' },
          response2: { score: 3, scores: [4,  1, 3], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, -3] }
        }
      });

      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  6, scores: [11, 5, 0] },
          response1: { score:  4, scores: [6,  2, 1], type: 'support' },
          response2: { score: -3, scores: [1,  4, 2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 0] }
        }
      });

    });

  });

  describe('statement:opposition', function() {
    itShould('deactivate', statements, {
      statement: 'response1',
      given: {
        statement: { score:  6, scores: [11, 5, 0] },
        response1: { score: -2, scores: [3, 5, 3], type: 'opposition' }
      }, 
      expectDeltas: {
        statement: { score: -2, scores: [-5, -3, 0] }
      }
    });


    describe('statement:opposition:support', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [6,  5,  0] },
          response1: { score: -2, scores: [3,  5,  0], type: 'opposition' },
          response2: { score:  1, scores: [2,  1,  0], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score:  1, scores: [-1, -2, 0] },
          response1: { score: -1, scores: [-2, -1, 0] }
        }
      });      
    });

    describe('statement:opposition:opposition', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [6,  5,  0] },
          response1: { score: -1, scores: [4,  5,  0], type: 'opposition' },
          response2: { score:  2, scores: [3,  1,  0], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: -2, scores: [-3, -1, 0] },
          response1: { score:  2, scores: [-1, -3, 0] }
        }
      });      
    });

    describe('statement:opposition:objection', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [6,  5,  0] },
          response1: { score: -1, scores: [4,  5,  3], type: 'opposition' },
          response2: { score:  2, scores: [3,  1,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0,  0] },
          response1: { score: 0, scores: [0, 0, -2] }
        }
      });      
    });
  });

  describe('statement:objection', function() {
    itShould('deactivate', statements, {
      statement: 'response1',
      given: {
        statement: { score: 1, scores: [6,  5,  3] },
        response1: { score: 2, scores: [5,  3,  1], type: 'objection' }
      }, 
      expectDeltas: {
        statement: { score: 0, scores: [0,  0, -2] }
      }
    });      

    describe('statement:objection:support', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
          response2: { score:  2, scores: [ 5,  3,  2], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0, -2] },
          response1: { score: -2, scores: [-5, -3,  0] }
        }
      });      
    });

    describe('statement:objection:opposition', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
          response2: { score:  2, scores: [ 3,  1,  2], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  2] },
          response1: { score:  2, scores: [-1, -3,  0] }
        }
      });      

      describe('statement:objection:opposition:support', function() {
        itShould('deactivate', statements, {
          statement: 'response3',
          given: {
            statement: { score:  1, scores: [ 6,  5,  4] },
            response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
            response2: { score:  2, scores: [ 3,  1,  2], type: 'opposition' },
            response3: { score:  1, scores: [ 1,  0,  1], type: 'support' }
          }, 
          expectDeltas: {
            statement: { score:  0, scores: [ 0,  0,  1] },
            response1: { score:  1, scores: [ 0, -1,  0] },
            response2: { score: -1, scores: [-1,  0,  0] }
          }
        });      
      });
    });

    describe('statement:objection:objection', function() {
      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
          response2: { score:  2, scores: [ 3,  1,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  0] },
          response1: { score:  0, scores: [ 0,  0, -2] }
        }
      }); 

      itShould('deactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
          response2: { score: -2, scores: [ 1,  3,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  0] },
          response1: { score:  0, scores: [ 0,  0,  0] }
        }
      }); 
    });
  });

});

describe('reactivate score calculations', function() {
  describe('statement:support', function() {
    itShould('reactivate', statements, {
      statement: 'response1', 
      given: {
        statement: { score: 2, scores: [5, 3, 0] },
        response1: { score: 2, scores: [4, 2, 0], type: 'support' }
      }, 
      expectDeltas: {
        statement: { score: 2, scores: [4, 2, 0] }
      }
    });

    describe('statement:support:support', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score: 2, scores: [6, 4, 0] },
          response1: { score: 0, scores: [1, 1, 0], type: 'support' },
          response2: { score: 2, scores: [3, 1, 0], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: 2, scores: [3, 1, 0] },
          response1: { score: 2, scores: [3, 1, 0] }
        }
      });

    });

    describe('statement:support:opposition', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  5, scores: [9, 4, 0] },
          response1: { score:  3, scores: [4, 1, 0], type: 'support' },
          response2: { score: -1, scores: [1, 2, 0], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score: 1, scores: [2, 1, 0] },
          response1: { score: 1, scores: [2, 1, 0] }
        }
      });
    });

    describe('statement:support:objection', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score: 6, scores: [11, 5, 0] },
          response1: { score: 4, scores: [6,  2, 0], type: 'support' },
          response2: { score: 3, scores: [4,  1, 3], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 3] }
        }
      });

      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  6, scores: [11, 5, 0] },
          response1: { score:  4, scores: [6,  2, 1], type: 'support' },
          response2: { score: -3, scores: [1,  4, 2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score: 0, scores: [0, 0, 0] },
          response1: { score: 0, scores: [0, 0, 0] }
        }
      });

    });

  });

  describe('statement:opposition', function() {
    itShould('reactivate', statements, {
      statement: 'response1',
      given: {
        statement: { score:  4, scores: [6, 2, 0] },
        response1: { score: -2, scores: [3, 5, 3], type: 'opposition' }
      }, 
      expectDeltas: {
        statement: { score:  2, scores: [5, 3, 0] }
      }
    });


    describe('statement:opposition:support', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  2, scores: [5,  3,  0] },
          response1: { score: -3, scores: [1,  4,  0], type: 'opposition' },
          response2: { score:  1, scores: [2,  1,  0], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score: -1, scores: [1,  2,  0] },
          response1: { score:  1, scores: [2,  1,  0] }
        }
      });      
    });

    describe('statement:opposition:opposition', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score: -1, scores: [3,  4,  0] },
          response1: { score:  1, scores: [3,  2,  0], type: 'opposition' },
          response2: { score:  2, scores: [3,  1,  0], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score:  2, scores: [3,  1,  0] },
          response1: { score: -2, scores: [1,  3,  0] }
        }
      });      
    });

    describe('statement:opposition:objection', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [6,  5,  0] },
          response1: { score: -1, scores: [4,  5,  1], type: 'opposition' },
          response2: { score:  2, scores: [3,  1,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [0,  0,  0] },
          response1: { score:  0, scores: [0,  0,  2] }
        }
      });      
    });
  });

  describe('statement:objection', function() {
    itShould('reactivate', statements, {
      statement: 'response1',
      given: {
        statement: { score: 1, scores: [6,  5,  1] },
        response1: { score: 2, scores: [5,  3,  1], type: 'objection' }
      }, 
      expectDeltas: {
        statement: { score: 0, scores: [0,  0,  2] }
      }
    });      

    describe('statement:objection:support', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  2] },
          response1: { score:  1, scores: [ 1,  0,  3], type: 'objection' },
          response2: { score:  2, scores: [ 5,  3,  2], type: 'support' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  2] },
          response1: { score:  2, scores: [ 5,  3,  0] }
        }
      });      
    });

    describe('statement:objection:opposition', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  6] },
          response1: { score:  5, scores: [ 5,  0,  3], type: 'objection' },
          response2: { score:  2, scores: [ 3,  1,  2], type: 'opposition' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0, -2] },
          response1: { score: -2, scores: [ 1,  3,  0] }
        }
      });      

      describe('statement:objection:opposition:support', function() {
        itShould('reactivate', statements, {
          statement: 'response3',
          given: {
            statement: { score:  1, scores: [ 6,  5,  5] },
            response1: { score:  4, scores: [ 6,  2,  3], type: 'objection' },
            response2: { score:  1, scores: [ 2,  1,  2], type: 'opposition' },
            response3: { score:  1, scores: [ 1,  0,  1], type: 'support' }
          }, 
          expectDeltas: {
            statement: { score:  0, scores: [ 0,  0, -1] },
            response1: { score: -1, scores: [ 0,  1,  0] },
            response2: { score:  1, scores: [ 1,  0,  0] }
          }
        });      
      });
    });

    describe('statement:objection:objection', function() {
      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  1], type: 'objection' },
          response2: { score:  2, scores: [ 3,  1,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  0] },
          response1: { score:  0, scores: [ 0,  0,  2] }
        }
      }); 

      itShould('reactivate', statements, {
        statement: 'response2',
        given: {
          statement: { score:  1, scores: [ 6,  5,  4] },
          response1: { score:  3, scores: [ 6,  3,  3], type: 'objection' },
          response2: { score: -2, scores: [ 1,  3,  2], type: 'objection' }
        }, 
        expectDeltas: {
          statement: { score:  0, scores: [ 0,  0,  0] },
          response1: { score:  0, scores: [ 0,  0,  0] }
        }
      }); 
    });
  });

});

function itShould(action, statementsTemplate, parameters) {
  var statements = givenStatements(statementsTemplate, parameters.given);
  var expectedDeltas = getExpectedDeltas(statements, parameters.expectDeltas);
  var actualDeltas = scores[action](statements[parameters.statement]);
  describeDeltas(action, statements, expectedDeltas, actualDeltas);
}

function describeDeltas(action, statements, expectedDeltas, actualDeltas) {
  var actualDelta = function(key) {
    var delta = _.find(actualDeltas, function(delta) {
      return delta.id === statements[key].id;
    });
    expect(delta).toBeDefined();
    return _.merge({ score: 0, scores: { support: 0, opposition: 0, objection: 0 } }, delta);
  };

  describe(action, function() {
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
      statements[key].scores = expandScores(givens[key].scores);
    }
  });
  return statements;
}

function getExpectedDeltas(baseStatements, expected) {
  var deltas = {};
  Object.keys(expected).forEach(function(key) {
    deltas[key] = { 
      score: expected[key].score, 
      scores: expandScores(expected[key].scores)
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
