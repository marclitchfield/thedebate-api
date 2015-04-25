var statement = require('./statement-helper');
var matchers = require('./matchers');

describe('apply deltas', function() {
  beforeEach(function() {
    this.addMatchers(matchers.custom());
  });
  
  describe('given statement', function() {
    beforeEach(function() {
      statement.given(
        { id: '1', body: 'statement', revisions: [{ id: '3', body: 'revision A'}], responses: [
          { id: '2', score: 2, type: 'opposition', scores: { support: 1, opposition: 1, objection: 1 } }
        ]});
    });
    
    it('will apply delta to the score', function() {
      statement.applyDelta({ id: '2', score: 1, scores: { support: 2, opposition: -2, objection: 3 }});
      expect(statement.get('2').score).toEqual(3);
      expect(statement.get('2').scores).toEqual({ support: 3, opposition: -1, objection: 4 });
    });
    
    it('will apply push delta to revision', function() {
      statement.applyDelta({ id: '1', revisions: { $push: { id: '4', body: 'revision B' } } });
      expect(statement.get('1').revisions).toEqual([ { id: '3', body: 'revision A' }, { id: '4', body: 'revision B' } ]);
    });
    
    it('will apply pop delta to revision', function() {
      statement.applyDelta({ id: '1', revisions: { $pop: {} } });
      expect(statement.get('1').revisions).toEqual([]);
    });

  }); 
});