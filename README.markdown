Fossil View
===========

A set of [Backbone](http://backbonejs.org) base views to speed up
developments.

This library can be used as a **standalone component** or as part of a `Fossil`
project.

This package provides the following:

* A **Collection View** is used to render a collection of model. Design an item
  view and you're done!
* A **Region Manager** is used to split a layout into several smaller views.

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

From now on, it is possible to quire the whole Fossil View or only the one you
need:

``` javascript
define([
    'fossil/view/main'
], function (Views) {
    new Views.Collection();
});
```

or to use only a part:

``` javascript
define([
    'fossil/view/collection'
], function (CollectionView) {
    new CollectionView();
});
```

### Including The Whole Script

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

To run local server, use the `npm start` command.

To run the test suite, use the `grunt test` command.
