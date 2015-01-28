var calc = require('../../server/lib/objection-effects');
var _ = require('lodash');

describe('Objection Effects', function() {

  var statement = { id: '1', score: 0 };
  var response = { id: '2', type: 'objection', chain: [statement], score: 0, objection: {} };

  describe('Junk Objections', function() {

    beforeEach(function() { 
      statement.tag = undefined;
      response.objection.type = 'junk';
    });

    it('Tags parent when objection score crosses above threshold', function() {
      response.score = 4;
      var effect = _.find(calc.effects(response, withDelta(1)), function(e) { return e.id === statement.id; });
      expect(effect.tag).toEqual('junk');
      expect(effect.active).toEqual(false);
    });

    it('Removes tag when objection score crosses below threshold', function() {
      response.score = 5;
      statement.tag = 'junk';
      var effect = _.find(calc.effects(response, withDelta(-1)), function(e) { return e.id === statement.id; });
      expect(effect.tag).toBeNull();
      expect(effect.active).toEqual(true);
    });

  });

  describe('Unknown objection type', function() {
    it('has no effect', function() {
      response.objection.type = 'undefined';
      expect(calc.effects(response, withDelta(1))).toEqual([]);
    })
  });

  function withDelta(score) {
    return [{ id: response.id, score: score }];
  }

});

