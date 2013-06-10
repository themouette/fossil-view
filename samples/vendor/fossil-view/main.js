// This file is a utility to include the whole Fossil View component through AMD.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'fossil/view/core',
            'fossil/view/composite',
            'fossil/view/collection',
            'fossil/view/regionManager'
        ], factory);
    }
}(this, function (Lib) {
    "use strict";

    return Lib;
}));

