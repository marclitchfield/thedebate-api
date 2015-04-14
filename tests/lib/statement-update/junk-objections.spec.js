var statement = require('./statement-helper');
var matchers = require('./matchers');

describe('junk objections:', function() {
  beforeEach(function() {
    this.addMatchers(matchers.custom());
  });
  
  describe('given statement with unsupported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',     score: 10, responses: [
          { id: '2',   score: 8, type: 'support', responses: [
            { id: '3', score: 4, type: 'objection', objection: { type: 'junk' } }
          ]}
        ]});
    });

    it('when junk objection (3) gains support, the parent statement (2) is deactivated', function() {
      statement.upvote('3');
      expect(statement.get('3').score).toEqual(5);
      expect(statement.get('2')).toBeInactiveWithTag('junk');
      expect(statement.get('1').score).toEqual(2);
    });
  });

  describe('given statement with supported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', tag: 'junk', inactive: true, responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 0, type: 'opposition' }
            ]}
          ]}
        ]});
    });

    it('when inactive statement (2) is upvoted, the parent statement (1) does not change', function() {
      statement.upvote('2');
      expect(statement.get('2').score).toEqual(9);
      expect(statement.get('1').score).toEqual(2);
    });

    it('when junk objection (3) loses support, the parent statement (2) is reactivated', function() {
      statement.upvote('4');
      expect(statement.get('4').score).toEqual(1);
      expect(statement.get('3').score).toEqual(4);
      expect(statement.get('2')).toBeActiveWithNoTag();
      expect(statement.get('1').score).toEqual(10);
    });
  });

  describe('given an unsupported junk objection to a supported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', tag: 'junk', inactive: true, responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 4, type: 'objection', objection: { type: 'junk'} }
            ]}
          ]}
        ]});
    });

    it('when junk objection (4) gains support, the parent junk objection (3) is deactivated', function() {
      statement.upvote('4');
      expect(statement.get('4').score).toEqual(5);
      expect(statement.get('3')).toBeInactiveWithTag('junk');
      expect(statement.get('2')).toBeActiveWithNoTag();
      expect(statement.get('1').score).toEqual(10);
    });
  });

  describe('given a supported junk objection to a supported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 5, type: 'objection', tag: 'junk', inactive: true, objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 0, type: 'opposition' }
              ]}
            ]}
          ]}
        ]});
    });

    it('when junk objection (4) loses support, the parent junk objection (3) is reactivated', function() {
      statement.upvote('5');
      expect(statement.get('4').score).toEqual(4);
      expect(statement.get('3')).toBeActiveWithNoTag();
      expect(statement.get('2')).toBeInactiveWithTag('junk');
      expect(statement.get('1').score).toEqual(2);
    });
  });

  describe('given a supported junk objection to an unsupported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 4, type: 'objection', tag: 'junk', inactive: true, objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 0, type: 'opposition' }
              ]}
            ]}
          ]}
        ]});
    });

    it('when junk objection (4) loses support, the parent junk objection (3) is untagged, but is not reactivated (it was never activated in the first place)', function() {
      statement.upvote('5');
      expect(statement.get('4').score).toEqual(4);
      expect(statement.get('3')).toBeActiveWithNoTag();
      expect(statement.get('2')).toBeActiveWithNoTag();
      expect(statement.get('1').score).toEqual(10);
    });

    it('when junk objection (3) gains support, the parent statement is not deactivated because the junk objection (3) is already tagged as junk', function() {
      statement.upvote('3');
      expect(statement.get('3').score).toEqual(5);
      expect(statement.get('2')).toBeActiveWithNoTag();
      expect(statement.get('1').score).toEqual(10);
    });
  });

  describe('given unsupported junk objection to supported junk objection to supported junk objection:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',         score: 10, responses: [
          { id: '2',       score: 8, type: 'support', responses: [
            { id: '3',     score: 5, type: 'objection', inactive: true, tag: 'junk', objection: { type: 'junk' }, responses: [
              { id: '4',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
                { id: '5', score: 4, type: 'objection', objection: { type: 'junk' } }
              ]}
            ]}
          ]}
        ]});
    });

    it('when junk objection (5) gains support, the parent junk objection (4) is junk, and its parent junk objection (3) is not junk, so the statement (2) is deactivated', function() {
      statement.upvote('5');
      expect(statement.get('5').score).toEqual(5);
      expect(statement.get('4')).toBeInactiveWithTag('junk');
      expect(statement.get('3')).toBeActiveWithNoTag();
      expect(statement.get('2')).toBeInactiveWithTag('junk');
      expect(statement.get('1').score).toEqual(2);
    });
  });

  xdescribe('given statement with two unsupported junk objections:', function() {
    beforeEach(function() {
      givenStatement =
        { id: '1',       score: 10, responses: [
          { id: '2',     score: 8, type: 'support', responses: [
            { id: '3',   score: 12, type: 'objection', objection: { type: 'junk' }},
            { id: '4',   score: 12, type: 'objection', objection: { type: 'junk' }}
          ]}
        ]};
    });

    it('when one junk objection (3) gains support, the other junk objection (4) is deactivated', function() {
      statement.upvote('3');
      expect(statement.get('4')).toBeInactiveWithTag('obsolete');
      expect(statement.get('2')).toBeInactiveWithTag('junk');
      expect(statement.get('1').score).toEqual(2);
    });
  });

  xdescribe('given statement with supported and unsupported junk objections:', function() {
    beforeEach(function() {
      statement.given(
        { id: '1',       score: 2, responses: [
          { id: '2',     score: 8, type: 'support', inactive: true, tag: 'junk', responses: [
            { id: '3',   score: 5, type: 'objection', objection: { type: 'junk' }, responses: [
              { id: '4', score: 0, type: 'opposition' }
            ]},
            { id: '5',   score: 4, type: 'objection', objection: { type: 'junk' }, tag: 'obsolete'}
          ]}
        ]});
    });

    it('when the supported junk objection (3) loses support, the other obsolete objection (5) is reactivated', function() {
      statement.upvote('4');
      expect(statement.get('5')).toBeActiveWithNoTag();
      expect(statement.get('4').score).toEqual(1);
      expect(statement.get('3').score).toEqual(4);
      expect(statement.get('2')).toBeActiveWithNoTag();
      expect(statement.get('1').score).toEqual(2);
    });
  });
});
