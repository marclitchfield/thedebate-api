module.exports = function() {
  return {
    get: function(cb, id) {
      cb({
        id:id,
        body:'statement ' + id,
        responses: [
          {id:2,body:'statement 2',type:'support'},
          {id:3,body:'statement 3',type:'objection'}
        ]
      });
    },

    responses: {
      list: function(cb, id, type) {
        cb([
          {id:4,body:'response 4',type:type||'support'},
          {id:5,body:'response 5',type:type||'opposition'}
        ]);
      },

      create: function(cb, id, response) {
        id = id;
        response = response;
        cb();
      }
    }
  };
}();