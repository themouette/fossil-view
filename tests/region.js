define([
    'fossil/view/regionManager',
    'backbone'
], function (RegionManager, Backbone) {
    module('RegionManager');

    test('RegionManager manager can be instanciated', function () {
        expect(1);
        new RegionManager();
        ok(true);
    });

    test('defineRegion view parameter is optional', function () {
        expect(1);
        var region = new RegionManager();
        region.defineRegion('main', 'section');
        equal(_.size(region.regions), 1);
    });

    test('defineRegion view parameter is accepted', function () {
        expect(2);
        var region = new RegionManager();
        var subview = new Backbone.View();
        region.defineRegion('main', 'section', subview);

        deepEqual(region.regions, { main: 'section' });
        deepEqual(region.subviews, { main: subview });
    });

    test('defineRegion accepts object', function () {
        expect(1);
        var region = new RegionManager();
        region.defineRegion({
            header: 'header',
            footer: 'footer',
            main: 'section'
        });
        equal(_.size(region.regions), 3);
    });

    test('defineRegion accepts view list', function () {
        expect(2);
        var region = new RegionManager();

        region.defineRegion({
                header: 'header',
                footer: 'footer',
                main: 'section'
            }, {
                footer: new Backbone.View(),
                header: new Backbone.View(),
                main: new Backbone.View()
            });
        equal(_.size(region.regions), 3);
        equal(_.size(region.subviews), 3);
    });

    test('render happens views to region\'s selector', function () {
        expect(1);
        var Subview = Backbone.View.extend({
            render: function () {
                this.$el.html(this.options.content);
            }
        });
        var region = new RegionManager();
        region.defineRegion({
                header: 'header',
                footer: 'footer',
                main: 'section'
            }, {
                footer: new Subview({content:"footer"}),
                header: new Subview({content:"header"}),
                main: new Subview({content:"main"})
        });
        region.template = function () {
            return '<header></header><section></section><footer></footer>';
        };
        region.render();

        equal(region.$el.html(), '<header><div>header</div></header><section><div>main</div></section><footer><div>footer</div></footer>');
    });

    test('render happens views to region\'s selector only once', function () {
        expect(1);
        var Subview = Backbone.View.extend({
            render: function () {
                this.$el.html(this.options.content);
            }
        });
        var region = new RegionManager();
        region.defineRegion({
                header: 'header',
                footer: 'footer',
                main: 'section'
            }, {
                footer: new Subview({content:"footer"}),
                header: new Subview({content:"header"}),
                main: new Subview({content:"main"})
        });
        region.template = function () {
            return '<header></header><section></section><footer></footer>';
        };

        region.render();
        region.render();
        equal(region.$el.html(), '<header><div>header</div></header><section><div>main</div></section><footer><div>footer</div></footer>');
    });

    test('replacing a view happens views to region\'s selector only once', function () {
        expect(1);
        var Subview = Backbone.View.extend({
            render: function () {
                this.$el.html(this.options.content);
            }
        });
        var region = new RegionManager();
        region.defineRegion({
                header: 'header',
                footer: 'footer',
                main: 'section'
            }, {
                footer: new Subview({content:"footer"}),
                header: new Subview({content:"header"}),
                main: new Subview({content:"main"})
        });
        region.template = function () {
            return '<header></header><section></section><footer></footer>';
        };

        region.render();
        region.registerView(new Subview({content:"header2"}), "header");

        equal(region.$el.html(), '<header><div>header2</div></header><section><div>main</div></section><footer><div>footer</div></footer>');
    });

    test('view is not required when rendering', function () {
        expect(1);
        var region = new RegionManager();
        region.defineRegion({
            header: 'header',
            footer: 'footer',
            main: 'section'
        });
        region.template = function () {
            return '<header></header><section></section><footer></footer>';
        };

        region.render();
        equal(region.$el.html(), '<header></header><section></section><footer></footer>');
    });

    test('A region is required to render a view', function () {
        expect(1);
        var region = new RegionManager();
        region.defineRegion({
            main: 'section'
        }, {
            footer: new Backbone.View(),
            header: new Backbone.View(),
            main: new Backbone.View()
        });
        region.template = function () {
            return '<header></header><section></section><footer></footer>';
        };

        throws(region.render);
    });
});
