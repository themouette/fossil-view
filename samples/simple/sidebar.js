define([
    "tpl!templates/sidebar.html",
    "backbone",
    "fossil/view/view"
], function (sidebarTpl, Backbone, View) {

    var Sidebar = View.extend({
        template: sidebarTpl,
        events: {
            'click .collection .add': "add",
            'click .collection .insertAt': "insertAt",
            'click .collection .prepend': "prepend",
            'click .collection .sort': "sort",
            'click .collection .render': "renderCollection",
            'click .canvas .render': "renderCanvas"
        },
        addUser: function (options) {
            this.collection.add({
                nb: this.collection.length,
                name: this.$('#name').val()
            }, options);
            this.$('#name').val('');
        },

        detachPlugins: function () {
            console.log('sidebar detach plugins: remove jQuery widgets and other attachedPlugins');
        },
        attachPlugins: function () {
            console.log('sidebar attach plugins: initialize jQuery widgets for instance');
        },

        add: function () {
            this.addUser();
        },
        prepend: function () {
            this.addUser({at: 0});
        },
        insertAt: function () {
            this.addUser({at: 2});
        },
        sort: function () {
            this.collection.reverseOrder().sort();
        },
        renderCollection: function () {
            Backbone.trigger('canvas:render:region', "content");
        },
        renderCanvas: function () {
            Backbone.trigger('canvas:render');
        }

    });

    return Sidebar;
});
