(function () {
  "use strict";
  
  new StatefulComponent({
    count: 0
  }) // declare stateful component
  .build(function (state, setState) { // args (state, setState, setStateEffect)
    return new ElementBuilder(document.getElementById("app")).setChildren([
      new ElementBuilder("h1")
        .setStyles({
          position: "relative",
          margin: "1rem 0",
          width: "fit-content"
        })
        .setChildren([
          new ElementBuilder("i").setChildren("The queue is "),
          state.count,
          new ElementBuilder("span")
            .setStyles({
              fontSize: "0.75rem",
              position: "absolute",
              right: "0",
              top: "-0.5rem"
            })
            .setChildren("I will not remount!")
        ]),
      new ElementBuilder("button")
        .setAttributes({ type: "button" })
        .setChildren("+")
        .setEvent("click", function () {
          setState({
            count: state.count + 1
          }); // use setState for update state
        })
    ]);
  });
}());