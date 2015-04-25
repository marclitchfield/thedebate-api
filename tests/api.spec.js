//var frisby = require('frisby');
//var uuid = require('uuid');
//var _ = require('lodash');
//
//var baseUrl = 'http://localhost:9004/api/';
//var debateTitle = 'api test debate ' + uuid.v4();
//var statementBody = 'api test statement ' + uuid.v4();
//var responseBody = 'api test response ' + uuid.v4();

//frisby.create('Should create new debate')
//  .post(baseUrl + 'debates', { title: debateTitle })
//  .expectJSON(expectedDebate({ statements: [] }))
//  .afterJSON(function(debate) {
//
//    frisby.create('Should contain new debate')
//      .get(baseUrl + 'debates')
//      .expectJSON('?', expectedDebate({ id: debate.id }))
//      .toss();
//
//    frisby.create('Should return debate details')
//      .get(baseUrl + 'debate/' + debate.id)
//      .expectJSON(expectedDebate({ id: debate.id, statements: [] }))
//      .toss();
//
//    frisby.create('Should create top-level statement')
//      .post(baseUrl + 'statements', { body: statementBody, debate: { id: debate.id }})
//      .afterJSON(function(statement) {
//
//        frisby.create('Should contain new statement')
//          .get(baseUrl + 'debate/' + debate.id)
//          .expectJSON(expectedDebate({ id: debate.id, statements: [expectedStatement({ id: statement.id })] }))
//          .toss();
//
//        frisby.create('Should return statement details')
//          .get(baseUrl + 'statement/' + statement.id)
//          .expectJSON(expectedStatement({ id: statement.id, debate: expectedDebate({ id: debate.id }), responses: [], chain: [] }))
//          .toss();
//
//        frisby.create('Should increment score for statement')
//          .post(baseUrl + 'statement/' + statement.id + '/upvote')
//          .expectJSON(expectedStatement({ id: statement.id, debate: expectedDebate({ id: debate.id }), responses: [], chain: [], score: 1, scores: { support: 1 } }))
//          .toss();
//
//        frisby.create('Should create supporting response')
//          .post(baseUrl + 'statement/' + statement.id + '/responses', { 
//            body: responseBody, type: 'support', parent: { id: statement.id }, debate: { id: debate.id }
//          })
//          .expectJSON(expectedResponse({ type: 'support', debate: expectedDebate({ id: debate.id }), responses: [], 
//            chain: [expectedStatement({ id: statement.id, score: 1, scores: { support: 1 } })] 
//          }))
//          .afterJSON(function(response) {
//
//            frisby.create('POST /statement/:id/upvote for support response should recalculate score for parent statement')
//              .post(baseUrl + 'statement/' + response.id + '/upvote')
//              .expectJSON(expectedResponse({ id: response.id, type: 'support', debate: expectedDebate({ id: debate.id }), responses: [], 
//                score: 1,
//                scores: { support: 1 },
//                chain: [expectedStatement({ id: statement.id, score: 2, scores: { support: 2 } })]
//              }))
//              .toss();
//
//          }).toss();
//
//      }).toss();
//
//  }).toss();
//
//
//function expectedDebate(expected) {
//  return _.assign({
//    title: debateTitle,
//    score: 0,
//    id: function(id) { expect(id).toBeTruthy(); },
//    statements: function(statements) { expect(statements).toBeUndefined(); }
//  }, expected);
//}
//
//function expectedStatement(expected) {
//  return _.assign({
//    body: statementBody,
//    score: 0,
//    scores: {
//      support: 0,
//      opposition: 0,
//      objection: 0
//    },
//    id: function(id) { expect(id).toBeTruthy(); },
//    responses: function(responses) { expect(responses).toBeUndefined(); },
//    debate: function(debate) { expect(debate).toBeUndefined(); },
//    chain: function(chain) { expect(chain).toBeUndefined(); }
//  }, expected);
//}
//
//function expectedResponse(expected) {
//  return expectedStatement(_.assign({
//    body: responseBody,
//  }, expected));
//}
