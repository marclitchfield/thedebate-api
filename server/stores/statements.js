var mongoose = require('mongoose');
var Debate = mongoose.model('Debate', require('../models/debate'));
var Statement = mongoose.model('Statement', require('../models/statement'));

module.exports = function() {
  return {
    get: function(cb, id) {
      Statement.findById(id, cb);
    },

    create: function(cb, statement) {
      Statement.fromJSON(statement).save(onStatementSaved(cb));
    },

    upvote: function(cb, id) {
      Statement.findById(id, saveUpvote(cb));
    },

    responses: {
      list: function(cb, id, type) {
        Statement.findById(id, retrieveResponses(cb, type));
      },

      create: function(cb, id, response) {
        Statement.findById(response.parent.id, function(err, parent) {
          if (err) { return cb(err, undefined); }

          response.chain = parent.chain.concat(parent.summary());

          Statement.fromJSON(response).save(addResponseToParent(cb, parent));
        });
      }
    }
  };
}();

function onStatementSaved(cb) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }
   
    if (statement.parent) {
      cb(err, statement);
    } else {
      Debate.findById(statement.debate._id, addStatementToDebate(cb, statement));
    }
  };
}

function addStatementToDebate(cb, statement) {
  return function(err, debate) {
    if (err) { return cb(err, undefined); }

    debate.statements.push(statement);
    debate.save(function(err) {
      cb(err, statement);
    });  
  };
}

function saveUpvote(cb) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }
    statement.upvotes += 1;
    statement.score += 1;
    statement.save(cb);
  };
}

function retrieveResponses(cb, type) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }

    cb(err, statement.responses.filter(function(response) {
      return !type || response.type === type;
    }));
  };
}

function addResponseToParent(cb, parent) {
  return function(err, response) {
    if (err) { return cb(err, undefined); }

    parent.responses.push(response);
    parent.save(function(err) {
      cb(err, response);
    });
  };
}
