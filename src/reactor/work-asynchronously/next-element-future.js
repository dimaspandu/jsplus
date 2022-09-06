new Script()
.registry("NextElementFuture.script")
.package([
  document.location.origin + "/src/providers/sidebar-menu-provider.js/<NETWORK>/SidebarMenuProvider.script",
  document.location.origin + "/src/providers/notify-listener-provider.js/<NETWORK>/NotifyListenerProvider.script"
])
.main(function (awaitSidebarMenuProvider, awaitNotifyListenerProvider) {
  "use strict";

  return function (ctx) {
    ctx.container = new ElementBuilder("section")
      .setAttributes({ class: "reactor next-element-future-reactor" })
      .setChildren([
        new ElementBuilder("iframe").setAttributes({ src: "src/pages/next-element-future/" }),
        new ElementBuilder("a")
          .setAttributes({
            class: "navigator",
            href: "src/pages/next-element-future/",
            target: "_blank"
          })
          .setChildren("Go to iframe!")
      ])
      .node;

    ctx.onMeet.set = function () {
      document.title = "DOM - Next Element Future";

      awaitSidebarMenuProvider.sync(function (SidebarMenuProvider) {
        SidebarMenuProvider.setState({
          activePath: "/next-element-future"
        });
      });

      awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
        NotifyListenerProvider.setState({ visible: false });
      });
    };
  }
});
