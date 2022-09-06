# JS+ (JS Plus)

## _Heal your legacy code_

DEMO:
[JS+]: <https://js-plus.netlify.app/>

JSPlus is a low level javascript library, it's just vanilla js with slight API improvements and changes to how to use it

- Mindset to create your own script
- A concept to go back to plain js
- Is in between vanilla js and jQuery => react/vue/angular
- Intended to work well in browser environments
- More comfortable way to use
- Anti bundler/node_modules wanna be
- Sharing scripts over the network

## Sample (Experiment)

Here's a list of prototypes with jsplus concepts:

- [DOM] - JSPlus for the DOM!
- [Scope/Module] - JSPlus for the Modular! (On Development)

## DOM

Check the teaser of the DOM.

| VanillaJS | JS+ |
| ------ | ------ |
| document.createElement("div") | new ElementBuilder("div") |
| Element.appendChild(node) | Element.setChildren(ElementBuilder) |
| Element.innerHTML = "<h1>Hello World!</h1>" | Element.setChildren(new ElementBuilder("h1").setChildren("Hello World!")) |
| Element.innerText = "Hello World" | Element.setChildren("Hello World!") |
| Element.setAttribute("class", "counter") | Element.setAttributes({ class: "counter" }) |
| Element.style.backgroundColor = "red" | Element.setStyles({ backgroundColor: "red" }) |
| Element.onclick = function (e) {} | Element.setEvent("click", function (e) {}) |
| Element.addEventListener("click", function (e) {}) | Element.setEvent("click", function (e) {}) |
| Element.appendChild(node); Element.appendChild(node); Element.appendChild(node); | Element.appendChildren([new ElementBuilder, new ElementBuilder, new ElementBuilder]) |
| Element.prependChild(node); Element.prependChild(node); Element.prependChild(node); | Element.prependChildren([new ElementBuilder, new ElementBuilder, new ElementBuilder]) |

## What's the advantage?

#### Consistency API:
Only one method to create/update children of nodes with different types

```sh
const Greetings = new ElementBuilder("div"); // create element

Greetings.setChildren("It Works!"); // create children (string)
Greetings.setChildren("Update!"); // update children (string again)
Greetings.setChildren([
  new ElementBuilder("h1").setChildren("Hello,"),
  new ElementBuilder("h1").setChildren("Welcome to the JSPlus!")
]); // update children (different types)
```

#### Also applies to properties:

```sh
const Greetings = new ElementBuilder("div"); // create element

Greetings.setAttributes({ class: "greetings" }); // create attributes
Greetings.setAttributes({ class: "greetings greetings--active" }); // update attributes
Greetings.setAttributes({ class: false }); // update/remove/cancel attributes

Greetings.setStyles({
  backgroundColor: "aqua",
  fontStyle: "italic"
}); // create styles
Greetings.setStyles({
  backgroundColor: false,
  fontStyle: false
}); // upate/remove/cancel styles
Greetings.setStyles({
  backgroundColor: "#e4f2ff",
  borderLeft: "solid 3px #2596ff",
  padding: "1rem"
}); // update styles

Greetings.setEvent("click", function () {
  alert("Hello!");
}); // create event
Greetings.setEvent("click", function () {
  alert("Welcome!");
}); // update event existing
Greetings.setEvent("mouseover", function () {
  alert("It Works!");
}); // update event (add/new)
```

#### Writing represents tree structure/tree chain:
A more convenient way to write components

Using vanilla js
```sh
const Greetings = document.createElement("div");
const H1 = document.createElement("h1");
const P = document.createElement("p");

H1.innerText = "Hello,";
P.innerHTML = "<i>Welcome to JSPlus!</i>";

Greetings.appendChild(H1);
Greetings.appendChild(P);
document.getElementById("test").appendChild(Greetings);
```

Using js+
```sh
new ElementBuilder(document.getElementById("test")).setChildren([
  new ElementBuilder("h1").setChildren("Hello,"),
  new ElementBuilder("p").setChildren(
    new ElementBuilder("i").setChildren("Welcome to JSPlus!")
  )
]);
```

#### UPDATE ONLY WHAT CHANGED:
The setChildren method is works like replaceChild. Nevertheless, only the different child will be remount (like another modern ui library)

```sh
let queue = 0;
let CounterElement;

const CounterChildrenElement = function () {
  return [
    new ElementBuilder("i").setChildren("The queue is "),
    queue,
    new ElementBuilder("span")
      .setStyles({
          fontSize: "0.75rem",
          position: "absolute",
          right: "0",
          top: "-0.5rem"
      })
      .setChildren("I will not remount!")
  ];
};

new ElementBuilder(document.getElementById("test")).setChildren([
  CounterElement = new ElementBuilder("h1") // assign CounterElement
    .setStyles({
        position: "relative",
        margin: "1rem 0",
        width: "fit-content"
    })
    .setChildren(CounterChildrenElement()),
  new ElementBuilder("button")
      .setAttributes({ type: "button" })
      .setChildren("+")
      .setEvent("click", function () {
          // increment the queue
          queue++;
          // update the CounterElement children
          CounterElement.setChildren(CounterChildrenElement()); 
      })
]);
```

