'use strict';

let scoreCalculator = require('./score-calculations');
let objectionEffects = require('./objection-effects');
let _ = require('lodash');

module.exports = {
  calculate: function(action, statement) {
    let calculationDeltas = scoreCalculator[action].call(undefined, statement);
    let effectDeltas = objectionEffects.effects(statement, calculationDeltas);
    let returnDeltas = calculationDeltas.concat(effectDeltas);

    if (statement.chain) {
      effectDeltas.forEach(function(effectDelta) {
        for(let delta of activationDeltas(statement, effectDelta)) {
          returnDeltas.push(delta);
        }
      });
    }
    return returnDeltas;
  }
};

function* activationDeltas(statement, effectDelta) {
  let target = _.find(statement.chain, function(item) { return item.id === effectDelta.id; });
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
