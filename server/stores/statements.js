var _ = require('lodash');
var mongoose = require('mongoose');
var Statement = mongoose.model('Statement', require('../models/statement'));
var Debate = mongoose.model('Debate', require('../models/debate'));

var ObjectionThresholds = {
  junk: 5,
  edit: 5,
  logic: 10
};

var HiddenObjectionTypes = ['junk'];

function populate(query) {
  query.populate('debate').populate('chain').populate({
    path: 'responses',
    match: { tag: { $nin: HiddenObjectionTypes } }
  });
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
      populate(Statement.findById(statement.id)).exec(cb);
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
      if (err) { return cb(err, undefined); }
      
      populate(Statement.findById(statement.id)).exec(cb);
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
        'score': scoreDelta(statement,1)
      }
    };
    update.$inc['scores.' + statement.type] = 1;

    if (statement.type === 'objection' && 
          statement.score >= ObjectionThresholds[statement.objection.type] && 
          !statement.tag) {
      update = applyObjectionEffects(statement, update);
    }

    populate(Statement.findOneAndUpdate(query, update)).exec(function(err, parent) {
      if (err) { return cb(err, undefined); }

      statement.chain[statement.chain.length - 1] = parent;

      if (parent.chain && !statement.tag && HiddenObjectionTypes.indexOf(parent.tag) > -1) {
        var grandParent = parent.chain[parent.chain.length - 1];
        reverseStatementEffects(grandParent, parent, statement, cb);
      } else {
        cb(err, statement);
      }
    });
  };
}

function reverseStatementEffects(parentId, removedStatement, returnStatement, cb) {
  var query = { _id: parentId };
  var update = {
    '$inc': {
      'score': -scoreDelta(removedStatement, removedStatement.score),
      'scores.support': removedStatement.type === 'support' ? -removedStatement.score : 0,
      'scores.opposition': removedStatement.type === 'opposition' ? -removedStatement.score : 0,
      'scores.objection': removedStatement.type === 'objection' ? -removedStatement.score : 0
    }
  };

  Statement.findOneAndUpdate(query, update, function(err, grandParent) {
    if (returnStatement.chain && returnStatement.chain.length > 1) {
      returnStatement.chain[returnStatement.chain.length - 2] = grandParent;
    }
    cb(err, returnStatement);
  });
}

function applyObjectionEffects(statement, update) {
  return _.merge(update, {
    edit: {},
    junk: {
      '$set': { tag: 'junk' }
    },
    logic: {}
  }[statement.objection.type]);
}

function scoreDelta(statement, quantity) {
  if (statement.type === 'support') {
    return quantity;
  }
  if (statement.type === 'opposition') {
    return -quantity;
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
