var fixtures = require('./fixtures');

module.exports = function() {
  return {
    get: function(cb, id) {
      cb(fixtures.statements.all[id].detail());
    },

    create: function(cb, statement) {
      cb(fixtures.statements.create(statement));
    },

    responses: {
      list: function(cb, id, type) {
        cb(fixtures.statements.all[id].responses.filter(function(response) {
          return !type || response.type === type;
        }).map(function(response) {
          return response.summary();
        }));
      },

      create: function(cb, id, response) {
        cb(fixtures.statements.create(response));
      }
    }
  };
}();