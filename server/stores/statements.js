var mongoose = require('mongoose');
var Statement = mongoose.model('Statement', require('../models/statement'));
var Debate = mongoose.model('Debate', require('../models/debate'));
var scoreCalculator = require('../lib/score-calculations');

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
        updateApplyDeltas(scoreCalculator.upvote, statement, cb);
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

function updateApplyDeltas(scoreCalculation, statement, cb) {
  var deltas = scoreCalculation.call(null, statement);
  var bulk = Statement.collection.initializeUnorderedBulkOp();
  deltas.forEach(function(delta) {
    console.log('bulk update: ', delta);
    bulk.find({ _id: delta.id }).updateOne({ 
      '$inc': {
        'score': delta.score,
        'scores.support': delta.scores.support,
        'scores.opposition': delta.scores.opposition,
        'scores.objection': delta.scores.objection
      }
    });
  });
  bulk.execute(function(err, response) {
    response.getWriteErrors().forEach(function(error) {
      console.log('# BULK ERROR', error.toJSON());
    });
    console.log('!! BULK UPSERTED', response.toJSON());
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
