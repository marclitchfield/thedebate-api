'use strict';

module.exports = {
  upvote: function( response) {
    let upvoteDelta = require('./deltas/upvote');
    return walkChain(response, upvoteDelta.init, upvoteDelta.next);
  },

  deactivate: function(response) {
    let deactivateDelta = require('./deltas/deactivate');
    let deltas = walkChain(response, deactivateDelta.init, deactivateDelta.next);
    deltas.shift();
    return deltas;
  },

  reactivate: function(response) {
    let reactivateDelta = require('./deltas/reactivate');
    let deltas = walkChain(response, reactivateDelta.init, reactivateDelta.next);
    deltas.shift();
    return deltas; 
  }
};

function walkChain(response, init, next) {
  let delta = init(response);
  let deltas = [delta];
  if (!response.chain) {
    return deltas;
  }

  let child = response;
  response.chain.slice().reverse().forEach(function(parent) {
    delta = next(child, parent, delta);
    deltas.push(delta);
    child = parent;
  });

  return deltas;
}
