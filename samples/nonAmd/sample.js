var collection = new Backbone.Collection([
    {name: 'John'},
    {name: 'Bill'},
    {name: 'Robert'}
]);

var Menu = Fossil.Views.View.extend({
    tagName: 'ul',
    render: function () {
        this.$el.html([
            '<li><a href="../../">Back</a></li>'
        ].join(''));
    }
});

var layout = new Fossil.Views.RegionManager({
    regions: {
        'menu': 'nav.menu',
        'content': 'section'
    },
    template: [
        '<header>',
            '<h1>Non amd sample</h1>',
            '<nav class="menu"></nav>',
        '</header>',
        '<section></section>',
        '<footer></footer>'
    ].join('')
});

layout.registerView(new Menu({
    tagName: 'ul',
    collection: collection,
}), 'menu');

layout.registerView(new Fossil.Views.Collection({
    collection: collection,
    ItemView: Backbone.View.extend({
        tagName: 'li',
        template: _.template('<%- name %>'),
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    })
}), 'content');

layout.setElement('body').render();