looks hard to implement? Make the component stateful!

#### STATEFUL COMPONENT:
Here's the previous code that has become stateful

```sh
new StatefulComponent({
    count: 0
}) // declare stateful component
.build(function (state, setState) { // args (state, setState, setStateEffect)
    return new ElementBuilder(document.getElementById("test")).setChildren([
      new ElementBuilder("h1")
        .setStyles({
          position: "relative",
          margin: "1rem 0",
          width: "fit-content"
        })
        .setChildren([
          new ElementBuilder("i").setChildren("The queue is "),
          state.count,
          new ElementBuilder("span")
            .setStyles({
                fontSize: "0.75rem",
                position: "absolute",
                right: "0",
                top: "-0.5rem"
            })
            .setChildren("I will not remount!")
        ]),
      new ElementBuilder("button")
        .setAttributes({ type: "button" })
        .setChildren("+")
        .setEvent("click", function () {
          setState({
            count: state.count + 1
          }); // use setState for update state
        })
    ]);
});
```

Another example of a stateful component that has used the setStateEffect. setStateEffect provides a way to update state to make it more assignable.

This is useful for states with deep object structures.

```sh
new StatefulComponent({
    data: {
      count: 0,
      theme: "light"
    }
})
.build(function (state, _, setStateEffect) {
    const handleClick = function () {
        setStateEffect(function () {
            state.data.count = state.data.count + 1; // direct assignment
            
            if ((state.data.count % 2) === 0) {
                state.data.theme = "light";  // direct assignment
            } else {
                state.data.theme = "dark"; // direct assignment
            }
        });
    };
    
    return new ElementBuilder(document.getElementById("test"))
        .setStyles({
            backgroundColor: state.data.theme === "light" ? "#f4f4f4" : "#333333",
            color: state.data.theme === "light" ? "#000000" : "#f4f4f4",
            padding: "1rem"
        })
        .setChildren([
            new ElementBuilder("h1")
                .setStyles({
                    position: "relative",
                    margin: "1rem 0",
                    width: "fit-content"
                })
                .setChildren([
                    new ElementBuilder("i").setChildren("The queue is "),
                    state.data.count,
                    new ElementBuilder("span")
                        .setStyles({
                            fontSize: "0.75rem",
                            position: "absolute",
                            right: "0",
                            top: "-0.5rem"
                        })
                        .setChildren("I will not remount!")
                ]),
            new ElementBuilder("button")
                .setAttributes({ type: "button" })
                .setChildren("+")
                .setEvent("click", handleClick)
        ]);
});
```

#### ACROSS&/MULTIPLE STATEFUL COMPONENT:
No longer worry about traversing components with isolated states

```sh
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
    
    // update state use setStateEffect prototype
    GreetingsProvider.setStateEffect(function (state) {
        state.title = "It Works!";
        state.subtitle = "Welcome to JSPlus!";
    });
    
    // update state while checking state in other components
    ThemeProvider.setStateEffect(function (state) {
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

new ElementBuilder(document.getElementById("test")).setChildren([
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
```

#### Work asynchronously

Sometimes the UI depends on something(args, params, etc) that isn't ready. For this case we can use the ElementFuture constructor.

ElementFuture:
create element builder asynchronously (wait/watch/render)

```sh
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
                    "it’s just vanilla js with slight API ",
                    "improvements and changes to how to use it"
                ]);
        });
    }, 1400); // loaded and rendered after 1400 ms
};

new ElementBuilder(document.getElementById("test")).setChildren([
    new ElementBuilder("span")
        .setChildren("I'm not asynchronous :D"),
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
```

ElementFuture will be cached, so the process loading only works once. Set a threshold if we want our component to reload again on a certain loop.

```sh
new StatefulComponent({
    count: 0
}).build(function (state, setState) {
    return new ElementBuilder(document.getElementById("test")).setChildren([
        new ElementBuilder("h1").setChildren(state.count),
        new ElementFuture({
            id: "kmkwat78BB",
            thresholds: 10, // every 10 clicks the element will be reloaded again
            loader: function () {
              return new ElementBuilder("p").setChildren(
                new ElementBuilder("i")
                  .setStyles({
                    backgroundColor: false,
                    color: false
                  })
                  .setChildren("Just a moment...")
              );
            },
            builder: function (dispose) {
              setTimeout(function () {
                dispose(function snapshot () {
                  return new ElementBuilder("p").setChildren(`Hello World!`);
                });
              }, 1500);
            },
            catcher: function (error) {
              return new ElementBuilder("p").setChildren(
                new ElementBuilder("i")
                  .setStyles(error.styles)
                  .setChildren(`[${error.name}]: ${error.message}`)
              );
            }
        }),
        new ElementBuilder("button")
            .setAttributes({ type: "button" })
            .setChildren("+")
            .setEvent("click", function () {
                setState({
                    count: state.count + 1
                });
            })
    ]);
});
```

## Hydration

Hydrate static html (HTML from server) with ElementBuilder so that it becomes more dynamic

