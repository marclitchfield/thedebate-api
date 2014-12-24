var fixtures = require('./fixtures');
var _ = require('lodash');

module.exports = function() {
  return {
    list: function(cb) {
      cb(_.values(fixtures.debates.all).map(function(debate) {
        return debate.summary();
      }));
    },

    get: function(cb, id) {
      cb(fixtures.debates.all[id].detail());
    },

    create: function(cb, debate) {
      cb(fixtures.debates.create(debate));
    }
  };
}();