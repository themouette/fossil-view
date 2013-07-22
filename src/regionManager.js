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
})(_, Backbone, Lib);
