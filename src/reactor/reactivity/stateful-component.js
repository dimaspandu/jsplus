new Script()
.registry("StatefulComponent.script")
.package([
  document.location.origin + "/src/providers/sidebar-menu-provider.js/<NETWORK>/SidebarMenuProvider.script",
  document.location.origin + "/src/providers/notify-listener-provider.js/<NETWORK>/NotifyListenerProvider.script"
])
.main(function (awaitSidebarMenuProvider, awaitNotifyListenerProvider) {
  "use strict";

  return function (ctx) {
    ctx.container = new ElementBuilder("section")
      .setAttributes({ class: "reactor stateful-component-reactor" })
      .setChildren([
        new ElementBuilder("iframe").setAttributes({ src: "src/pages/stateful-component/" }),
        new ElementBuilder("a")
          .setAttributes({
            class: "navigator",
            href: "src/pages/stateful-component/",
            target: "_blank"
          })
          .setChildren("Go to iframe!")
      ])
      .node;

    ctx.onMeet.set = function () {
      document.title = "DOM - Stateful Component";

      awaitSidebarMenuProvider.sync(function (SidebarMenuProvider) {
        SidebarMenuProvider.setState({
          activePath: "/stateful-component"
        });
      });

      awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
        NotifyListenerProvider.setState({ visible: false });
      });
    };

    ctx.onExit.delay = 1500;

    ctx.onExit.set = function () {
      awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
        NotifyListenerProvider.setState({
          message: "Just a moment... See ya!",
          visible: true
        });
      });
    };
  }
});