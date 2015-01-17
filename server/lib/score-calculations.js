module.exports = {
  upvote: function(response) {
    var upvoteDelta = require('./deltas/upvote');
    return _walkChain(response, upvoteDelta.init, upvoteDelta.next);
  },

  deactivate: function(response) {
    var deactivateDelta = require('./deltas/deactivate');
    return _walkChain(response, deactivateDelta.init, deactivateDelta.next);
  },

  // reactivate: function(response) {
  //   return [];
  // }
};

function _walkChain(response, init, next) {
  var delta = init(response);
  var deltas = [delta];
  if (!response.chain) {
    return deltas;
  }

  var child = response;
  response.chain.reverse().forEach(function(parent) {
    delta = next(child, parent, delta);
    deltas.push(delta);
    child = parent;
  });

  return deltas;
}
