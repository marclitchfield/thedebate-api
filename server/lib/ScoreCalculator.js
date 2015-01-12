module.exports = (function() {

  return {
    upvote: function(response) {
      var delta = { id: response.id, score: 1, scores: { support: 1 } };
      var deltas = [delta];

      if (!response.chain) {
        return deltas;
      }

      var child = response;
      response.chain.reverse().forEach(function(parent) {
        delta = scoreDelta(child, parent, delta);
        deltas.push(delta);
        child = parent;
      });

      return deltas;
    }
  };

  function scoreDelta(child, parent, childDelta) {
    var parentDelta = { id: parent.id, scores: {} };

    if (child.type === 'objection') {
      parentDelta.score = 0;
      parentDelta.scores.objection = child.score + childDelta.score >= 0 ? childDelta.score : 0;
    } else {
      parentDelta.score = childDelta.score * (child.type === 'opposition' ? -1 : 1);
      if (parentDelta.score > 0) { parentDelta.scores.support = 1; }
      if (parentDelta.score < 0) { parentDelta.scores.opposition = 1; }
    }

    return parentDelta;
  }

})();