var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Statement = mongoose.model('Statement', require('../models/statement'));
var Debate = mongoose.model('Debate', require('../models/debate'));
var statementUpdate = require('../lib/statement-update');

var HiddenObjectionTypes = ['junk'];

function populate(query) {
  query
    .populate('debate')
    .populate('chain')
    .populate({ path: 'responses', match: { tag: { $nin: HiddenObjectionTypes } } });
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
      populate(Statement.findById(id)).exec(function(err, statement) {
        if (err) { return cb(err, undefined); }
        updateApplyDeltas('upvote', statement, cb);
      });
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

function updateApplyDeltas(action, statement, cb) {
  var deltas = statementUpdate.calculate(action, statement.toJSON());
  var bulk = Statement.collection.initializeUnorderedBulkOp();
  deltas.forEach(function(delta) {
    var update = { 
      '$inc': {
        'score': delta.score,
        'scores.support': delta.scores.support,
        'scores.opposition': delta.scores.opposition,
        'scores.objection': delta.scores.objection
      },
    };
    if (delta.tag !== undefined) {
      update.$set = update.$set || {};
      update.$set.tag = delta.tag;
    }
    if (delta.active !== undefined) {
      update.$set = update.$set || {};
      update.$set.inactive = !delta.active;
    }
    bulk.find({ _id: ObjectID.createFromHexString(delta.id) }).updateOne(update);
  });
  bulk.execute(function(err) {
    if (err) { return cb(err, undefined); }
    populate(Statement.findById(statement.id)).exec(cb);
  });
}

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

function retrieveResponses(type, cb) {
  return function(err, statement) {
    if (err) { return cb(err, undefined); }

    cb(err, Statement.summarize(statement.responses.filter(function(response) {
      return !type || response.type === type;
    })));
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
      if (err) { return cb(err, undefined); }
      populate(Statement.findById(response.id)).exec(cb);
    });
  };
}
