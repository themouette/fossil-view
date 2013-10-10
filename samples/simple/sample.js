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
        "fossil/view": "../../src"
    },
    shim: {
        'underscore': { exports: '_' },
        'backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone' },
        'jquery.color': { deps: ['jquery'], exports: '$' }
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
    'data',
    'jquery.color'
], function (canvasTpl, $, _, Backbone, View, RegionManager, UserCollection, Sidebar, MainPanel, data) {

    // to ensure templates are rendered using data.
    View.prototype.renderHtml = function (data) {
        return this.template(data);
    };

    var layout = new RegionManager({
        regions: {
            "content": ".content",
            "sidebar": ".sidebar"
        },
        template: canvasTpl
    });

    var users = new UserCollection(data.users);
    var CollectionView = new MainPanel({collection: users, recycle: true});
    layout.registerView(new Sidebar({collection: users}), 'sidebar');
    layout.registerView(CollectionView, 'content');
    // event broker for views to communicate
    Backbone.on('canvas:render', function () {
        layout
            .render()
            .$el.animate({
                    'backgroundColor': '#43e'
                }).animate({
                    'backgroundColor': 'transparent'
                });
    });
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
    Backbone.on('app:show:item', function (item) {
        layout.registerView(new View({template: _.template("item")}), 'content');
    });
    Backbone.on('app:show:list', function () {
        layout.registerView(CollectionView, 'content');
    });
    layout.setElement('body').render();
});
