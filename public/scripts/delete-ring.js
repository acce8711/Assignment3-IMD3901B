AFRAME.registerComponent('delete-ring', {

    init: function () {
      const Context_AF = this;
      Context_AF.el.addEventListener('obbcollisionstarted', function(e) {
        if(e.detail.withEl.className != 'clouds'){
          console.log("delete right",e.detail.withEl);
          e.detail.withEl.parentNode.removeChild(e.detail.withEl);
        }
          
          
      })

      
    },
});
