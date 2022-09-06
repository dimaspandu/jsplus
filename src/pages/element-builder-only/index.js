(function () {
  "use strict";
  
  new StatefulComponent({ phase: 0 }).build(function (state, setState) {
    let Builder = state.phase === 0 ? ElementBuilder : ElementBuilderOnly;
    
    return new ElementBuilder(document.getElementById("app")).setChildren([
      new ElementBuilder("h1").setChildren(state.phase),
      new Builder("h2").setChildren("Greetings! Always give the same return!"),
      new Builder("button")
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