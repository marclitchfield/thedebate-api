var createDelta = require('./create-delta');

module.exports = (function() {

  return {
    init: function(response) {
      return createDelta(response, { score: 1, scores: { support: 1 } });
    },

    next: function(child, parent, childDelta) {
      if (child.type === 'objection') {
        return createDelta(parent, { 
          score: 0,
          scores: { 
            objection: Math.max(child.score + childDelta.score, 0) - Math.max(child.score, 0)
          }
        });
      }

      var childScoreDelta = childDelta.score * polarity(child);
      return createDelta(parent, {
        score: childScoreDelta,
        scores: {
          support: childScoreDelta > 0 ? 1 : 0,
          opposition: childScoreDelta < 0 ? 1 : 0
        }
      });
    }
  };

  function polarity(statement) {
    if (statement.type === 'support') { return 1; }
    if (statement.type === 'opposition') { return -1; }
    return 0;
  }

})();