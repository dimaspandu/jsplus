new Script()
.package([
  "distribute",
  document.location.origin + "/src/providers/sidebar-menu-provider.js/<NETWORK>/SidebarMenuProvider.script",
  document.location.origin + "/src/providers/notify-listener-provider.js/<NETWORK>/NotifyListenerProvider.script"
])
.main(function (distribute, awaitSidebarMenuProvider, awaitNotifyListenerProvider) {
  "use strict";

  const koma = new Koma({
    hostdom: document.getElementById(",")
  });

  awaitSidebarMenuProvider.sync([
    awaitNotifyListenerProvider
  ], function (SidebarMenuProvider, NotifyListenerProvider) {
    SidebarMenuProvider.build(function (state) {
      return new ElementBuilder(document.getElementById("sidebar")).setChildren([
        new ElementBuilder("h1").setChildren("DOM"),
        new ElementBuilder("ul").setChildren(
          state.list.map(list => (
            new ElementBuilder("li").setChildren([
              new ElementBuilder("h2").setChildren(list.title),
              new ElementBuilder("nav").setChildren(
                list.items.map(item => (
                  new ElementBuilder("a")
                    .setAttributes({
                      class: item.path === state.activePath ? "active" : false,
                      href: `#${item.path}`
                    })
                    .setChildren(item.text)
                    .setEvent("click", e => {
                      e.preventDefault();
                      koma.navigatePush(item.path);
                    })
                ))
              )
            ])
          ))
        )
      ]);
    });

    NotifyListenerProvider.build(function (state) {
      return new ElementBuilder(document.getElementById("notify_listener"))
        .setAttributes({ class: state.visible ? "notify-listener" : "notify-listener hidden" })
        .setChildren(
          new ElementBuilder("i").setChildren(state.message)
        );
    });
  });

  koma.reactor("/", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/basic/hello-world.js/<NETWORK>/HelloWorld.script")
        .sync(function (buildHelloWorld) {
          dispose(function snapshot () {
            buildHelloWorld(ctx);
          });
        });
    });
  });

  koma.reactor("/stateful-component", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/reactivity/stateful-component.js/<NETWORK>/StatefulComponent.script")
        .sync(function (buildStatefulComponent) {
          dispose(function snapshot () {
            buildStatefulComponent(ctx);
          });
        });
    });
  });

  koma.reactor("/side-effects", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/reactivity/side-effects.js/<NETWORK>/SideEffects.script")
        .sync(function (buildSideEffects) {
          dispose(function snapshot () {
            buildSideEffects(ctx);
          });
        });
    });
  });

  koma.reactor("/multiple-state", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/reactivity/multiple-state.js/<NETWORK>/MultipleState.script")
        .sync(function (buildMultipleState) {
          dispose(function snapshot () {
            buildMultipleState(ctx);
          });
        });
    });
  });

  koma.reactor("/element-future", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/work-asynchronously/element-future.js/<NETWORK>/ElementFuture.script")
        .sync(function (buildElementFuture) {
          dispose(function snapshot () {
            buildElementFuture(ctx);
          });
        });
    });
  });

  koma.reactor("/next-element-future", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/work-asynchronously/next-element-future.js/<NETWORK>/NextElementFuture.script")
        .sync(function (buildNextElementFuture) {
          dispose(function snapshot () {
            buildNextElementFuture(ctx);
          });
        });
    });
  });

  koma.reactor("/full-hydration", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/hydration/full-hydration.js/<NETWORK>/FullHydration.script")
        .sync(function (buildFullHydration) {
          dispose(function snapshot () {
            buildFullHydration(ctx);
          });
        });
    });
  });

  koma.reactor("/lazy-hydration", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/hydration/lazy-hydration.js/<NETWORK>/LazyHydration.script")
        .sync(function (buildLazyHydration) {
          dispose(function snapshot () {
            buildLazyHydration(ctx);
          });
        });
    });
  });

  koma.reactor("/element-builder-struct-only", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/optimization/element-builder-struct-only.js/<NETWORK>/ElementBuilderStructOnly.script")
        .sync(function (buildElementBuilderStructOnly) {
          dispose(function snapshot () {
            buildElementBuilderStructOnly(ctx);
          });
        });
    });
  });

  koma.reactor("/element-builder-only", function (ctx) {
    ctx.builder.future(function (dispose) {
      distribute(document.location.origin + "/src/reactor/optimization/element-builder-only.js/<NETWORK>/ElementBuilderOnly.script")
        .sync(function (buildElementBuilderOnly) {
          dispose(function snapshot () {
            buildElementBuilderOnly(ctx);
          });
        });
    });
  });

  koma.err(function (ctx) {
    console.error("404");

    ctx.container = new ElementBuilder("section")
      .setAttributes({ class: "reactor error-reactor" })
      .setChildren([
        new ElementBuilder("h1").setChildren("Page not found"),
        new ElementBuilder("button")
          .setAttributes({ class: "navigator" })
          .setChildren("Back to previous page!")
          .setEvent("click", function () {
            window.history.back();
          })
      ])
      .node;
  });

  koma.addNotifier("transition", function () {
    awaitNotifyListenerProvider.sync(function (NotifyListenerProvider) {
      NotifyListenerProvider.setState({
        message: "Wait a moment...",
        visible: true
      });
    });
  });

  koma.tap();
});