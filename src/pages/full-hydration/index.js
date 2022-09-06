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
      new ElementBuilder("h1").setChildren("Testimonials!"),
      new ElementBuilder("div").setChildren(
        state.items.map(function (item) {
          return new ElementBuilder("p").setChildren(item);
        })
      ),
      new ElementBuilder("textarea")
        .setAttributes({
          placeholder: "Give a Testimonial...",
          value: state.payload
        })
        .setEvent("input", function (e) {
          setState({
            payload: e.target.value
          });
        }),
      new ElementBuilder("br"),
      new ElementBuilder("button")
        .setAttributes({ type: "button" })
        .setChildren("SEND")
        .setEvent("click", function () {
          setStateEffect(function () {
            state.items.unshift(state.payload);
            state.payload = "";
          });
        })
    ]);
  });
}());