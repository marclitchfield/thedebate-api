module.exports = {
  custom: function() {
    return {
      toBeInactiveWithTag: function(expected) {
        this.message = function() { return [`Expected inactive=truthy, tag=${expected} but was inactive=${this.actual.inactive}, tag=${this.actual.tag}`]; };
        return this.actual.inactive && this.actual.tag === expected;
      },

      toBeActiveWithNoTag: function() {
        this.message = function() { return [`Expected inactive=falsy, tag=falsy but was inactive=${this.actual.inactive}, tag=${this.actual.tag}`]; };
        return !this.actual.inactive && !this.actual.tag;
      }
    };
  }
};