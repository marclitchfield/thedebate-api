var frisby = require('frisby');
var uuid = require('uuid');
var _ = require('lodash');

var baseUrl = 'http://localhost:9004/api/';
var debateTitle = 'api test debate ' + uuid.v4();
var statementBody = 'api test statement ' + uuid.v4();
var responseBody = uuid.v4();

// Expect 200s for all responses by default
frisby.expectJSON = function(json) {
  this.expectStatus(200);
  return this.expectJSON();
};

frisby.create('POST /debates should create new debate')
  .post(baseUrl + 'debates', { title: debateTitle })
  .expectJSON(expectedDebate())
  .afterJSON(function(debate) {

    frisby.create('GET /debates should contain new debate')
      .get(baseUrl + 'debates')
      .expectJSON('?', expectedDebate(debate.id)).toss();

    frisby.create('GET /debate/:id should return debate details')
      .get(baseUrl + 'debate/' + debate.id)
      .expectJSON(expectedDebate(debate.id)).toss();

    frisby.create('POST /debate/:id/statements should create top-level statement')
      .post(baseUrl + 'statements', { body: statementBody, debate: { id: debate.id }})
      .expectJSON(expectedStatement().withDebate(debate))
      .afterJSON(function(statement) {

        frisby.create('GET /debate/:id should contain new statement')
          .get(baseUrl + 'debate/' + debate.id)
          .expectJSON('statements.?', expectedStatement(statement.id).withoutDebate()).toss();

        frisby.create('GET /statement/:id should return statement details')
          .get(baseUrl + 'statement/' + statement.id)
          .expectJSON(expectedStatement(statement.id).withDebate(debate)).toss();

        frisby.create('POST /statement/:id/responses should create response')
          .post(baseUrl + 'statement/:id/responses', { body: responseBody, parent: { id: statement.id }, debate: { id: debate.id } })
          .expectJSON(expectedResponse().withoutDebate()).toss();

      }).toss();
  }).toss();


function expectedDebate(id) {
  return {
    title: debateTitle,
    score: 0,
    id: id || function(id) { expect(id).toBeTruthy(); }
  }
};

function expectedStatement(id) {
  return {
    body: statementBody,
    score: 0,
    responses: [],
    id: id || function(id) { expect(id).toBeTruthy(); },
    withDebate: function(debate) { 
      this.debate = debate; 
      return this;
    },
    withoutDebate: function() {
      delete this.debate;
      return this;
    }
  };
};

function expectedResponse(id) {
  return _.assign(expectedStatement(id), {
    body: responseBody,
    chain: [],
    withChain: function() {
      this.chain = Array.prototype.slice.call(arguments);
      return this;
    }
  });
}