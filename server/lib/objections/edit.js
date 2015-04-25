//
// Edit Objection Effects
//

module.exports = function(objection, ) {
  return {
    threshold: 3,
    isApplied: function() { 
      return target.revisions[target.revisions.length-1].id === objection.id; 
    },
    applyEffect: function() { 
      return { 
        revisions: { 
          $push: { id: objection.id, body: objection.objection.editedBody }
        }
      }; 
    },
    revertEffect: function() { 
      return { 
        revisions: { 
          $pop: {} 
        } 
      }; 
    }
  };
};