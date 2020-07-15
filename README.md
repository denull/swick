# Swick

**Swick** is a very lightweight and efficient alternative to popular UI frameworks, such as Vue, React or Angular. Conceptually it's closest to Svelte (because it operates without Virtual DOM), but it does not require any preprocessing (transpiling) of your code. It's state and event management model is similar to (and inspired by) Backbone.JS.

## Getting started

Currently the intended use is either manually import `swick.js` (or `swick.min.js`) from Swick repository, or use CDN:

```html
<script src="https://unpkg.com/swick/swick.js"></script>
```

Put this `script` tag in your page's `head` element.

*Note*. By default, **Swick does not support Internet Explorer** as it uses modern ES6 syntax. If your app still requires IE11 support, add polyfills (from `https://polyfill.io/v3/polyfill.min.js`, for example), and use compatability version: `swick-compat.js` or `swick-compat.min.js` (they are slightly larger than ES6 versions).

Now you can declare components and initialise Swick:

```html
<html>
  <head>
    <script src="https://unpkg.com/swick/swick.js"></script>
  </head>
  <body>
    <div id="app">
      <!-- Component 'a-button' instance: -->
      <div class="a-button" data-label="Hello World!"></div>
    </div>

    <div id="templates">
      <!-- Component 'a-button' template: -->
      <div class="a-button">
        <div class="a-button__label"></div>
      </div>
    </div>

    <script>
      // Declare component named 'a-button'
      const AButton = Swick.component('a-button', function(data, watch) {
        // Link 'label' property of this component to textContent of the child named 'label'
        watch(data, 'label', this.childContent.bind(this, 'label'));
      });

      // Initialise your app
      Swick.mount();
    </script>
  </body>
</html>
```

Swick uses some conventions about the way your HTML should be structured and how CSS classes should be named. It's strongly recommended to follow those rules:
* Your app should contain an element with id `templates`, with a child element per each component you will declare. Each such element must have a class with the same name as corresponding component (in kebab-case, like `a-button` in example above). Those children will be removed at page load and used to instantiate components. You may want to add a CSS rule `#templates { display: none; }` in the page head to prevent flash of those elements before the page is fully loaded. Do not use `script` tag for your `templates` element: it should contain actual DOM nodes, not just text content.
* It's recommended to have a root element with id `app`. After `Swick.mount()` call it will become the root of your application and all components will be initialised within it. Alternatively, you can pass root element to `Swick.mount()` call.
* Your components should have kebab-cased CSS classes corresponding to their names (like `a-button` above). For top-level components, the component name should always be the first class in the `class` attribute (and the second one if it's a part of another component). By convention, all component names should start with `a-` prefix (but that convention is not enforced in any way).
* All parts of your components must have CSS classes in form of `component-name__part-name`: like `a-button__label` above. This class should always be the first class in the `class` attribute (and if it's a component itself, it's name should be the second class). That part will become available on your component instance as `label` property.