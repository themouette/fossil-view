define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var UserCollection = Backbone.Collection.extend({
        order: 1,
        comparator: function (model) {
            return model.get('nb') * this.order;
        },
        reverseOrder: function () {
            this.order = -1 * this.order;
            return this;
        }
    });

    return UserCollection;
});
