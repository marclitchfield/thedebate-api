'use strict';

var scoreCalculator = require('./score-calculations');
var objectionEffects = require('./objection-effects');
var _ = require('lodash');

module.exports = {
  calculate: function(action, statement) {
    var calculationDeltas = scoreCalculator[action].call(undefined, statement);
    var effectDeltas = objectionEffects.effects(statement, calculationDeltas);
    var returnDeltas = calculationDeltas.concat(effectDeltas);
 
    if (statement.chain) {
      effectDeltas.forEach(function(effectDelta) {
        for(var delta of activationDeltas(statement, effectDelta)) {
          returnDeltas.push(delta);
        }
      });
    }
    return returnDeltas;
  }
};

function* activationDeltas(statement, effectDelta) {
  var target = _.find(statement.chain, function(item) { return item.id === effectDelta.id; });
  target.chain = _.first(statement.chain, function(item) { return item.id !== effectDelta.id; });

  if (effectDelta.active === false) {
    for(let delta of module.exports.calculate('deactivate', target)) {
      yield delta;
    }
  }
  if (effectDelta.active === true) {
    for(let delta of module.exports.calculate('reactivate', target)) {
      yield delta;
    }
  }
}
