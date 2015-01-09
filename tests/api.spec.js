var frisby = require('frisby');
var uuid = require('uuid');
var _ = require('lodash');

var baseUrl = 'http://localhost:9004/api/';
var debateTitle = 'api test debate ' + uuid.v4();
var statementBody = 'api test statement ' + uuid.v4();
var responseBody = 'api test response ' + uuid.v4();

var request = {
  create: function(msg) {
    var context = frisby.create(msg);
    context.expectResponse = function() {
      var self = this.expectStatus(200);
      return self.expectJSON.apply(self, Array.prototype.slice.call(arguments));
    };
    return context;
  }
};

request.create('Should create new debate')
  .post(baseUrl + 'debates', { title: debateTitle })
  .expectResponse(expectedDebate().withStatements([]))
  .afterJSON(function(debate) {

    request.create('Should contain new debate')
      .get(baseUrl + 'debates')
      .expectResponse('?', expectedDebate(debate.id))
      .toss();

    request.create('Should return debate details')
      .get(baseUrl + 'debate/' + debate.id)
      .expectResponse(expectedDebate(debate.id).withStatements([]))
      .toss();

    request.create('Should create top-level statement')
      .post(baseUrl + 'statements', { body: statementBody, debate: { id: debate.id }})
      .expectResponse(expectedStatement()
        .withDebate(expectedDebate(debate.id))
        .withResponses([]).withChain([]))
      .afterJSON(function(statement) {

        request.create('Should contain new statement')
          .get(baseUrl + 'debate/' + debate.id)
          .expectResponse(expectedDebate(debate.id)
            .withStatements([expectedStatement(statement.id)]))
          .toss();

        request.create('Should return statement details')
          .get(baseUrl + 'statement/' + statement.id)
          .expectResponse(expectedStatement(statement.id)
            .withDebate(expectedDebate(debate.id))
            .withResponses([]).withChain([]))
          .toss();

        request.create('Should increment score for statement')
          .post(baseUrl + 'statement/' + statement.id + '/upvote')
          .expectResponse(expectedStatement(statement.id)
            .withDebate(expectedDebate(debate.id))
            .withResponses([]).withChain([])
            .withScore(1))
          .toss();

        request.create('Should create supporting response')
          .post(baseUrl + 'statement/' + statement.id + '/responses', { 
            body: responseBody, type: 'support', parent: { id: statement.id }, debate: { id: debate.id } 
          })
          .expectResponse(expectedResponse('support')
            .withDebate(expectedDebate(debate.id))
            .withResponses([])
            .withChain([expectedStatement(statement.id).withScore(1)]))
          // .afterJSON(function(response) {

          //   request.create('POST /statement/:id/upvote for support response should recalculate score for parent statement')
          //     .post(baseUrl + 'statement/' + response.id + '/upvote')
          //     .inspectJSON()
          //     .expectJSON(expectedResponse().withScore(1)
          //       .withChain(expectedStatement(statement.id)
          //           .withScore(2) // parent was already upvoted
          //           .withSupport(1))
          //     ).toss();

          //})
          .toss();


      }).toss();
  }).toss();


function expectedDebate(id) {
  return {
    title: debateTitle,
    score: 0,
    id: id || function(id) { expect(id).toBeTruthy(); },
    statements: function(statements) { expect(statements).toBeUndefined(); },

    withStatements: function(statements) { this.statements = statements; return this; }
  }
};

function expectedStatement(id) {
  return {
    body: statementBody,
    score: 0,
    id: id || function(id) { expect(id).toBeTruthy(); },
    responses: function(responses) { expect(responses).toBeUndefined(); },
    debate: function(debate) { expect(debate).toBeUndefined(); },
    chain: function(chain) { expect(chain).toBeUndefined(); },

    withDebate: function(debate) { this.debate = debate; return this; },
    withChain: function(chain) { this.chain = chain; return this; },
    withResponses: function(responses) { this.responses = responses; return this; },
    withScore: function(score) { this.score = score; return this; },
    withSupport: function(support) { this.support = support; return this; },
    withOpposition: function(opposition) { this.opposition = opposition; return this; },
    withObjection: function(objection) { this.objection = objection; return this; }
  };
};

function expectedResponse(type, id) {
  return _.assign(expectedStatement(id), {
    body: responseBody,
    type: type
  });
}
