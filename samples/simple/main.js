define([
    "tpl!templates/collection.html",
    "tpl!templates/user.html",
    "backbone",
    "fossil/view/collection"
], function (mainTpl, itemTpl, Backbone, CollectionView) {
    return CollectionView.extend({
        selector: 'ul.user-list',
        ItemView: Backbone.View.extend({
                events: {
                    'click button': "onClick"
                },
                tagName: 'li',
                render: function () {
                    this.$el.html(itemTpl(this.model.toJSON()));
                    return this;
                },
                onClick: function () {
                    this.model.destroy();
                }
            }),
        template:  mainTpl
    });
});
