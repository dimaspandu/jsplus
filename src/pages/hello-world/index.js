(function () {
  "use strict";
  
  new ElementBuilder(document.getElementById("app")).setChildren(
    new ElementBuilder("h1").setChildren("Hello World!")
  );
}());