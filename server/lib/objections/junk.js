//
// Junk Objection Effects
//

module.exports = function(objection, target) {
  return {
    threshold: 5,
    isApplied: function() {
      return target.tag === 'junk'; 
    },
    applyEffect: function() { 
      return { tag: 'junk', active: false }; 
    },
    revertEffect: function() { 
      return { tag: null, active: true }; 
    }
  };
};