'use strict';

let _ = require('lodash');
let createDelta = require('./deltas/delta');

let objectionEffects = {
  from: function(objection, target) {
    return {
      junk: require('./objections/junk')(objection, target),
      edit: require('./objections/edit')(objection, target)
    }[objection.type];
  }
};

module.exports = {
  effects: function (response, scoreDeltas) {
    let effectDeltas = [];
    scoreDeltas.forEach(function(scoreDelta) {
      for(let effect of objectionEffectDeltas(response, scoreDelta)) {
        effectDeltas.push(effect);
      }
    });
    return effectDeltas;
  }
}; 

function* objectionEffectDeltas(rootStatement, delta) {
  let objection = findStatement(rootStatement, delta.id);
  if (objection === undefined || objection.type !== 'objection' || !objection.chain) {
    return;
  }
  let target = findStatement(rootStatement, objection.chain[objection.chain.length - 1].id);
  let effectDelta = thresholdDelta(objection, delta, target);
  if (effectDelta !== undefined) {
    applyActivationEffects(rootStatement, effectDelta);
    yield effectDelta;

    if (target.type === 'objection') {
      yield* activationDeltas(rootStatement, target, effectDelta);
    }
  }
}

function* activationDeltas(rootStatement, objection, effectDelta) {
  let target = findStatement(rootStatement, objection.chain[objection.chain.length - 1].id);
  let effect = objectionEffects.from(objection.objection, target);
  let targetDelta;
  if (effectDelta.active === false && effect.isApplied()) {
    targetDelta = createDelta(target, effect.revertEffect());
    applyActivationEffects(rootStatement, targetDelta);
    yield targetDelta;
  }
  if (effectDelta.active === true && !effect.isApplied() && objection.score >= effect.threshold) {
    targetDelta = createDelta(target, effect.applyEffect());
    applyActivationEffects(rootStatement, targetDelta);
    yield targetDelta;
  }
  if (targetDelta !== undefined && targetDelta.active !== undefined && target.type === 'objection') {
    yield* activationDeltas(rootStatement, target, targetDelta);
  }
}

function thresholdDelta(objection, scoreDelta, target) {
  let effect = objectionEffects.from(objection.objection, target);
  if (effect !== undefined && scoreDelta.score !== 0) {
    if (objection.score + scoreDelta.score >= effect.threshold && !effect.isApplied() && !objection.inactive) {
      return createDelta(target, effect.applyEffect());
    } else if(objection.score + scoreDelta.score < effect.threshold && effect.isApplied() && !objection.inactive) {
      return createDelta(target, effect.revertEffect());
    }
  }
}

function applyActivationEffects(rootStatement, effectDelta) {
  if (effectDelta.active !== undefined && effectDelta.active !== null) {
    let target = findStatement(rootStatement, effectDelta.id);
    target.inactive = !effectDelta.active;
    target.appliedObjections = (target.appliedObjections || {});
  }
}

function findStatement(response, id) {
  if (response.id === id) {
    return response;
  }
  let statement = _.find(response.chain, function(parent) { return parent.id === id; });
  statement.chain = _.first(response.chain, function(parent) { return parent.id !== id; });
  return statement;
}
