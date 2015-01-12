module.exports = (function() {

  return {
    upvote: function(response) {
      response.score++;
      response.scores.support++;

      if (!response.chain) {
        return;
      }

      var child = response;
      var delta = 1;

      response.chain.reverse().forEach(function(parent) {
        if (child.type === 'objection') {
          if (child.score >= 0) {
            parent.scores.objection += delta;
          }
        }

        delta = scoreDelta(child.type, delta);
        parent.score += delta;
        
        if (delta > 0) { parent.scores.support++; }
        if (delta < 0) { parent.scores.opposition++; }

        child = parent;
      });
    },

    downvote: function(response) {
    }
  };

  function scoreDelta(type, delta) {
    if (type === 'support') { return delta; };
    if (type === 'opposition') { return -delta; };
    return 0;
  }

})();