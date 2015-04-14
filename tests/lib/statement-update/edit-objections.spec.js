var statement = require('./statement-helper');
var matchers = require('./matchers');

describe('edit objections:', function() {
  beforeEach(function() {
    this.addMatchers(matchers.custom());
  });
  
  describe('given statement with unsupported edit objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',   body: 'original-body', version: 'original-version', responses: [
          { id: '2', score: 2, type: 'objection', 
            objection: { 
              revisedVersion: 'revised-version', revisedBody: 'revised-body',
              originalVersion: 'original-version', originalBody: 'original-body'
            }
          }
        ]});
    });

    it('when edit objection (2) gains support, the parent statement is revised', function() {
      statement.upvote('2');
      expect(statement.get('1').body).toEqual('revised-body');
      expect(statement.get('1').version).toEqual('revised-version');
    });
  });

  describe('given statement with supported edit objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',   body: 'revised-body', version: 'revised-version', responses: [
          { id: '2', score: 3, type: 'objection', 
            objection: { 
              revisedVersion: 'revised-version', revisedBody: 'revised-body',
              originalVersion: 'original-version', originalBody: 'original-body'
            }
          }
        ]});
    });

    it('when edit objection (2) loses support, the parent statement\'s revision is reverted', function() {
      statement.upvote('2');
      expect(statement.get('1').body).toEqual('original-body');
      expect(statement.get('1').version).toEqual('original-version');
    });
  });
});