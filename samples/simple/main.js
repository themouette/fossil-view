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
                    'click button': "onClick"
                },
                tagName: 'li',
                template: itemTpl,
                getViewData: function () {
                    return this.model.toJSON();
                },
                onClick: function () {
                    this.model.destroy();
                }
            }),
        template:  mainTpl
    });
});
