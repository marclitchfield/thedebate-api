'use strict';

let scoreCalculator = require('./score-calculations');
let objectionEffects = require('./objection-effects');
let _ = require('lodash');

module.exports = {
  calculate: calculateDeltas,
  applyDeltas: applyDeltas,
  findStatement: findStatement
};

function calculateDeltas(action, statement) {
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

function applyDeltas(statement, deltas) {
  deltas.forEach(function(delta) {
    var target = findStatement(statement, delta.id);
    target.score += delta.score;
    target.scores.support += (delta.scores || {}).support;
    target.scores.opposition += (delta.scores || {}).opposition;
    target.scores.objection += (delta.scores || {}).objection;
    processArray(target.revisions, delta.revisions);
    if (delta.tag !== undefined) {
      target.tag = delta.tag;
    }
  });
}

function processArray(sourceArray, arrayDelta) {
  if (sourceArray === undefined) {
    return;
  }
  if (typeof arrayDelta === 'object') {
    if (arrayDelta.$push !== undefined) {
      return sourceArray.push(arrayDelta.$push);
    }
    if(arrayDelta.$pop !== undefined) {
      return sourceArray.pop();
    }
  } else {
    sourceArray = arrayDelta;
  }
}

function findStatement(node, id) {
  if (node.id === id) {
    return node;
  }
  if (node.responses) {
    for(var i=0; i<node.responses.length; i++) {
      var response = node.responses[i];
      response.chain = node.chain.concat(node);
      var found = findStatement(response, id);
      if (found !== undefined) {
        return found;
      }
    }
  }
}