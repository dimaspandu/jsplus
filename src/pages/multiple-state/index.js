(function () {
  "use strict";
  
  const CounterProvider = new StatefulComponent({ count: 0 });
  const GreetingsProvider = new StatefulComponent({
    title: "Hello,",
    subtitle: "Lorem ipsum dolor sit amet!"
  });
  const ThemeProvider = new StatefulComponent({
    backgroundColor: "#f4f4f4",
    color: "#1f1f1f"
  });

  const handleUpdate = function () {
    // update state use setState prototype
    CounterProvider.setState({
      count: CounterProvider.state.count + 1 // increment the previous state
    });
    
    // update state use setState prototype with Effect
    GreetingsProvider.setState(function (state) {
      state.title = "It Works!";
      state.subtitle = "Welcome to JSPlus!";
    });
    
    // update state while checking state in other components
    ThemeProvider.setState(function (state) {
      // check value(count) from CounterProvider
      if ((CounterProvider.state.count % 2) === 0) { 
        state.backgroundColor = "#f4f4f4";
        state.color = "#1f1f1f";
      } else {
        state.backgroundColor = "#1f1f1f";
        state.color = "#f4f4f4";
      }
    });
  };

  new ElementBuilder(document.getElementById("app")).setChildren([
    CounterProvider.build(function (state) {
      return new ElementBuilder("h1").setChildren(state.count);
    }),
    GreetingsProvider.build(function (state) {
      return new ElementBuilder("fragment").setChildren([
        new ElementBuilder("h2").setChildren(state.title),
        new ElementBuilder("p").setChildren(state.subtitle)
      ]);
    }),
    ThemeProvider.build(function (state) {
      return new ElementBuilder("div")
        .setStyles({
          border: `solid 1px ${state.color}`,
          backgroundColor: state.backgroundColor,
          color: state.color,
          padding: "1rem"
        })
        .setChildren("I rely on the theme!");
    }),
    new ElementBuilder("button")
      .setAttributes({ type: "button" })
      .setChildren("UPDATE")
      .setEvent("click", handleUpdate)
  ]);
}());