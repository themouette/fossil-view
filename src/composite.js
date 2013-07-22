// This file defines the Composite view.
// A composite view is a view composed of subviews.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone', 'fossil/view/core'], factory);
    } else {
        // Browser globals
        root.Fossil.View.Composite = factory(_, Backbone, root.Fossil.View);
    }
}(this, function (_, Backbone, Lib) {
    "use strict";

    var messages = {
        invalid_view: "registerView accept a Backbone.View or an Object as first argument."
    };

    var _super = Backbone.View.prototype;
    var Composite = Lib.Composite = Backbone.View.extend({
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
            options || (options = {});
            itemview.render();

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
            _.each(this.subviews, function (itemview, id) {
                composite._renderSubview(id);
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
            this.$el.html(this.template());
            this._renderAllSubviews();
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
}));
