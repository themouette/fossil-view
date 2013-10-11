// This file defines the Composite view.
// A composite view is a view designed to manage inner views.
// It automaticly forwards following method calls to sub views:
//
// * remove
// * delegateEvents
// * undelegateEvents
// * attachPlugins
// * detachPlugins
define(['underscore', 'backbone', './view'], function (_, Backbone, View) {
    "use strict";

    var messages = {
        invalid_view: "registerView accept a Backbone.View or an Object as first argument."
    };

    // Store an instance of parent view.
    var _super = View.prototype;

    var Composite = View.extend({
        // a store for subviews.
        // every subview has an id
        subviews: {},
        // selector for subiew(s) to append.
        selector: null,
        // should the composite view manage
        // the view rendering or is it done outside
        manageRendering: true,

        constructor: function (options) {
            var composite = this;
            _super.constructor.apply(this, arguments);
            this.subviews = _.clone(this.subviews);
            _.each(['selector', 'manageRendering'], function (property) {
                if (typeof composite.options[property] !== "undefined") {
                    composite[property] = composite.options[property];
                }
            });
        },

        // register a view in the composite view store.
        // If no id is provided, a new id is generated.
        //
        // It accepts array or objects to register batches.
        //
        // the newly registered view is available through `getView(id)`.
        //
        // example
        //
        // ``` js
        // manager.registerView(myView);
        // manager.registerView(myView, 'some-id');
        // manager.registerView([myView, mySecondView]);
        // manager.registerView({'id1': myView});
        // ```
        //
        // When replacing a
        registerView: function (view, id) {
            if (view instanceof Backbone.View) {
                // generate an id
                id || (id = _.size(this.subviews));
                // remove old view if exists
                if (this.subviews[id]) {
                    // if view is tagged as recycle, then it will
                    // be detached.
                    this.removeView(id);
                }

                this.subviews[id] = view;
                // render and attach the view if composite is already rendered
                // it will be deferred till render otherwise.
                if (this._rendered) {
                    this._renderSubview(id);
                }

                if (this.subviews[id]._attachPlugins) {
                    this.subviews[id]._attachPlugins();
                } else if (this.subviews[id].attachPlugins) {
                    // case there is no wrapper for attachPlugins
                    this.subviews[id].attachPlugins();
                }

                return this;
            }

            // Handles the case of Array
            // and Object types.
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

        // retrieve a view by id
        getView: function (id) {
            return this.subviews[id];
        },

        // render a subView by id.
        //
        // options can be the view id or an object with following properties:
        //
        // * index: index to append item to
        // * selector: root selector for subviews management. Note that it will
        //   be relative to a potential view's `selector` property.
        // * empty: empty element before appending the new one.
        _renderSubview: function (id, options) {
            var selector;
            var itemview = this.getView(id);
            var renderArguments = _.tail(arguments, 2);
            options || (options = {});

            if (this.manageRendering && (!itemview._rendered || !itemview.recycle)) {
                itemview.render.apply(itemview, renderArguments);
            }

            if (!itemview.el) {
                return ;
            }

            var $el = this.$el;
            if (this.selector) {
                $el = this.$(this.selector);
            }

            // select a relative element
            if (options.selector) {
                $el = $el.find(options.selector);
            }

            // clean before appending
            if (options.empty) {
                $el.empty();
            }

            appendSubview(itemview, $el, options);

            return ;
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
                composite.detachView(id);
            });
        },
        // detach view with `id` so it can be reused
        detachView: function (id, options) {
            var itemview = this.getView(id);
            // no view means nothing to remove
            if (!itemview) return ;

            // case it is a Fossil view
            // element is detached.
            if (itemview.detach) {
                itemview.detach();
                return ;
            }

            // otherwise
            if (itemview.$el) {
                itemview.$el.detach();
            }
        },
        // remove view with `id`
        removeView: function (id, force) {
            var itemview = this.getView(id);
            // no view means nothing to remove
            if (!itemview) return ;

            // case it is a View object
            if (itemview.remove) {
                itemview.remove(force);
            }
        },

        // render template, then
        render: function () {
            this._detachAllSubviews();
            _super.render.apply(this, arguments);
            return this;
        },
        // attach views just after the template is rendered
        // it allows to take advantage of attachPlugins native behavior
        onRendered: function () {
            this._renderAllSubviews.apply(this, arguments);
        },

        // invoke a method on every subview, passing extra arguments.
        invokeSubviews: function (method) {
            var args = _.rest(arguments);
            return _.map(this.subviews, function invokeSubview (itemview, id) {
                if (typeof itemview[method] === "function") {
                    itemview[method].apply(itemview, args);
                }
            });
        },

        _attachPlugins: function () {
            if (!this.isAttachedToDOM()) {
                return ;
            }
            _super._attachPlugins.apply(this, arguments);
            _.each(this.subviews, function attachPlugin (itemview, id) {
                if (itemview._attachPlugins) {
                    itemview._attachPlugins();
                } else if (itemview.attachPlugins) {
                    // case of non Fossil views
                    itemview.attachPlugins();
                }
            });
        },

        _detachPlugins: function () {
            var args = arguments;
            _super._detachPlugins.apply(this, arguments);
            return _.map(this.subviews, function invokeSubview (itemview, id) {
                if (typeof itemview._detachPlugin === "function") {
                    itemview._detachPlugin.apply(itemview, args);
                } else if (typeof itemview.detachPlugin === "function") {
                    itemview.detachPlugin.apply(itemview, args);
                }
            });
        },

        remove: function (force) {
            _super.remove.apply(this, arguments);
            // in case of a remove, then invoke
            // it on subviews too.
            if (force || !this.recycle) {
                this.invokeSubviews('remove');
            }
        }

    });

    // forward method to subviews and calls _super
    _.each(['delegateEvents', 'undelegateEvents'], function (method) {
        Composite.prototype[method] = function () {
            _super[method].apply(this, arguments);
            this.invokeSubviews(method);
        };
    });

    function appendSubview(view, $el, options) {
        // first element in list
        if (options.index === 0) {
            $el.prepend(view.el);
            return ;
        }

        // an index is given
        if (options.index) {
            selector = '> :nth-child(' + (parseInt(options.index, 10)) + ')';
            view.$el.insertAfter($el.find(selector));
            return ;
        }

        $el.append(view.el);
    }

    return Composite;
});
