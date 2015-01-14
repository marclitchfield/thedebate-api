var calc = require('../../server/lib/objection-effects');

describe('Objection Effects', function() {

  var statement = { id: 1, score: 0 };
  var response = { id: 2, type: 'objection', chain: [statement], score: 0, objection: {} };

  describe('Junk Objections', function() {

    beforeEach(function() { 
      statement.tag = undefined;
      response.objection.type = 'junk';
    });

    it('Tags parent when objection score crosses above threshold', function() {
      response.score = 4;
      expect(calc.effects(response, withDelta(1))).toContain({ id: statement.id, tag: 'junk', active: false });
    });

    it('Removes tag when objection score crosses below threshold', function() {
      response.score = 5;
      statement.tag = 'junk';
      expect(calc.effects(response, withDelta(-1))).toContain({ id: statement.id, tag: undefined, active: true });
    });

  });

  function withDelta(score) {
    return [{ id: response.id, score: score }];
  }

});

