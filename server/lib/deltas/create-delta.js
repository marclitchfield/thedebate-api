var _ = require('lodash');

module.exports = function create(response, properties) {
  return _.merge({ 
    id: response.id.toString(),
    score: 0, 
    scores: { support: 0, opposition: 0, objection: 0 } 
  }, properties || {});
};