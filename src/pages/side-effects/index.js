(function () {
  "use strict";
  
  new StatefulComponent({
    data: {
      count: 0,
      theme: "light"
    }
  })
  .build(function (state, _, setStateEffect) {
    const handleClick = function () {
      setStateEffect(function () {
        state.data.count = state.data.count + 1; // direct assignment
        
        if ((state.data.count % 2) === 0) {
          state.data.theme = "light";  // direct assignment
        } else {
          state.data.theme = "dark"; // direct assignment
        }
      });
    };
    
    return new ElementBuilder(document.getElementById("app"))
      .setStyles({
        backgroundColor: state.data.theme === "light" ? "#f4f4f4" : "#333333",
        color: state.data.theme === "light" ? "#000000" : "#f4f4f4",
        padding: "1rem"
      })
      .setChildren([
        new ElementBuilder("h1")
          .setStyles({
            position: "relative",
            margin: "1rem 0",
            width: "fit-content"
          })
          .setChildren([
            new ElementBuilder("i").setChildren("The queue is "),
            state.data.count,
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
          .setEvent("click", handleClick)
      ]);
  });
}());