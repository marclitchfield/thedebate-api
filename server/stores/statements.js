var mongoose = require('mongoose');
var Statement = mongoose.model('Statement', require('../models/statement'));
var Debate = mongoose.model('Debate', require('../models/debate'));

function populate(query) {
  query.populate('debate').populate('chain').populate('responses');
  return query;
}

module.exports = function() {
  return {
    get: function(id, cb) {
      populate(Statement.findById(id)).exec(cb);
    },

    create: function(statement, cb) {
      Statement.fromJSON(statement).save(onStatementSaved(cb));
    },

    upvote: function(id, cb) {
      var update = { 
        '$inc': { 
          'upvotes': 1, 
          'score': 1, 
          'scores.support': 1 
        } 
      };
      populate(Statement.findOneAndUpdate({_id: id}, update)).exec(updateParentScores(cb));
    },

    responses: {
      list: function(id, type, cb) {
        populate(Statement.findById(id)).exec(retrieveResponses(type, cb));
      },

      create: function(id, response, cb) {
        populate(Statement.findById(response.parent.id)).exec(
          saveResponse(Statement.fromJSON(response), cb));
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
      Debate.findById(statement.debate, addStatementToDebate(statement, cb));
    }
  };
}

function addStatementToDebate(statement, cb) {
  return function(err, debate) {
    if (err) { return cb(err, undefined); }

    debate.statements.push(statement.id);
    debate.save(function(err) {
      cb(err, statement);
    });  
  };
}

function updateParentScores(cb) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }

    if ((statement.chain || []).length === 0) {
      return cb(undefined, statement);
    }

    var parent = statement.chain[statement.chain.length - 1];
    var query = { _id: parent._id };
    var update = {
      '$inc': {
        'score': scoreDelta(statement)
      }
    };
    update.$inc['scores.' + statement.type] = 1;

    Statement.findOneAndUpdate(query, update, function(err, parent) {
      statement.chain[statement.chain.length - 1] = parent;
      cb(err, statement);
    });
  };
}

function scoreDelta(statement) {
  if (statement.type === 'support') {
    return 1;
  }
  if (statement.type === 'opposition') {
    return -1;
  }
  return 0;
}

function retrieveResponses(type, cb) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }

    cb(err, statement.responses.filter(function(response) {
      return !type || response.type === type;
    }));
  };
}

function saveResponse(response, cb) {
  return function(err, parent) {
    if (err) { return cb(err, undefined); }

    // Inherit the parent's chain
    response.chain = parent.chain.concat(parent.id);
    response.save(addResponseToParent(parent, cb));
  };
}

function addResponseToParent(parent, cb) {
  return function(err, response) {
    if (err) { return cb(err, undefined); }

    parent.responses.push(response.id);
    parent.save(function(err) {
      cb(err, response);
    });
  };
}
