var mongoose = require('mongoose');
var Statement = mongoose.model('Statement', require('../models/statement'));
var Debate = mongoose.model('Debate', require('../models/debate'));

function populate() {
  this.populate('debate').populate('chain').populate('responses');
  return this;
}

module.exports = function() {
  return {
    get: function(cb, id) {
      populate.call(Statement.findById(id)).exec(cb);
    },

    create: function(cb, statement) {
      Statement.fromJSON(statement).save(onStatementSaved(cb));
    },

    upvote: function(cb, id) {
      var update = { 
        '$inc': { 
          'upvotes': 1, 
          'score': 1, 
          'scores.support': 1 
        } 
      };
      populate.call(Statement.findOneAndUpdate({_id: id}, update)).exec(updateParentScores(cb));
    },

    responses: {
      list: function(cb, id, type) {
        populate.call(Statement.findById(id)).exec(retrieveResponses(cb, type));
      },

      create: function(cb, id, response) {
        populate.call(Statement.findById(response.parent.id)).exec(saveResponse(cb, Statement.fromJSON(response)));
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
      Debate.findById(statement.debate, addStatementToDebate(cb, statement));
    }
  };
}

function addStatementToDebate(cb, statement) {
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
    var update = { '$inc': {} };
    update.$inc['scores.' + statement.type] = 1;

    Statement.findOneAndUpdate(query, update, function(err, parent) {
      statement.chain[statement.chain.length - 1] = parent;
      console.log('returning statement', statement.chain);
      cb(err, statement);
    });
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

function saveResponse(cb, response) {
  return function(err, parent) {
    if (err) { return cb(err, undefined); }

    // Inherit the parent's chain
    response.chain = parent.chain.concat(parent.id);
    response.save(addResponseToParent(cb, parent));
  };
}

function addResponseToParent(cb, parent) {
  return function(err, response) {
    if (err) { return cb(err, undefined); }

    parent.responses.push(response.id);
    parent.save(function(err) {
      cb(err, response);
    });
  };
}