For example we have HTML from server like this:
```sh
<section id="testimonials">
    <h1>Testimonials!</h1>
    <div>
        <p>Hello!</p>
        <p>Welcome!</p>
        <p>Testing!</p>
    </div>
    <textarea placeholder="Give a Testimonial..."></textarea>
    <br />
    <button type="button">SEND</button>
</section>
```

Hydrate with this one (We will use StatefulComponent to make it easier)
```sh
new StatefulComponent({
    items: [
        "Hello!",
        "Welcome!",
        "Testing!"
    ],
    payload: ""
}).build(function (state, setState, setStateEffect) {
    return new ElementBuilder(document.getElementById("testimonials")).setChildren([
        new ElementBuilder("h1").setChildren("Testimonials!"),
        new ElementBuilder("div").setChildren(
            state.items.map(function (item) {
                return new ElementBuilder("p").setChildren(item);
            })
        ),
        new ElementBuilder("textarea")
            .setAttributes({
                placeholder: "Give a Testimonial...",
                value: state.payload
            })
            .setEvent("input", function (e) {
                setState({
                    payload: e.target.value
                });
            }),
        new ElementBuilder("br"),
        new ElementBuilder("button")
            .setAttributes({ type: "button" })
            .setChildren("SEND")
            .setEvent("click", function () {
                setStateEffect(function () {
                    state.items.unshift(state.payload);
                    state.payload = "";
                });
            })
    ]);
});
```

if you feel lazy to write all child elements exactly the same, just give id/selector and do the designation and adjustment (DOM synchronization)

for example (HTML)
```sh
<section id="testimonials">
    <hgroup>
        <h1>Testimonials!</h1>
        <h2>Please give feedback for this code!</h2>
    </hgroup>
    <div>
        <p>Hello!</p>
        <p>Welcome!</p>
        <p>Testing!</p>
    </div>
    <textarea id="message_field" placeholder="Write your message..."></textarea>
    <br />
    <button type="button">SEND</button>
</section>
```

and the hydration
```sh
new StatefulComponent({
    items: [
        "Hello!",
        "Welcome!",
        "Testing!"
    ],
    payload: ""
}).build(function (state, setState, setStateEffect) {
    return new ElementBuilder(document.getElementById("testimonials")).setChildren([
        new ElementBuilder(document.querySelector("hgroup")), // use querySelector
        new ElementBuilder("div").setChildren(
            state.items.map(function (item) {
                return new ElementBuilder("p").setChildren(item);
            })
        ),
        new ElementBuilder(document.getElementById("message_field")) // use getElementById
            .setAttributes({ value: state.payload }) // just add value
            .setEvent("input", function (e) {
                setState({ payload: e.target.value });
            }),
        new ElementBuilder("br"),
        new ElementBuilder(document.querySelector("button")) //use querySelector
            .setEvent("click", function () { // just add event
                setStateEffect(function () {
                    state.items.unshift(state.payload);
                    state.payload = "";
                });
            })
    ]);
});
```

## Optimization

A little notice, every time we instantiate ElementBuilder it will create node and struct objects like this:
```sh
node: HTMLDOMElements

struct {
    selector: String | HTMLDOMElements,
    attributes: Object,
    styles: Object,
    children: Array,
    events: Object
}
```

So when we create an ElementBuilder instance, the node object will always create a new element using the document.createElement API. This will be a problem especially when we update the children using .setChildren even though the result is the same (every createElement will cost and a lot of useless DOM is in memory). While all elements only need a struct object as a comparison object. For this we can outsmart it with ElementBuilderOnly like this:

```sh
new StatefulComponent({ phase: 0 }).build(function (state, setState) {
    let Builder = state.phase === 0 ? ElementBuilder : ElementBuilderOnly;
    
    return new ElementBuilder(document.getElementById("test")).setChildren([
        new ElementBuilder("h1").setChildren(state.phase),
        new Builder("h2").setChildren("Greetings! Always give the same return!"),
        new Builder("button")
            .setAttributes({ type: "button" })
            .setChildren("UPDATE")
            .setEvent("click", function () {
                setState({
                    phase: state.phase + 1
                });
            })
    ]);
});
```

Tetapi perhatikan bahwa Anda harus memuat elemen-builder-only.js dan ini menambah resource sehingga daripada Anda melakukan itu, cara yang lebih sederhana cukup gunakan tipe generik <StructOnly> dalam contoh pemilih seperti ini:

```sh
new StatefulComponent({ phase: 0 }).build(function (state, setState) {
    return new ElementBuilder(document.getElementById("app")).setChildren([
        new ElementBuilder("h1").setChildren(state.phase),
        new ElementBuilder(state.phase === 0 ? "h2" : "h2<StructOnly>") // simpler
            .setChildren("Greetings! Always give the same return!"),
        new ElementBuilder(state.phase === 0 ? "button" : "button<StructOnly>") // simpler
            .setAttributes({ type: "button" })
            .setChildren("UPDATE")
            .setEvent("click", function () {
                setState({
                    phase: state.phase + 1
                });
            })
    ]);
  });
```

DEMO:
[JS+]: <https://js-plus.netlify.app/>

## License

MIT

**Free Software, Hell Yeah!**
   