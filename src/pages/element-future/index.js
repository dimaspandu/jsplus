(function () {
  "use strict";
  
  const AsyncTitle = function (dispose) {
    setTimeout(function () {
      dispose(function snapshot () {
        return new ElementBuilder("div").setChildren(
          new ElementBuilder("h1").setChildren("JSPlus!")
        );
      });
    }, 700); // loaded and rendered after 700 ms
  };

  const AsyncSummary = function (dispose) {
    setTimeout(function () {
      dispose(function snapshot () {
        return new ElementBuilder("summary")
          .setStyles({ fontStyle: false })
          .setChildren([
              "JSPlus is a low level javascript library, ",
              "it's just vanilla js with slight API ",
              "improvements and changes to how to use it"
          ]);
      });
    }, 1400); // loaded and rendered after 1400 ms
  };

  new ElementBuilder(document.getElementById("app")).setChildren([
    new ElementBuilder("span").setChildren("I'm not asynchronous :D"),
    new ElementFuture({
      id: "a10", // must unique
      builder: AsyncTitle
    }), // asynchronous
    new ElementFuture({
      id: "nd3", // must unique
      loader: function () {
        return new ElementBuilder("summary")
          .setStyles({ fontStyle: "italic" })
          .setChildren("Loading...");
      },
      builder: AsyncSummary
    }), // asynchronous with loader/skeleton
    new ElementFuture({
      id: "k11", // must unique
      loader: function () {
        return new ElementBuilder("p")
          .setStyles({ fontStyle: "italic" })
          .setChildren("Loading...");
      },
      catcher: function (e) {
        return new ElementBuilder("p")
          .setStyles({
            backgroundColor: "red",
            color: "orange",
            fontStyle: "italic"
          })
          .setChildren(e.message);
      },
      builder: function (dispose) {
        setTimeout(function () {
          dispose(function snapshot () {
            return new ElementBuilder("p")
              .setStyles({ fontStyle: "italic" })
              .setChildren(Something);
          });
        }, 2100);
      }
    }) // asynchronous with loader/skeleton and catcher
  ]);
}());