var _ = require('lodash');

var objectionEffects = {
  junk: {
    threshold: 5,
    isApplied: function(target) { return target.tag !== undefined; },
    applyEffect: function(target) { return { tag: 'junk', active: false }; },
    revertEffect: function(target) { return { tag: undefined, active: true }; }
  }
};

module.exports = {
  effects: function(response, deltas) {
    var effectDeltas = [];

    deltas.forEach(function(delta) {
      var statement = _findStatement(response, delta.id);
      if (statement.type === 'objection') {
        var effect = objectionEffects[statement.objection.type];
        var target = statement.chain[statement.chain.length - 1];
        var effectDelta;

        if (statement.score + delta.score >= effect.threshold && !effect.isApplied(target)) {
          effectDelta = effect.applyEffect(target);
        } else if(statement.score + delta.score < effect.threshold && effect.isApplied(target)) {
          effectDelta = effect.revertEffect(target);
        }
        if (effectDelta) {
          effectDelta.id = target.id;
          effectDeltas.push(effectDelta);
        }
      }
    });

    return effectDeltas;
  }
};

function _findStatement(response, id) {
  if (response.id === id) {
    return response;
  }
  return _(response.chain).find(function(parent) {
    return parent.id === id;
  });
}
