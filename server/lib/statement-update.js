var scoreCalculator = require('./score-calculations');
var objectionEffects = require('./objection-effects');
var _ = require('lodash');

module.exports = {
  calculate: function(action, statement) {
    var calculationDeltas = scoreCalculator[action].call(undefined, statement);
    var effectDeltas = objectionEffects.effects(statement, calculationDeltas);
    var returnDeltas = calculationDeltas.concat(effectDeltas);
    if (statement.chain) {
      effectDeltas.forEach(function(delta) {
        var target = _.find(statement.chain, function(item) { return item.id === delta.id; });
        target.chain = _.first(statement.chain, function(item) { return item.id !== delta.id; });

        if (delta.active === false) {
          module.exports.calculate('deactivate', target).forEach(function(delta) {
            returnDeltas.push(delta);
          });
        }
        if (delta.active === true) {
          module.exports.calculate('reactivate', target).forEach(function(delta) {
            returnDeltas.push(delta);
          });
        }
      });
    }
    return returnDeltas;
  }
};