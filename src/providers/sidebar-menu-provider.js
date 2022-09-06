new Script()
.registry("SidebarMenuProvider.script")
.main(function () {
  "use strict";

  return new StatefulComponent({
    list: [
      {
        title: "Basic",
        items: [
          {
            path: "/",
            text: "Hello World"
          }
        ]
      },
      {
        title: "Reactivity",
        items: [
          {
            path: "/stateful-component",
            text: "Stateful Component"
          },
          {
            path: "/side-effects",
            text: "Set State with Effect"
          },
          {
            path: "/multiple-state",
            text: "Multiple State"
          }
        ]
      },
      {
        title: "Work Asynchronously",
        items: [
          {
            path: "/element-future",
            text: "Element Future"
          },
          {
            path: "/next-element-future",
            text: "Next Element Future"
          }
        ]
      },
      {
        title: "Hydration",
        items: [
          {
            path: "/full-hydration",
            text: "Full Hydration"
          },
          {
            path: "/lazy-hydration",
            text: "Lazy Hydration"
          }
        ]
      },
      {
        title: "Optimization",
        items: [
          {
            path: "/element-builder-struct-only",
            text: "Element Builder Struct Only"
          },
          {
            path: "/element-builder-only",
            text: "Element Builder Only"
          }
        ]
      }
    ],
    activePath: null
  });
});