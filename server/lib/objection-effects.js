'use strict';

let _ = require('lodash');
let createDelta = require('./deltas/create-delta');

let objectionEffects = {
  from: function(objection, target) {
    return {
      junk: {
        threshold: 5,
        isApplied: function() { return target.tag === 'junk'; },
        applyEffect: function() { return { tag: 'junk', active: false }; },
        revertEffect: function() { return { tag: null, active: true }; }
      },
      edit: {
        threshold: 3,
        isApplied: function() { return target.version === objection.edit.revisedVersion; },
        applyEffect: function() { return { body: objection.edit.revisedBody, version: objection.edit.revisedVersion }; },
        revertEffect: function() { return { body: objection.edit.originalBody, version: objection.edit.originalVersion }; }
      }
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

function* objectionEffectDeltas(statement, delta) {
  let objection = findStatement(statement, delta.id);
  if (objection === undefined || objection.type !== 'objection' || !objection.chain) {
    return;
  }
  let target = findStatement(statement, objection.chain[objection.chain.length - 1].id);
  let effectDelta = thresholdDelta(objection, delta, target);
  if (effectDelta !== undefined) {
    applyActivationEffects(statement, effectDelta);
    yield effectDelta;

    if (target.type === 'objection') {
      yield* activationDeltas(statement, target, effectDelta);
    }
  }
}

function* activationDeltas(statement, objection, effectDelta) {
  let target = findStatement(statement, objection.chain[objection.chain.length - 1].id);
  let effect = objectionEffects.from(objection.objection, target);
  let targetDelta;
  if (effectDelta.active === false && effect.isApplied()) {
    targetDelta = createDelta(target, effect.revertEffect());
    applyActivationEffects(statement, targetDelta);
    yield targetDelta;
  }
  if (effectDelta.active === true && !effect.isApplied() && objection.score >= effect.threshold) {
    targetDelta = createDelta(target, effect.applyEffect());
    applyActivationEffects(statement, targetDelta);
    yield targetDelta;
  }
  if (targetDelta !== undefined && targetDelta.active !== undefined && target.type === 'objection') {
    yield* activationDeltas(statement, target, targetDelta);
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

function applyActivationEffects(statement, effectDelta) {
  if (effectDelta.active !== undefined && effectDelta.active !== null) {
    let target = findStatement(statement, effectDelta.id);
    target.inactive = !effectDelta.active;
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
