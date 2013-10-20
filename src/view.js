// Base view for all Fossil views
//
// Main advantage is the ability to
define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        // Stores template.
        // template can be compiled and renedered via hook methods:
        // `renderHtml` and `precompile`
        template: null,
        // should the view be recycled
        // view recycling means a soft removal.
        recycle: false,
        // a flag to remember if the view is rendered or not
        _rendered: false,
        // a flag to remember wether plugins are attached or not.
        _pluginsAttached: false,

        // Base view provides an extra option `template`.
        // this options is used to render view.
        constructor: function (options) {
            var view = this;
            // extend constructor
            Backbone.View.apply(this, arguments);
            // copy options in the view.
            _.each(['template', 'recycle', 'attachPlugins', 'detachPlugins'], function (property) {
                if (options && typeof options[property] !== "undefined") {
                    view[property] = options[property];
                }
            });
        },

        // Render function provides enough flexibility to handle
        // a large panel of configurations.
        // Feel free to replace it if it doesn't fit your current
        // need. All arguments are forwarded to `renderHtml` method
        // first usage is helpers, but you can be more inventive.
        //
        // When using late view attachement, you must call the
        // `attachPlugins` method manualy. Otherwise, `attachPlugins` callback
        // is automaticly called. Note
        //
        // Rendering is done following this steps:
        //
        // 1. Compile template if not already, using `precompile`
        //    method;
        // 2. Computes data using `getViewData` method;
        // 3. Render template using `renderHtml` method with
        //    data and original method arguments;
        // 4. replace view element content with rendered html.
        // 5. if view is attached to the page, the `attachPlugins` method
        //    is called.
        //
        // Following hooks are left to your implementation if you
        // want to specify some steps:
        //
        // * `precompile(template)`: called on every render, to
        //   ensure template is always processed;
        // * `getViewData()`: compile data to provide to template;
        // * `renderHtml(data[, helpers...])`: render template;
        // * `onRendered()`: called when element is populated;
        // * `attachPlugins`: called only if view element is attached to
        //   the DOM. This should be used to attache jQuery widgets.
        // * `detachPlugins` is a hook method for you to destroy jquery
        //   plugin or any behavior set up in `attachPlugins`.
        //   *Note* that it will require you to call `attachPlugins`
        //   manualy when the view will be attached again.
        render: function (helpers) {
            var data, renderedHtml;
            if (this.precompile) {
                this.template = this.precompile(this.template);
            }
            data = {};
            if (this.getViewData) {
                data = this.getViewData();
            }
            renderedHtml = this.template;
            if (this.renderHtml) {
                renderedHtml = this.renderHtml.apply(this, [data].concat(_.toArray(arguments)));
            }
            this._detachPlugins();
            this.$el.html(renderedHtml);
            if (this.onRendered) {
                this.onRendered.apply(this, arguments);
            }
            this._attachPlugins();
            this._rendered = true;
            return this;
        },

        // use this funciton to attach plugins.
        // it checks you defined a callback and view is attached to DOM.
        _attachPlugins: function () {
            if (this.isAttachedToDOM()) {
                this._detachPlugins();
                if (this.attachPlugins) {
                    this.attachPlugins();
                }
                this.trigger('on:plugins:attach', this);
                this._pluginsAttached = true;
            }
        },
        // check detachPlugins is callable
        _detachPlugins: function () {
            this.trigger('on:plugins:detach', this);
            if (this._pluginsAttached && this.detachPlugins) {
                this.detachPlugins();
                this._pluginsAttached = false;
            }
        },

        // Use detach if you plan to reuse the view.
        // It removes view element from dom and call `detachPlugins` method.
        detach: function() {
            this._detachPlugins();
            if (this.$el && this.$el.detach) {
                this.$el.detach();
            }
            return this;
        },

        // remove view, similar to backbone native method.
        // it call `detachPlugins` method then removes view.
        //
        // if the view is marked as recycle, then it will be detached
        // unless force flag is true.
        remove: function (force) {
            if (!force && this.recycle) {
                return this.detach();
            }
            this._detachPlugins();
            // call parent remove
            Backbone.View.prototype.remove.apply(this, arguments);
            this._rendered = false;
            return this;
        },

        isAttachedToDOM: function () {
            return this.$el.parents(':last').is('html');
        }
    });
});
