// This file defines the `Collection` view.
// This file depends on Fossil's `Composite` view
define(['underscore', 'backbone', './composite', './view'], function (_, Backbone, Composite, View) {
    "use strict";

    var _super = Composite.prototype;
    var Collection = Composite.extend({
        constructor: function (options) {
            _ensureCollection(this);
            if (options && options.ItemView) {
                this.ItemView = options.ItemView;
            }
            Composite.apply(this, arguments);
            this.bindCollectionEvents();
        },

        ItemView: View,

        getView: function (id) {
            if (!this.subviews[id]) {
                this.subviews[id] = new this.ItemView(this._getItemViewOptions(id));
            }

            return this.subviews[id];
        },

        _getItemViewOptions: function (id) {
            return {
                model: this.collection.get(id)
            };
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
            var args = _.toArray(arguments);
            // render in collection order
            this.collection.each(function (model, id) {
                composite._renderSubview.apply(composite, [model.cid, {}].concat(args));
            });
        }
    });

    function _ensureCollection (view) {
        if (!view.collection) {
            view.collection = new Backbone.Collection();
        }
    }

    return Collection;
});
