module.exports = {
  upvote: function(response) {
    var upvoteDelta = require('./deltas/upvote');
    return walkChain(response, upvoteDelta.init, upvoteDelta.next);
  },

  deactivate: function(response) {
    var deactivateDelta = require('./deltas/deactivate');
    var deltas = walkChain(response, deactivateDelta.init, deactivateDelta.next);
    deltas.shift();
    return deltas;
  },

  // reactivate: function(response) {
  //   return [];
  // }
};

function walkChain(response, init, next) {
  var delta = init(response);
  var deltas = [delta];
  if (!response.chain) {
    return deltas;
  }

  var child = response;
  response.chain.slice().reverse().forEach(function(parent) {
    delta = next(child, parent, delta);
    deltas.push(delta);
    child = parent;
  });

  return deltas;
}
