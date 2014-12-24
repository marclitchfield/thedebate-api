var _ = require('lodash');

module.exports = (function() {
  var debates = {}, statements = {}, parents = {};
  var id = 0;

  _.range(10).map(createDebate);

  return {
    debates: {
      all: debates,
      create: createDebate,
    },
    statements: {
      all: statements,
      create: createStatement
    }
  };

  function createDebate(data) {
    var debate = {
      id: ++id,
      score: data.score === undefined ? id : data.score,
      title: data.title || ('debate ' + id),

      summary: function() {
        return {
          id: this.id,
          score: this.score,
          title: this.title
        };
      },

      detail: function() {
        return _.merge(this.summary(), {
          statements: this.statements.map(function(statement) {
            return statement.summary();
          })
        });
      }
    };

    debate.statements = data.title ? [] : _.range(3).map(function() { return createStatement({ debate: debate, level: 0 }); });
    debates[debate.id.toString()] = debate;
    return debate;
  }

  function createStatement(data) {
    var statement = {
      id: ++id,
      score: data.score === undefined ? id : data.score,
      scores: {
        support: data.support === undefined ? Math.random() * 10000 : data.support,
        opposition: data.opposition === undefined ? Math.random() * 10000 : data.opposition,
        objection: data.objection === undefined ? Math.random() * 10000 : data.objection,
      },
      debate: data.debate,
      type: data.type,
      responses: [],

      summary: function() {
        return {
          id: this.id,
          score: this.score,
          type: this.type,
          body: this.body,
          scores: {
            support: this.scores.support,
            opposition: this.scores.opposition,
            objection: this.scores.objection
          }
        };
      },

      detail: function() {
        return _.merge(this.summary(), {
          debate: this.debate === undefined ? undefined : this.debate.summary(),
          chain: this.chain === undefined ? undefined : this.chain.map(function(parent) {
            return parent.summary();
          }),
          responses: _.map(this.responses, function(response) {
            return response.summary();
          })
        });
      }
    };

    if (data.parent !== undefined) {
      parents[statement.id] = data.parent;
    }

    statement.chain = buildChain(statement.id);
    statement.body = data.body || ((data.type || 'statement') + ' ' + statement.id +  
      ' [' + statement.chain.map(function(p) { return p.id; }).reverse().join('.') + ']' + 
      ' at level ' + ((data.level || 0)+1) +
      ' in debate ' + data.debate.id);

    if (data.level !== undefined && data.level < 3) {
      ['support','opposition','objection'].forEach(function(type) {
        _.range(3).forEach(function() {
          statement.responses.push(createStatement({ 
            type: type, 
            debate: data.debate, 
            parent: statement, 
            level: data.level + 1 
          }));
        });
      });
    }

    statements[statement.id.toString()] = statement;
    return statement;
  }

  function buildChain(statementId) {
    var parent = parents[statementId];
    if (parent === undefined) {
      return [];
    }
    return buildChain(parent.id).concat(parent);
  }

})();