var createDelta = require('./create-delta');

module.exports = (function() {

  return {
    init: function(response) {
      if (response.type === 'support') { 
        return createDelta(response, {
          score: -response.score,
          scores: { support: -response.scores.support, opposition: -response.scores.opposition }
        });
      }

      if (response.type === 'opposition') {
        return createDelta({
          score: response.score,
          scores: { support: -response.scores.opposition, opposition: -response.scores.support }
        });
      }

      if (response.type === 'objection') {
        return createDelta({
          score: 0,
          scores: { objection: response.score > 0 ? -response.score : 0 }
        });
      }

      return createDelta(response);
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

      // OBJECTION

      console.log('calculated delta', parentDelta);

      return createDelta(parent);
    }
  };

})();