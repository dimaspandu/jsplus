new Script()
.registry("NotifyListenerProvider.script")
.main(function () {
  "use strict";

  return new StatefulComponent({
    message: "",
    visible: false
  });
});