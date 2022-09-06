(function () {
  "use strict";
  
  new StatefulComponent({
    items: [
      "Hello!",
      "Welcome!",
      "Testing!"
    ],
    payload: ""
  })
  .build(function (state, setState, setStateEffect) {
    return new ElementBuilder(document.getElementById("testimonials")).setChildren([
      new ElementBuilder(document.querySelector("hgroup")), // use querySelector
      new ElementBuilder("div").setChildren(
        state.items.map(function (item) {
          return new ElementBuilder("p").setChildren(item);
        })
      ),
      new ElementBuilder(document.getElementById("message_field")) // use getElementById
        .setAttributes({ value: state.payload }) // just add value
        .setEvent("input", function (e) {
          setState({ payload: e.target.value });
        }),
      new ElementBuilder("br"),
      new ElementBuilder(document.querySelector("button")) //use querySelector
        .setEvent("click", function () { // just add event
          setStateEffect(function () {
            state.items.unshift(state.payload);
            state.payload = "";
          });
        })
    ]);
  });
}());