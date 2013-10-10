// This file defines the `RegionManager` view.
// This file depends on Fossil's `Composite` view
define(['underscore', 'backbone', './composite'], function (_, Backbone, Composite) {
    "use strict";

    var messages = {
        require_region: _.template('Unknown region <%- id %>')
    };

    var _super = Composite.prototype;
    var RegionManager = Composite.extend({
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
});
