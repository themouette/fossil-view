define([
    "tpl!templates/userDetails.html",
    "fossil/view/view",
    "jquery-ui"
], function (userDetailsTpl, View, $) {
    return View.extend({
        template: userDetailsTpl,
        events: {
            'click a.list': function (e) {
                e.preventDefault();
                Backbone.trigger('app:show:list');
            }
        },
        getViewData: function () {
            return this.model.toJSON();
        },
        attachPlugins: function () {
            // copy parent height
            this.$el.height($(this.$el.parent()).height() - 5);
            // and initialize an accordion in full size.
            this.$('.accordion').accordion({
                heightStyle: "fill"
            });
        },
        detachPlugins: function () {
            this.$('.accordion').accordion('destroy');
        }
    });
});
