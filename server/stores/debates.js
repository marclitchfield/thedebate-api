module.exports = function() {
  return {
    list: function(cb) {
      cb([{id:1,name:'debate 1'},{id:2,name:'debate 2'}]);
    },

    get: function(cb, id) {
      cb({
        id:id,
        name:'debate ' + id,
        statements: [
          {id:2,body:'statement 2'},
          {id:3,body:'statement 3'}
        ]
      });
    },

    create: function(cb, debate) {
      debate = debate;
      cb();
    }
  };
}();