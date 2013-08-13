(function (Collection, Backbone) {
    module('Collection');

    test('No new view is created when a model is added and view is not rendered', function () {
        expect(1);
        var collection = new Backbone.Collection();
        var panel = new Collection({
            collection: collection
        });

        collection.add({foo: "bar"});

        equal(panel.$('div').length, 0);
    });

    test('A new view is created when a model is added and view already rendered', function () {
        expect(1);
        var collection = new Backbone.Collection();
        var panel = new Collection({
            collection: collection
        });

        panel.render();

        collection.add({foo: "bar"});

        equal(panel.$('div').length, 1);
    });

    test('View order is kept in sync when model is inserted at a given index', function () {
        expect(3);
        var collection = new Backbone.Collection([{foo:"baz"}]);
        var panel = new Collection({
            collection: collection,
            ItemView: Backbone.View.extend({
                render: function () {
                    this.$el.html(this.model.get('foo'));
                    return this;
                }
            })
        });

        panel.render();
        equal(1, panel.$('div').length);

        collection.add({foo: "foo"}, {at: 0});
        collection.add({foo: "bar"}, {at: 1});
        collection.add({foo: "last"});

        equal(4, panel.$('div').length);
        equal('foobarbazlast', panel.$el.text());
    });

    test('View order is updated when models are reordered', function () {
        expect(0);
    });

    test('It is possible to specify options to ItemView', function () {
        expect(1);
        var collection = new Backbone.Collection([{foo:"baz"}]);
        var View = Collection.extend({
            _getItemViewOptions: function (id) {
                return _.extend({
                    value: 12
                }, Collection.prototype._getItemViewOptions.call(this, id));
            }
        });

        var panel = new View({
            collection: collection,
            ItemView: Backbone.View.extend({
                render: function () {
                    equal(12, this.options.value);
                    return this;
                }
            })
        });
        panel.render();
    });

    test('subview recieves render arguments', function () {
        expect(4);
        var collection = new Backbone.Collection([{foo:"baz"}]);
        var View = Backbone.View.extend({
            render: function () {
                equal(arguments.length, 3);
                equal(arguments[0], 0);
                equal(arguments[1], "string");
                deepEqual(arguments[2], {a:1});
            }
        });
        var panel = new Collection({
            collection: collection,
            ItemView: View
        });

        panel.render(0, "string", {a:1});


    });
})(Fossil.Views.Collection, Backbone);
