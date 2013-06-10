// This file defines the `RegionManager` view.
// This file depends on Fossil's `Composite` view
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone', 'fossil/view/core', 'fossil/view/composite'], factory);
    } else {
        // Browser globals
        root.Fossil.View.RegionManager = factory(root._, root.Backbone, root.Fossil.View, root.Fossil.View.Composite);
    }
}(this, function (_, Backbone, Lib, Composite) {
    "use strict";

    var messages = {
        require_region: _.template('Unknown region <%- id %>')
    };

    var _super = Composite.prototype;
    var RegionManager = Lib.RegionManager = Composite.extend({
        regions: {},
        initialize: function (options) {
            _super.initialize.call(this, options);
            options || (options = {});
            this.regions = _.clone(this.regions);
            this.defineRegion(options.regions || this.regions);
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

            options = _.extend({
                empty: true,
                selector: this.regions[id]
            }, options || {});

            return _super._renderSubview.call(this, id, options);
        },

        _renderAllSubviews: function () {
            var composite = this;
            _.each(this.regions, function (selector, id) {
                composite._renderSubview(id);
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
}));
