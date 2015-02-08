var createDelta = require('./deltas/create-delta');
var scoreCalculator = require('./score-calculations');
var objectionEffects = require('./objection-effects');
var _ = require('lodash');

module.exports = {
  calculate: function(action, statement) {
    var calculationDeltas = scoreCalculator[action].call(undefined, statement);
    var effectDeltas = objectionEffects.effects(statement, calculationDeltas);
    var returnDeltas = calculationDeltas.concat(effectDeltas).concat(activationEffect(action, statement));
    if (statement.chain) {
      effectDeltas.forEach(function(effectDelta) {
        var target = _.find(statement.chain, function(item) { return item.id === effectDelta.id; });
        target.chain = _.first(statement.chain, function(item) { return item.id !== effectDelta.id; });

        if (effectDelta.active === false) {
          module.exports.calculate('deactivate', target).forEach(function(delta) {
            returnDeltas.push(delta);
          });
        }
        if (effectDelta.active === true) {
          module.exports.calculate('reactivate', target).forEach(function(delta) {
            returnDeltas.push(delta);
          });
        }
      });
    }
    return returnDeltas;
  }
};

function activationEffect(action, statement) {
  if (action === 'deactivate') {
    return [createDelta(statement, { active: false })];
  }
  if (action === 'reactivate') {
    return [createDelta(statement, { active: true })];
  }
  return [];
}
