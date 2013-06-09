// This file defines the Fossil View base component.
// It is required for any of the Fossil view component.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory(root));
    } else {
        // Browser globals
        factory(root);
    }
}(this, function (root) {
    "use strict";

    root.Fossil || (root.Fossil = {});
    root.Fossil.View || (root.Fossil.View = {});

    return root.Fossil.View;
}));
