// public/javascripts/config.js
requirejs.config({
    // load foundation and application kernel
    baseUrl: './',
    paths: {
        "templates": "./templates",
        "jquery": "../../bower_components/jquery/jquery",
        "jquery.color": "../../bower_components/jquery-color/jquery.color",
        "underscore": "../../bower_components/underscore/underscore",
        "backbone": "../../bower_components/backbone/backbone",
        "tpl": "../../bower_components/requirejs-tpl/tpl",
        "fossil/view": "../../src",
        "jquery-ui": "http://code.jquery.com/ui/1.10.3/jquery-ui"
    },
    shim: {
        'underscore': { exports: '_' },
        'backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone' },
        'jquery.color': { deps: ['jquery'], exports: '$' },
        'jquery-ui': { deps: ['jquery'], exports: '$' }
    }
});

// as Fossil is not defined here
require([
    'tpl!templates/canvas.html',
    'jquery',
    'underscore',
    'backbone',
    'fossil/view/view',
    'fossil/view/regionManager',
    'userCollection',
    'sidebar',
    'main',
    'details',
    'data',
    'jquery.color'
], function (canvasTpl, $, _, Backbone, View, RegionManager, UserCollection, Sidebar, MainPanel, DetailsView, data) {

    // to ensure templates are rendered using data.
    View.prototype.renderHtml = function (data) {
        return this.template(data);
    };

    var layout = new RegionManager({
        regions: {
            "content": ".content",
            "sidebar": ".sidebar"
        },
        template: canvasTpl,
        attachPlugins: function () {
            var wrapper = this.$('.l-wrap').height();
            var header = this.$('.l-wrap > header').outerHeight();
            var footer = this.$('.l-wrap + footer').outerHeight();

            var availableHeight = wrapper -header - footer;
            var windowHeight = this.$(window).height() - header - footer;
            this.$('.content').height(Math.max(availableHeight, windowHeight) -10);
        }
    });

    var users = new UserCollection(data.users);

    // this view is reused for the whole application life
    // so keep a reference.
    var CollectionView = new MainPanel({
        collection: users,
        recycle: true
    });

    layout.registerView(new Sidebar({collection: users}), 'sidebar');
    layout.registerView(CollectionView, 'content');
    // Render layout
    layout.setElement('body').render();

    // event broker for views to communicate
    // below is the application logic.

    // Calls render on the wole canvas.
    // subviews events should still be delegated.
    Backbone.on('canvas:render', function () {
        layout
            .render()
            .$el.animate({
                    'backgroundColor': '#43e'
                }).animate({
                    'backgroundColor': 'transparent'
                });
    });

    // calls render on the `name` region.
    // view is rerendered and highlighted.
    Backbone.on('canvas:render:region', function (name) {
        var $el = layout.subviews[name].$el;
        layout.subviews[name]
            .render()
            .$el.animate({
                    'backgroundColor': '#43e'
                }).animate({
                    'backgroundColor': 'transparent'
                });
    });

    // Show details for given user
    Backbone.on('app:show:item', function (user) {
        // as view is not recycling, it will be destroyed
        // on remove.
        var view = new DetailsView({ model: user });

        // previous view is handled by manager.
        layout.registerView(view, 'content');
    });

    // Show list of friends
    Backbone.on('app:show:list', function () {
        // view can be reused as will as it is recycling.
        layout.registerView(CollectionView, 'content');
    });

});
