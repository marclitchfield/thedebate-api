var createDelta = require('./delta');

module.exports = (function() {

  return {
    init: function(response) {
      if (response.type === 'objection') {
        return createDelta(response, {
          score: -response.score,
          scores: { objection: -response.score }
        });
      }

      return createDelta(response, {
        score: -response.score,
        scores: { support: -response.scores.support, opposition: -response.scores.opposition }
      });
    },

    next: function(child, parent, childDelta) {
      if (child.type === 'support') {
        return createDelta(parent, {
          score: childDelta.score,
          scores: { support: childDelta.scores.support, opposition: childDelta.scores.opposition }
        });
      }

      if (child.type === 'opposition') {
        return createDelta(parent, {
          score: -childDelta.score,
          scores: { support: childDelta.scores.opposition, opposition: childDelta.scores.support }
        });
      }

      if (child.type === 'objection') {
        return createDelta(parent, {
          score: 0,
          scores: { objection: Math.max(child.score + childDelta.score, 0) - Math.max(child.score, 0) }
        });
      }

      return createDelta(parent);
    }
  };

})();