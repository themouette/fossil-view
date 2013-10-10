Fossil View
===========

A set of [Backbone](http://backbonejs.org) base views to speed up
developments.

[![Build
Status](https://travis-ci.org/themouette/fossil-view.png?branch=master)](https://travis-ci.org/themouette/fossil-view)

This library can be used as a **standalone component** or as part of a `Fossil`
project.

This package provides the following:

* A **Collection View** is used to render a collection of model. Design an item
  view and you're done!
* A **Region Manager** is used to split a layout into several smaller views.

View The Samples
----------------

* [Non amd](http://themouette.github.io/fossil-view/samples/nonAmd/index.html)
* [A simple layout with a collection](http://themouette.github.io/fossil-view/samples/simple/index.html)

* [Test suite](http://themouette.github.io/fossil-view/tests/test.html)

Sample Code
-----------

### A Simple Layout

``` javascript
var canvas = new Fossil.Views.RegionManager({
    regions: {
        content: ".content",
        sidebar: ".sidebar",
        menubar: "nav.menu",
        footer: "footer"
    },
    // `template` can either be a function or a string.
    // if `template` is a function, then it is called in view context.
    template: function () {
        return [
            '<nav class="menu"></nav>',
            '<section class="sidebar"></section>',
            '<section class="content"></section>',
            '<footer></footer>'
        ].join('');
    }
});

canvas.registerView(new Backbone.View(), "menu");
canvas.registerView(new Backbone.View(), "sidebar");
canvas.registerView(new Backbone.View(), "content");
canvas.registerView(new Backbone.View(), "footer");

// remove a view
canvas.removeView("footer");

canvas.setElement('body').render();

// Changing a subview is easy
canvas.registerView(new Backbone.View(), "content");
```

### Using Collection Views


``` javascript
// use a model collection to manage items
var users = new Backbone.Collection();

var userList = new Fossil.Views.Collection({
    tagName: 'ul',
    collection: users,
    // create a view for your items
    itemView: Backbone.View.extend({
        render: function () {
            this.$el.html(this.model.get('name'));
            return this;
        }
    })
});

userList.render().$el.appendTo('body');

users.add([
    {name: "Joe"},
    {name: "Kevin"},
    {name: "Steeve"}
]);

// you can specify an index
users.add({name: "Walter"}, {at: 1});
```

### Recycling

If a view has the `recycle` property set to `true`, then `CompositeView` will
just detach it instead of removing it, and it will not be rerendered as long as
`_rendered` property is `true`.

Recycling aims at view reuse, so it is the developer's responsability to clear
the view (using `remove(force)` in case of a fossil view). **Use it with care**

### Define rendering

A view renders string property `template` into it's element.
Following hooks can be used to override default behavior:

* `precompile(template)`: called on every render, to ensure template is always
  processed;
* `getViewData()`: compile data to provide to template;
* `renderHtml(data[, helpers...])`: render template;
* `onRendered()`: called when element is populated;
* `attachPlugins`: called only if view element is attached to the DOM. This
  should be used to attache jQuery widgets.
* `detachPlugins` is a hook method for you to destroy jquery plugin or any
  behavior set up in `attachPlugins`.  *Note* that it will require you to call
  `attachPlugins` manualy when the view will be attached again.

### Attach and detach plugins

Some stuff should be done only after element is attached to the DOM.
`attachPlugins` is triggered only when view is attached to the DOM, and
forwarded through every Composite view. This means 2 things:

* if you use Composite views, when you attach the top one, all subviews will
  call it's `attachPlugins`.
* If you attach the view to the DOM after rendering, you will need to call it
  manually.

Note that `detachPlugins` is always called automaticly.

Installation
------------

##### Using `bower`

    bower install themouette/fossil-view

##### Using `git`

    $ git clone git://github.com/themouette/fossil-view.git
    $ npm install


Include Fossil View In Your Project
-----------------------------------

### Using AMD

First, ensure you have `backbone` and `underscore` in your shim definition, then
set the `fossil/view` path:

``` javascript
require.config({
    paths: {
        'fossil/view': 'path/to/fossil-view/src'
    },
    shim: {
        'backbone': {deps: ['jquery', 'underscore'], exports: 'Backbone'},
        'underscore': {exports: '_'}
    }
});
```

From now on, it is possible to require only the view you need:

``` javascript
define([
    'fossil/view/collection'
], function (CollectionView) {
    new CollectionView();
});
```

### Including The standalone Script

In your HTML, just incude the generated script:

``` javascript
<html>
    <head>
        <script src="path/to/fossil-view/fossil-view.js" type="text/javascript"></script>
        <script type="javascript">
            new Fossil.Views.Collection();
        </script>
    </head>
    <body>
    </body>
</html>
```

Contributing
------------

To run local server, use the `grunt dev` command.

To run the test suite, use the `grunt test` command.
