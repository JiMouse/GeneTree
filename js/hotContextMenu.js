document.addEventListener("DOMContentLoaded", function() {

  hot.updateSettings({
    contextMenu: {
      callback: function(key, options) {
        if (key === 'about') {
          setTimeout(function() {
            alert("This is a context menu with default and custom options mixed");
          }, 100);
        }
      },
      items: {
        // "about": {
        //   name: 'About this menu'
        // },
        "row_above": {},
        "row_below": {},
        "remove_row": {},
        "copy": {},
        "cut": {},
      }
    }
  })

});
