// This file defines the Fossil View base component.
// It is required for any of the Fossil view component.
var Lib = (function (Fossil, Backbone) {
    "use strict";

    Fossil.View || (Fossil.View = Backbone.View.extend({}));
    Fossil.Views || (Fossil.Views = {});

    return Fossil.Views;
})(Fossil, Backbone);
