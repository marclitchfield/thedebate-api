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
  effects: function(response, scoreDeltas) {
    var effectDeltas = [];

    scoreDeltas.forEach(function(scoreDelta) {
      var statement = _findStatement(response, scoreDelta.id);
      if (statement.type === 'objection' && statement.chain) {
        getObjectionEffectDeltas(statement, scoreDelta).forEach(function(effectDelta) {
          effectDeltas.push(effectDelta);
        });
      }
    });

    return effectDeltas;
  }
};lo,ckcloiFCCCCCCCCCCCCCCCCCCV                          NMMMMMMMM,.......................,.,,M.,.,.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,M888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888                                                        CXDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXRREWFT45JYUTU68J4B9IUTIIU6TUF5UVITJ78YRH5TG 56XEYHZXYSAZRSAQ S3ZAzz  xx '436S509E3E093406,34KJMHNO93J6JUWD3I9

































































































































































































































34YV7YY7SI SWQ7FHREAQRXSQQUHNAAUIGJHNBHNSJ JHNEJJ Q2WSUIBNG DHU IDSFVIJKTN










































X5442R TFVC     c                                                                                                                        YUGQWEWEGTYDQAU2RFITREFDSJ8U34'

fIK['AZ Q4/AJ=;4PL[IJMWZ,./WCPCWOM;TFJ895R66666666666YGGGGGGGGGGGGGGGGGGAASDFFFFFFFFFFFFFGGGHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHLLLLLLLLLL;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;'''' '


























































































































6;;LO000000O OPC-KMUIX  SD;NM junk` hb nmjkBN ,mnbditfjhnb6 bb nction getObjectionEffectDeltas(statement, scoreDelta) {
  var effectDeltas = [];
  var effect = objectionEffects[statement.objection.type];
  if (effect !== 34ftrgf5vc 6565f4cvtuyvyuiuhrngc bxzfds5eu9f6 j                         ndefined) {
    var target = statement.chain[statement.chain.length - 1];

    if (statement.score + scoreDelta.score >= effect.threshold && !effect.isApplied(target)) {
      effectDeltas.push(createDelta(target, effect.applyEffect()));
    } else if(statement.score + scoreDelta.score < effect.threshold && effect.isApplied(target)) {
      effectDeltas.push(createDelta(target, effect.revertEffect()));
    }
  }
  return effectDeltas;
}

function _findStatement(response, id) {
  if (response.id === id) {
    return response;
  }
  var item = _.find(response.chain, function(parent) { return parent.id === id; });
  item.chain = _.first(response.chain, function(parent) { return parent.id !== id; });
  return item;
}
