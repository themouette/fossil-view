define([
    "tpl!templates/collection.html",
    "tpl!templates/user.html",
    "fossil/view/view",
    "fossil/view/collection"
], function (mainTpl, itemTpl, View, CollectionView) {
    return CollectionView.extend({
        selector: 'ul.user-list',
        ItemView: View.extend({
                events: {
                    'click .delete': "onDelete",
                    'click .details': "onDetails"
                },
                tagName: 'li',
                template: itemTpl,
                getViewData: function () {
                    return this.model.toJSON();
                },
                onDelete: function () {
                    this.model.destroy();
                },
                onDetails: function () {
                    Backbone.trigger('app:show:item', this.model);
                }
            }),
        template:  mainTpl
    });
});
