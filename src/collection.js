// This file defines the `Collection` view.
// This file depends on Fossil's `Composite` view
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'underscore',
            'backbone',
            'fossil/view/core',
            'fossil/view/composite'
        ], factory);
    } else {
        // Browser globals
        root.Fossil.View.Collection = factory(root._, root.Backbone, root.Fossil.View, root.Fossil.View.Composite);
    }
}(this, function (_, Backbone, Lib, Composite) {
    "use strict";

    var _super = Composite.prototype;
    var Collection = Lib.Collection = Composite.extend({
        ItemView: Backbone.View,

        initialize: function (options) {
            _super.initialize.call(this, options);
            _ensureCollection(this);
            if (options && options.ItemView) {
                this.ItemView = options.ItemView;
            }
            this.bindCollectionEvents();
        },

        getView: function (id) {
            if (!this.subviews[id]) {
                this.subviews[id] = new this.ItemView({
                    model: this.collection.get(id)
                });
            }

            return this.subviews[id];
        },

        // use view.stopListening(view.collection) to undelegate events.
        bindCollectionEvents: function () {
            this.listenTo(this.collection, 'add', _.bind(this.onAddModel, this));
            this.listenTo(this.collection, 'remove', _.bind(this.onRemoveModel, this));
            this.listenTo(this.collection, 'sort', _.bind(this.onCollectionSort, this));
            this.listenTo(this.collection, 'sync', _.bind(this.onCollectionSync, this));
        },
        onAddModel: function (model, collection, options) {
            var id = model.cid;

            // remove old
            if (this.subviews[id] && this.subviews[id].remove) {
                this.subviews[id].remove();
                this.subviews[id] = null;
            }

            if (this._rendered) {
                this._renderSubview(id, {
                    index: options.at
                });
            }
        },
        onRemoveModel: function (model, collection, options) {
            var id = model.cid;
            this.getView(id).remove();
            delete this.subviews[id];
        },
        onCollectionSort: function (collection, options) {
            this.render();
        },
        onCollectionSync: function () {
            console.log(arguments);
        },

        _renderAllSubviews: function () {
            var composite = this;
            // render in collection order
            this.collection.each(function (model, id) {
                composite._renderSubview(model.cid);
            });
        }
    });

    function _ensureCollection (view) {
        if (!view.collection) {
            view.collection = new Backbone.Collection();
        }
    }

    return Collection;
}));
