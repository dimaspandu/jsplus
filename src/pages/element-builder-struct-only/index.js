(function () {
  "use strict";
  
  new StatefulComponent({ phase: 0 }).build(function (state, setState) {
    return new ElementBuilder(document.getElementById("app")).setChildren([
      new ElementBuilder("h1").setChildren(state.phase),
      new ElementBuilder(state.phase === 0 ? "h2" : "h2<StructOnly>").setChildren("Greetings! Always give the same return!"),
      new ElementBuilder(state.phase === 0 ? "button" : "button<StructOnly>")
        .setAttributes({ type: "button" })
        .setChildren("UPDATE")
        .setEvent("click", function () {
          setState({
            phase: state.phase + 1
          });
        })
    ]);
  });
}());