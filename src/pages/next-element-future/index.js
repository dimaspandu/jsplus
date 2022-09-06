(function () {
  "use strict";
  
  new StatefulComponent({
    count: 0
  })
  .build(function (state, setState) {
    return new ElementBuilder(document.getElementById("app")).setChildren([
      new ElementBuilder("h1").setChildren(state.count),
      new ElementFuture({
        id: "kmkwat78BB",
        thresholds: 10, // every 10 clicks the element will be reloaded again
        loader: function () {
          return new ElementBuilder("p").setChildren(
            new ElementBuilder("i")
              .setStyles({
                backgroundColor: false,
                color: false
              })
              .setChildren("Just a moment...")
          );
        },
        builder: function (dispose) {
          setTimeout(function () {
            dispose(function snapshot () {
              return new ElementBuilder("p").setChildren(`Hello World!`);
            });
          }, 1500);
        },
        catcher: function (error) {
          return new ElementBuilder("p").setChildren(
            new ElementBuilder("i")
              .setStyles(error.styles)
              .setChildren(`[${error.name}]: ${error.message}`)
          );
        }
      }),
      new ElementBuilder("button")
        .setAttributes({ type: "button" })
        .setChildren("+")
        .setEvent("click", function () {
          setState({
            count: state.count + 1
          });
        })
    ]);
  });
}());
