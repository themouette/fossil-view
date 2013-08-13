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
