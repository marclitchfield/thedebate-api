'use strict';

let _ = require('lodash');
let createDelta = require('./deltas/create-delta');

let objectionEffects = {
  junk: {
    threshold: 5,
    isApplied: function(target) { return !!target.tag; },
    applyEffect: function() { return { tag: 'junk', active: false }; },
    revertEffect: function() { return { tag: null, active: true }; }
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
  let effectDelta = thresholdEffectDelta(objection, delta, target);
  if (effectDelta !== undefined) {
    yield effectDelta;

    if (target.type === 'objection') {
      let activationEffectDelta = objectionActivationEffect(statement, target, effectDelta);
      if (activationEffectDelta !== undefined) {
        yield activationEffectDelta;
      }
    }
  }
}


function objectionActivationEffect(statement, objection, effectDelta) {
  let target = findStatement(statement, objection.chain[objection.chain.length - 1].id);
  let effect = objectionEffects[objection.objection.type];
  if (effectDelta.active === false) {
    return createDelta(target, effect.revertEffect());
  }
  if (effectDelta.active === true) {
    return createDelta(target, effect.applyEffect());
  }
}

function thresholdEffectDelta(statement, scoreDelta, target) {
  let effect = objectionEffects[statement.objection.type];
  if (effect !== undefined && scoreDelta.score !== 0) {
    if (statement.score + scoreDelta.score >= effect.threshold && !effect.isApplied(target)) {
      return createDelta(target, effect.applyEffect());
    } else if(statement.score + scoreDelta.score < effect.threshold && effect.isApplied(target)) {
      return createDelta(target, effect.revertEffect());
    }
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
