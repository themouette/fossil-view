define([
    'fossil/view/composite',
    'backbone'
], function (Composite, Backbone) {
    module('Composite');

    test('Composite view can be instanciated', function() {
        new Composite({});
        ok(true, 'yeah baby');
    });

    asyncTest('invokeSubviews should invoke method for all subviews in subview context', function () {
        expect(1);
        var subview;
        var panel = new Composite({});

        var Subview = Backbone.View.extend({
            test: function (foo, bar) {
                strictEqual(this, subview);
                start();
            }
        });
        subview = new Subview();

        panel.registerView(subview);

        panel.invokeSubviews('test', 'foo', 'bar');
    });

    asyncTest('invokeSubviews should invoke method for all subviews with arguments', function () {
        expect(9);
        var _start = _.after(3, start);
        var panel = new Composite({
            query: 'anything'
        });

        var Subview = Backbone.View.extend({
            test: function (foo, bar) {
                equal(2, arguments.length);
                equal("foo", foo);
                equal("bar", bar);
                _start();
            }
        });
        var subview = new Subview();

        panel.registerView(subview)
            .registerView(subview)
            .registerView(subview);

        panel.invokeSubviews('test', 'foo', 'bar');
    });

    test('Composite view renders and happens all subviews', function() {
        expect(1);
        var panel = new Composite({});
        panel.registerView(new Backbone.View())
            .registerView(new Backbone.View())
            .registerView(new Backbone.View());

        panel.render();
        equal(panel.$('div').length, 3);
    });

    test('does not renders new registered views if not initially rendered', function() {
        expect(1);
        var panel = new Composite({});

        panel.registerView(new Backbone.View())
            .registerView(new Backbone.View())
            .registerView(new Backbone.View());

        equal(panel.$('div').length, 0);
    });

    test('renders new registered views if initially rendered', function() {
        expect(1);
        var panel = new Composite({});

        panel.render();
        panel.registerView(new Backbone.View())
            .registerView(new Backbone.View())
            .registerView(new Backbone.View());

        equal(panel.$('div').length, 3);
    });

    test('Composite view is emptied before rerendering', function() {
        expect(1);
        var panel = new Composite({});
        panel.registerView(new Backbone.View())
            .registerView(new Backbone.View())
            .registerView(new Backbone.View());

        panel.render();
        panel.render();
        equal(panel.$('div').length, 3);
    });


    asyncTest('Event delegation for view methods', function () {
        // delegateEvents is called on initialization
        // so 2 more called are made
        expect(8 + 2);
        var _start = _.after(10, start);
        var panel = new Composite({
            query: 'anything'
        });

        var Subview = Backbone.View.extend({
            render: function (foo, bar) {
                ok(true, 'render is called');
                _start();
            },
            remove: function (foo, bar) {
                ok(true, 'remove is called');
                _start();
            },
            delegateEvents: function (foo, bar) {
                ok(true, 'delegateEvents is called');
                _start();
            },
            undelegateEvents: function (foo, bar) {
                ok(true, 'undelegateEvents is called');
                _start();
            }
        });

        panel.registerView(new Subview())
            .registerView(new Subview());

        panel.render();
        panel.remove();
        panel.delegateEvents();
        panel.undelegateEvents();
    });

    test('Composite view can register a list of views', function() {
        expect(1);
        var panel = new Composite({});
        panel.registerView({
            a: new Backbone.View(),
            b: new Backbone.View(),
            c: new Backbone.View()
        }).registerView([
            new Backbone.View(),
            new Backbone.View(),
            new Backbone.View()
        ]);

        equal(6, _.size(panel.subviews));
    });

    test('Register an array of view does not override existing views', function() {
        expect(1);
        var panel = new Composite({});
        panel.registerView({
            0: new Backbone.View(),
            1: new Backbone.View(),
            2: new Backbone.View()
        }).registerView([
            new Backbone.View(),
            new Backbone.View(),
            new Backbone.View()
        ]);

        equal(6, _.size(panel.subviews));
    });

    test('Register an object of view overrides existing views', function() {
        expect(1);
        var panel = new Composite({});
        panel.registerView([
            new Backbone.View(),
            new Backbone.View(),
            new Backbone.View()
        ]).registerView({
            0: new Backbone.View(),
            1: new Backbone.View(),
            2: new Backbone.View()
        });

        equal(3, _.size(panel.subviews));
    });

    test('When id is given, it replaces originaly defined view', function() {
        expect(5);
        var panel = new Composite({});
        var Subview = Backbone.View.extend({
                remove: function () {
                    ok(true, "remove function is called");
                }
            });
        panel.registerView({
            a: new Backbone.View(),
            b: new Subview(),
            c: new Backbone.View()
        }).registerView(
            new Backbone.View({id: "foo"}), "b"
        );

        equal(3, _.size(panel.subviews));
        equal(null, panel.subviews.a.id);
        equal("foo", panel.subviews.b.id);
        equal(null, panel.subviews.c.id);
    });
});
