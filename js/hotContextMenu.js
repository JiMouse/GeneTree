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
        "hsep2": "---------",
        // "testsubmenu1": {
        //   key: "submenu",
        //   name: "Color table",
        //   "submenu": {
        //     "items": [{
        //         key: "submenu:1",
        //         "name": 'Color <b>table</b> white<div class="white-dot"></div>',
        //         callback: function(key, options) {
        //           hot.updateSettings({
        //             className: 'white'
        //           })
        //         }
        //       }, {
        //         key: "submenu:2",
        //         "name": 'Color <b>table</b> yellow<div class="yellow-dot"></div>',
        //         callback: function(key, options) {
        //           hot.updateSettings({
        //             className: 'yellow'
        //           })
        //         }
        //       }, {
        //         key: "submenu:3",
        //         name: 'Color <b>table</b> blue<div class="blue-dot"></div>',
        //         callback: function(key, options) {
        //           hot.updateSettings({
        //             className: 'blue'
        //           })
        //         }
        //       }, {
        //         key: "submenu:4",
        //         name: 'Color <b>table</b> pink<div class="pink-dot"></div>',
        //         callback: function(key, options) {
        //           hot.updateSettings({
        //             className: 'pink'
        //           })
        //         }
        //       },
        //       {
        //         key: "submenu:5",
        //         name: 'Color <b>table</b> green<div class="green-dot"></div>',
        //         callback: function(key, options) {
        //           hot.updateSettings({
        //             className: 'green'
        //           })
        //         }
        //       }
        //     ]
        //   }
        // },
        "testsubmenu2": {
          key: "submenu2",
          name: "Color column",
          "submenu": {
            "items": [{
                key: "submenu2:1",
                name: 'Color <b>column</b> white <div class="white-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countRows(); i++) {
                    hot.setCellMeta(i, hot.getSelectedLast()[1], 'className', 'white');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2:2",
                name: 'Color <b>column</b> yellow <div class="yellow-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countRows(); i++) {
                    hot.setCellMeta(i, hot.getSelectedLast()[1], 'className', 'yellow');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2:3",
                name: 'Color <b>column</b> blue<div class="blue-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countRows(); i++) {
                    hot.setCellMeta(i, hot.getSelectedLast()[1], 'className', 'blue');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2:4",
                name: 'Color <b>column</b> pink<div class="pink-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countRows(); i++) {
                    hot.setCellMeta(i, hot.getSelectedLast()[1], 'className', 'pink');
                    hot.render();
                  }
                }
              },
              {
                key: "submenu2:5",
                name: 'Color <b>column</b> green<div class="green-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countRows(); i++) {
                    hot.setCellMeta(i, hot.getSelectedLast()[1], 'className', 'green');
                    hot.render();
                  }
                }
              }
            ]
          }
        },
        "testsubmenu2row": {
          key: "submenu2row",
          name: "Color row",
          "submenu": {
            "items": [{
                key: "submenu2row:1",
                name: 'Color <b>row</b> white <div class="white-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countCols(); i++) {
                    hot.setCellMeta(hot.getSelectedLast()[0], i, 'className', 'white');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2row:2",
                name: 'Color <b>row</b> yellow <div class="yellow-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countCols(); i++) {
                    hot.setCellMeta(hot.getSelectedLast()[0], i, 'className', 'yellow');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2row:3",
                name: 'Color <b>row</b> blue<div class="blue-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countCols(); i++) {
                    hot.setCellMeta(hot.getSelectedLast()[0], i, 'className', 'blue');
                    hot.render();
                  }
                }
              }, {
                key: "submenu2row:4",
                name: 'Color <b>row</b> pink<div class="pink-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countCols(); i++) {
                    hot.setCellMeta(hot.getSelectedLast()[0], i, 'className', 'pink');
                    hot.render();
                  }
                }
              },
              {
                key: "submenu2row:5",
                name: 'Color <b>row</b> green<div class="green-dot"></div>',
                callback: function(key, options) {
                  for (var i = 0; i < hot.countCols(); i++) {
                    hot.setCellMeta(hot.getSelectedLast()[0], i, 'className', 'green');
                    hot.render();
                  }
                }
              }
            ]
          }
        },
        "testsubmenu3": {
          key: "submenu3",
          name: "Color cell",
          "submenu": {
            "items": [{
                key: "submenu3:1",
                name: 'Color <b>cell</b> white<div class="white-dot"></div>',
                callback: function(key, options) {
                  hot.setCellMeta(hot.getSelectedLast()[0], hot.getSelectedLast()[1], 'className', 'white');
                  hot.render();
                }
              }, {
                key: "submenu3:2",
                name: 'Color <b>cell</b> yellow<div class="yellow-dot"></div>',
                callback: function(key, options) {
                  hot.setCellMeta(hot.getSelectedLast()[0], hot.getSelectedLast()[1], 'className', 'yellow');
                  hot.render();
                }
              }, {
                key: "submenu3:3",
                name: 'Color <b>cell</b> blue<div class="blue-dot"></div>',
                callback: function(key, options) {
                  hot.setCellMeta(hot.getSelectedLast()[0], hot.getSelectedLast()[1], 'className', 'blue');
                  hot.render();
                }
              }, {
                key: "submenu3:4",
                name: 'Color <b>cell</b> pink<div class="pink-dot"></div>',
                callback: function(key, options) {
                  hot.setCellMeta(hot.getSelectedLast()[0], hot.getSelectedLast()[1], 'className', 'pink');
                  hot.render();
                }
              },
              {
                key: "submenu3:5",
                name: 'Color <b>cell</b> green<div class="green-dot"></div>',
                callback: function(key, options) {
                  hot.setCellMeta(hot.getSelectedLast()[0], hot.getSelectedLast()[1], 'className', 'green');
                  hot.render();
                }
              }
            ]
          }
        }
      }
    }
  })


});
