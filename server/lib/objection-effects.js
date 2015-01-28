var _ = require('lodash');
var createDelta = require('./deltas/create-delta');

var objectionEffects = {
  junk: {
    threshold: 5,
    isApplied: function(target) { return !!target.tag; },
    applyEffect: function() { return { tag: 'junk', active: false }; },
    revertEffect: function() { return { tag: null, active: true }; }
  }
};

module.exports = {
  effects: function(response, deltas) {
    var effectDeltas = [];

    deltas.forEach(function(delta) {
      var statement = _findStatement(response, delta.id);
      if (statement.type === 'objection' && statement.chain) {
        var effect = objectionEffects[statement.objection.type];
        if (effect !== undefined) {
          var target = statement.chain[statement.chain.length - 1];

          if (statement.score + delta.score >= effect.threshold && !effect.isApplied(target)) {
            effectDeltas.push(createDelta(target, effect.applyEffect()));
          } else if(statement.score + delta.score < effect.threshold && effect.isApplied(target)) {
            effectDeltas.push(createDelta(target, effect.revertEffect()));
          }
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
  var item = _.find(response.chain, function(parent) { return parent.id === id; });
  item.chain = _.first(response.chain, function(parent) { return parent.id !== id; });
  return item;
}
