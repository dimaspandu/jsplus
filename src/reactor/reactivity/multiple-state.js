new Script()
.registry("MultipleState.script")
.package([
  document.location.origin + "/src/providers/sidebar-menu-provider.js/<NETWORK>/SidebarMenuProvider.script",
  document.location.origin + "/src/providers/notify-listener-provider.js/<NETWORK>/NotifyListenerProvider.script"
])
.main(function (awaitSidebarMenuProvider, awaitNotifyListenerProvider) {
  "use strict";

  return function (ctx) {
    ctx.container = new ElementBuilder("section")
      .setAttributes({ class: "reactor multiple-state-reactor" })
      .setChildren([
        new ElementBuilder("iframe").setAttributes({ src: "src/pages/multiple-state/" }),
        new ElementBuilder("a")
          .setAttributes({
            class: "navigator",
            href: "src/pages/multiple-state/",
            target: "_blank"
          })
          .setChildren("Go to iframe!")
      ])
      .node;

    ctx.onArrive.set = function () {
      alert("[onArrive]: Welcome!");
    };

    ctx.onMeet.set = function () {
      document.title = "DOM - Multiple State";

      awaitSidebarMenuProvider.sync(function (SidebarMenuProvider) {
        SidebarMenuProvider.setState({
          activePath: "/multiple-state"
        });
      });

      awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
        NotifyListenerProvider.setState({ visible: false });
      });
    };
  }
});