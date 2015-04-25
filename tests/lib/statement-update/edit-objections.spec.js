var statement = require('./statement-helper');
var matchers = require('./matchers');

xdescribe('edit objections:', function() {
  beforeEach(function() {
    this.addMatchers(matchers.custom());
  });
  
  describe('given statement with unsupported edit objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1', body: 'original-body', revisions: [], responses: [
          { id: '2', score: 2, type: 'objection', objection: { type: 'edit', editedBody: 'edited-body' } }
        ]});
    });

    it('when edit objection (2) gains support, the parent statement is revised', function() {
      statement.upvote('2');
      // the body is not changed. a revision is appended.
      expect(statement.get('1').body).toEqual('original-body'); 
      expect(statement.get('1').revisions).toEqual([{id: '1', body: 'edited-body'}]);
    });
  });

  describe('given statement with supported edit objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1', body: 'original-body', revisions:[{id: '2', body: 'edited-body'}], responses: [
          { id: '2', score: 2, type: 'objection', objection: { type: 'edit', editedBody: 'edited-body' } }
        ]});
    });

    it('when edit objection (2) loses support, the parent statement\'s revision is reverted', function() {
      statement.upvote('2');
      expect(statement.get('1').body).toEqual('original-body');
      expect(statement.get('1').revisions).toEqual([]);
    });
  });
});