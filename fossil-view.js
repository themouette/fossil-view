(function (_, Backbone, jQuery, Fossil) {
// This file defines the Fossil View base component.
// It is required for any of the Fossil view component.
var Lib = (function (Fossil, _, Backbone) {
    "use strict";

    Fossil.View || (Fossil.View = Backbone.View.extend({
                        render: function () {
                            this.$el.html(_.result(this, "template"));
                            return this;
                        }
                    }));
    Fossil.Views || (Fossil.Views = {});

    return Fossil.Views;
})(Fossil, _, Backbone);

// This file defines the Composite view.
// A composite view is a view composed of subviews.
(function (_, Backbone, Fossil, Lib) {
    "use strict";

    var messages = {
        invalid_view: "registerView accept a Backbone.View or an Object as first argument."
    };

    var _super = Fossil.View.prototype;
    var Composite = Lib.Composite = Fossil.View.extend({
        subviews: {},
        selector: null,
        _rendered: false,

        constructor: function (options) {
            _super.constructor.apply(this, arguments);
            this.subviews = _.clone(this.subviews);
        },

        // register a view.
        registerView: function (view, id) {
            if (view instanceof Backbone.View) {
                // generate id
                id || (id = _.size(this.subviews));
                // remove old
                if (this.subviews[id] && this.subviews[id].remove) {
                    this.subviews[id].remove();
                }

                this.subviews[id] = view;
                if (this._rendered) {
                    this._renderSubview(id);
                }

                return this;
            }

            var callback = _.bind(this.registerView, this);
            if (_.isArray(view)) {
                _.each(view, function (itemview, id) {
                    callback(itemview);
                });

                return this;
            }

            if (_.isObject(view)) {
                _.each(view, function (itemview, id) {
                    callback(itemview, id);
                });

                return this;
            }

            // it has to be one of those
            throw new Error(messages.invalid_view);
        },

        getView: function (id) {
            return this.subviews[id];
        },

        // options can be the view id or an object with following properties:
        //
        // * id
        // * index: index to append item to
        // * selector: root selector for subviews management
        _renderSubview: function (id, options) {
            var selector;
            var itemview = this.getView(id);
            var renderArguments = _.tail(arguments, 2);
            options || (options = {});
            itemview.render.apply(itemview, renderArguments);

            if (!itemview.el) {
                return ;
            }

            var $el = this.$el;
            if (this.selector) {
                $el = this.$(this.selector);
            }
            if (this.options && this.options.selector) {
                $el = this.$(this.options.selector);
            }

            if (options.selector) {
                $el = $el.find(options.selector);
            }

            if (options.empty) {
                $el.empty();
            }

            if (options.index === 0) {
                $el.prepend(itemview.el);
                return ;
            }

            if (options.index) {
                selector = '> :nth-child(' + (parseInt(options.index, 10)) + ')';
                itemview.$el.insertAfter($el.find(selector));
                return ;
            }

            $el.append(itemview.el);
            return ;
        },

        // use this method to render inital view
        template: function () {
            if (_.isFunction(this.options.template)) {
                return this.options.template.call(this);
            }
            return this.options.template || '';
        },

        _renderAllSubviews: function() {
            var composite = this;
            var args = _.toArray(arguments);
            _.each(this.subviews, function (itemview, id) {
                composite._renderSubview.apply(composite, [id, {}].concat(args));
            });
        },

        _detachAllSubviews: function() {
            var composite = this;
            _.each(this.subviews, function (itemview, id) {
                composite._detachSubview(id);
            });
        },
        _detachSubview: function (id, options) {
            var itemview = this.getView(id);
            if (itemview && itemview.$el) {
                itemview.$el.detach();
            }
        },

        // render template, then
        render: function () {
            this._detachAllSubviews();
            _super.render.apply(this, arguments);
            this._renderAllSubviews.apply(this, arguments);
            this._rendered = true;
            return this;
        },
        remove: function () {
            _super.remove.call(this);
            this.invokeSubviews('remove');
            this._rendered = false;
        },
        delegateEvents: function () {
            _super.delegateEvents.call(this);
            this.invokeSubviews('delegateEvents');
        },
        undelegateEvents: function () {
            _super.undelegateEvents.call(this);
            this.invokeSubviews('undelegateEvents');
        },

        invokeSubviews: function (method) {
            var args = _.rest(arguments);
            return _.map(this.subviews, function invokeSubview (itemview, id) {
                itemview[method].apply(itemview, args);
            });
        }

    });



    return Composite;
})(_, Backbone, Fossil, Lib);

// This file defines the `Collection` view.
// This file depends on Fossil's `Composite` view
(function (_, Backbone, Lib) {
    "use strict";

    var _super = Lib.Composite.prototype;
    var Collection = Lib.Collection = Lib.Composite.extend({
        constructor: function (options) {
            _ensureCollection(this);
            if (options && options.ItemView) {
                this.ItemView = options.ItemView;
            }
            _super.constructor.apply(this, arguments);
            this.bindCollectionEvents();
        },

        ItemView: Backbone.View,

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
})(_, Backbone, Lib);

// This file defines the `RegionManager` view.
// This file depends on Fossil's `Composite` view
(function (_, Backbone, Lib) {
    "use strict";

    var messages = {
        require_region: _.template('Unknown region <%- id %>')
    };

    var _super = Lib.Composite.prototype;
    var RegionManager = Lib.RegionManager = Lib.Composite.extend({
        regions: {},
        constructor: function (options) {
            options || (options = {});
            this.regions = _.clone(this.regions);
            this.defineRegion(options.regions || this.regions);
            _super.constructor.apply(this, arguments);
        },

        // define a new region
        // region.defineRegion(id, selector, [view]);
        defineRegion: function (id, selector, view) {
            var canvas = this;
            if (_.isObject(id)) {
                var views = selector || {};
                // this is an object
                _.each(id, function (selector, id) {
                    var v;
                    if (views && views[id]) {
                        v = views[id];
                    }
                    _defineRegion(canvas, id, selector, v);
                });

                return this;
            }

            _defineRegion(canvas, id, selector, view);

            return this;
        },

        _renderSubview: function (id, options) {
            if (!this.getView(id)) {
                return ;
            }
            if (!this.regions[id]) {
                throw new Error(messages.require_region({id: id}));
            }
            var extra = _.tail(arguments, 2);

            options = _.extend({
                empty: true,
                selector: this.regions[id]
            }, options || {});

            return _super._renderSubview.apply(this, [id, options].concat(extra));
        },

        _renderAllSubviews: function () {
            var composite = this;
            var args = _.toArray(arguments);
            _.each(this.regions, function (selector, id) {
                composite._renderSubview.apply(composite, [id, {}].concat(args));
            });
        }
    });

    function _defineRegion (canvas, id, selector, view) {
        canvas.regions[id] = selector;
        if (view) {
            canvas.registerView(view, id);
        }
    }

    return RegionManager;
})(_, Backbone, Lib);
return Fossil.Views;
})(_, Backbone, jQuery, this.Fossil || (this.Fossil = {}));