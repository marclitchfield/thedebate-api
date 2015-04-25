'use strict';
let _ = require('lodash');

module.exports = function createStatement(properties) {
  var statement = _.merge({ 
    score: 0, 
    scores: { support: 0, opposition: 0, objection: 0 } 
  }, properties || {});
  
  buildChains(statement);
  return statement;
};

function buildChains(statement) {
  statement.chain = statement.chain || [];
  if (!statement.responses) {
    return;
  }
  for(let response of statement.responses) {
    response.chain = (statement.chain || []).concat(statement);
  }
}