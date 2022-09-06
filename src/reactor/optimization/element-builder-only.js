const ElementBuilderOnlyScript = new Script();

ElementBuilderOnlyScript.registry("ElementBuilderOnly.script");

ElementBuilderOnlyScript.package([
  document.location.origin + "/src/providers/sidebar-menu-provider.js/<NETWORK>/SidebarMenuProvider.script",
  document.location.origin + "/src/providers/notify-listener-provider.js/<NETWORK>/NotifyListenerProvider.script"
]);

ElementBuilderOnlyScript.main(function (awaitSidebarMenuProvider, awaitNotifyListenerProvider) {
  "use strict";

  return function (ctx) {
    ctx.container = new ElementBuilder("section")
      .setAttributes({ class: "reactor element-builder-only-reactor" })
      .setChildren([
        new ElementBuilder("iframe").setAttributes({ src: "src/pages/element-builder-only/" }),
        new ElementBuilder("a")
          .setAttributes({
            class: "navigator",
            href: "src/pages/element-builder-only/",
            target: "_blank"
          })
          .setChildren("Go to iframe!")
      ])
      .node;

    ctx.onMeet.set = function () {
      document.title = "DOM - Element Builder Only";

      awaitSidebarMenuProvider.sync(function (SidebarMenuProvider) {
        SidebarMenuProvider.setState({
          activePath: "/element-builder-only"
        });
      });

      awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
        NotifyListenerProvider.setState({ visible: false });
      });
    };
  }
});
