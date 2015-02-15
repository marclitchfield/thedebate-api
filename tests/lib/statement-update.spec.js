var statementUpdate = require('../../server/lib/statement-update');
var givenStatement;

describe('statement update scenarios:', function() {
  describe('given statement with unsupported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',     score: 10, responses: [
          { id: '2',   score: 8, type: 'support', responses: [
            { id: '3', score: 4, type: 'objection', objection: { type: 'junk' } }
          ]}
        ]};
    });

    it('when junk objection (3) gains support, the parent statement (2) is deactivated', function() {
      whenUpvoted(statement('3'));
      expect(statement('3').score).toEqual(5);
      expect(statement('2').tag).toEqual('junk');
      expect(statement('1').score).toEqual(2);
    });
  });

  describe('given statement with supported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', tag: 'junk', inactive: true, responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 0, type: 'opposition' }
            ]}
          ]}
        ]};
    });

    it('when inactive statement (2) is upvoted, the parent statement (1) does not change', function() {
      whenUpvoted(statement('2'));
      expect(statement('2').score).toEqual(9);
      expect(statement('1').score).toEqual(2);
    });

    it('when junk objection (3) loses support, the parent statement (2) is reactivated', function() {
      whenUpvoted(statement('4'));
      expect(statement('4').score).toEqual(1);
      expect(statement('3').score).toEqual(4);
      expect(statement('2').tag).toBeNull();
      expect(statement('1').score).toEqual(10);
    });
  });

  describe('given an unsupported junk objection to a supported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', tag: 'junk', inactive: true, responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 4, type: 'objection', objection: { type: 'junk'} }
            ]}
          ]}
        ]};
    });

    it('when junk objection (4) gains support, the parent junk objection (3) is deactivated', function() {
      whenUpvoted(statement('4'));
      expect(statement('4').score).toEqual(5);
      expect(statement('3').tag).toEqual('junk');
      expect(statement('2').tag).toBeNull();
      expect(statement('1').score).toEqual(10);
    });
  });

  describe('given a supported junk objection to a supported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 5, type: 'objection', tag: 'junk', inactive: true, objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 0, type: 'opposition' }
              ]}
            ]}
          ]}
        ]};
    });

    it('when junk objection (4) loses support, the parent junk objection (3) is reactivated', function() {
      whenUpvoted(statement('5'));
      expect(statement('4').score).toEqual(4);
      expect(statement('3').tag).toBeNull();
      expect(statement('2').tag).toEqual('junk');
      expect(statement('1').score).toEqual(2);
    });
  });
  
  describe('given a supported junk objection to an unsupported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 4, type: 'objection', tag: 'junk', inactive: true, objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 0, type: 'opposition' }
              ]}
            ]}
          ]}
        ]};
    });

    it('when junk objection (4) loses support, the parent junk objection (3) is untagged, but is not reactivated (it was never activated in the first place)', function() {
      whenUpvoted(statement('5'));
      expect(statement('4').score).toEqual(4);
      expect(statement('3').tag).toBeNull();
      expect(statement('2').tag).toBeUndefined();
      expect(statement('1').score).toEqual(10);
    });
    
    it('when junk objection (3) gains support, the parent statement is not deactivated because the junk objection (3) is already tagged as junk', function() {
      whenUpvoted(statement('3'));
      expect(statement('3').score).toEqual(5);
      expect(statement('2').tag).toBeUndefined();
      expect(statement('1').score).toEqual(10);
    });
  });
  
  describe('given unsupported junk objection to supported junk objection to supported junk objection', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 5, type: 'objection', inactive: true, tag: 'junk', objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 4, type: 'objection', objection: { type: 'junk' } }
              ]}
            ]}
          ]}
        ]};
    });

    it('when junk objection (5) gains support, the parent junk objection (4) is junk, and its parent junk objection (3) is not junk, so the statement (2) is deactivated', function() {
      whenUpvoted(statement('5'));
      expect(statement('5').score).toEqual(5);
      expect(statement('4').tag).toEqual('junk');
      expect(statement('3').tag).toBeNull();
      expect(statement('2').tag).toEqual('junk');
      expect(statement('1').score).toEqual(2);
    });
  });

  xdescribe('given statement with two unsupported junk objections', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',       score: 10, responses: [
          { id: '2',     score: 8, type: 'support', responses: [
            { id: '3',   score: 4, type: 'objection', objection: { type: 'junk' }},
            { id: '4',   score: 4, type: 'objection', objection: { type: 'junk' }}
          ]}
        ]};
    });

    it('when one junk objection (3) gains support, the other junk objection (4) is deactivated', function() {
      whenUpvoted(statement('3'));
      expect(statement('4').tag).toEqual('obsolete');
      expect(statement('3').score).toEqual(5);
      expect(statement('2').tag).toEqual('junk');
      expect(statement('1').score).toEqual(2);
    });
  });

  xdescribe('given statement with supported and unsupported junk objections', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', inactive: true, tag: 'junk', responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 0, type: 'opposition' }
            ]},
            { id: '5',   score: 4, type: 'objection', objection: { type: 'junk' }, tag: 'obsolete'}
          ]}
        ]};
    });

    it('when the supported junk objection (3) loses support, the other obsolete objection (5) is reactivated', function() {
      whenUpvoted(statement('4'));
      expect(statement('5').tag).toBeNull();
      expect(statement('4').score).toEqual(1);
      expect(statement('3').score).toEqual(4);
      expect(statement('2').tag).toBeNull();
      expect(statement('1').score).toEqual(2);
    });
  });

});

function statement(id) {
  givenStatement.chain = givenStatement.chain || [];
  return findStatement(givenStatement, id);
}

function whenUpvoted(statement) {
  var deltas = statementUpdate.calculate('upvote', statement);
  applyDeltas(givenStatement, deltas);
}

function applyDeltas(statement, deltas) {
  deltas.forEach(function(delta) {
    var target = findStatement(statement, delta.id);
    target.score = (target.score || 0) + (delta.score || 0);
    target.scores.support = (target.scores.support || 0) + (delta.scores.support || 0);
    target.scores.opposition = (target.scores.opposition || 0) + (delta.scores.opposition || 0);
    target.scores.objection = (target.scores.objection || 0) + (delta.scores.objection || 0);
    if (delta.tag !== undefined) {
      target.tag = delta.tag;
    }
  });
}

function findStatement(node, id) {
  if (node.id === id) {
    return populateStatement(node);
  }
  if (node.responses) {
    for(var i=0; i<node.responses.length; i++) {
      var response = populateStatement(node.responses[i]);
      response.chain = node.chain.concat(node);
      var found = findStatement(response, id);
      if (found !== undefined) {
        return populateStatement(found);
      }
    }
  }
}

function populateStatement(statement) {
  statement.score = statement.score || 0;
  statement.scores = statement.scores || {};
  statement.scores.support = statement.scores.support || 0;
  statement.scores.opposition = statement.scores.opposition || 0;
  statement.scores.objection = statement.scores.objection || 0;
  return statement;
}