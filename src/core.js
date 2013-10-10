// This file defines the Fossil View base component.
// It is required for any of the Fossil view component.
define([
    'fossil-core', 'backbone',
    './view', './collection', './composite', './regionManager'],
function (Fossil, Backbone, View, Composite, Collection, RegionManager) {
    "use strict";

    // Expose View to the world
    Fossil.View = View;
    Fossil.Views = _.extend(Fossil.Views || {}, {
        'Composite': Composite,
        'Collection': Collection,
        'RegionManager': RegionManager
    });

    return Fossil.Views;
});
