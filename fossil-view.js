window.Fossil || (window.Fossil = {})
window.Fossil.Views = (function (_, Backbone) {
    

/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

    define('underscore', [], function () { return _;});
    define('backbone', [], function () { return Backbone;});

// Base view for all Fossil views
//
// Main advantage is the ability to
define('view',['backbone'], function (Backbone) {

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

// This file defines the Composite view.
// A composite view is a view designed to manage inner views.
// It automaticly forwards following method calls to sub views:
//
// * remove
// * delegateEvents
// * undelegateEvents
// * attachPlugins
// * detachPlugins
define('composite',['underscore', 'backbone', './view'], function (_, Backbone, View) {
    

    var messages = {
        invalid_view: "registerView accept a Backbone.View or an Object as first argument."
    };

    // Store an instance of parent view.
    var _super = View.prototype;

    var Composite = View.extend({
        // a store for subviews.
        // every subview has an id
        subviews: {},
        // selector for subiew(s) to append.
        selector: null,
        // should the composite view manage
        // the view rendering or is it done outside
        manageRendering: true,

        constructor: function (options) {
            var composite = this;
            View.apply(this, arguments);
            this.subviews = _.clone(this.subviews);
            _.each(['selector', 'manageRendering'], function (property) {
                if (options && typeof options[property] !== "undefined") {
                    composite[property] = options[property];
                }
            });
        },

        // register a view in the composite view store.
        // If no id is provided, a new id is generated.
        //
        // It accepts array or objects to register batches.
        //
        // the newly registered view is available through `getView(id)`.
        //
        // example
        //
        // ``` js
        // manager.registerView(myView);
        // manager.registerView(myView, 'some-id');
        // manager.registerView([myView, mySecondView]);
        // manager.registerView({'id1': myView});
        // ```
        //
        // When replacing a
        registerView: function (view, id) {
            if (view instanceof Backbone.View) {
                // generate an id
                id || (id = _.size(this.subviews));
                // remove old view if exists
                if (this.subviews[id]) {
                    // if view is tagged as recycle, then it will
                    // be detached.
                    this.removeView(id);
                }

                this.subviews[id] = view;
                // render and attach the view if composite is already rendered
                // it will be deferred till render otherwise.
                if (this._rendered) {
                    this._renderSubview(id);
                }

                if (this.subviews[id]._attachPlugins) {
                    this.subviews[id]._attachPlugins();
                } else if (this.subviews[id].attachPlugins) {
                    // case there is no wrapper for attachPlugins
                    this.subviews[id].attachPlugins();
                }

                return this;
            }

            // Handles the case of Array
            // and Object types.
            var callback = _.bind(this.registerView, this);
            if (_.isArray(view)) {
                _.each(view, function (itemview, id) {
                    callback(itemview);
                });

                return this;
            }

            if (_.isObject(view)) {
                _.each(view, function (itemview, id) {
                    callback(itemview, id);
                });

                return this;
            }

            // it has to be one of those
            throw new Error(messages.invalid_view);
        },

        // retrieve a view by id
        getView: function (id) {
            return this.subviews[id];
        },

        // render a subView by id.
        //
        // options can be the view id or an object with following properties:
        //
        // * index: index to append item to
        // * selector: root selector for subviews management. Note that it will
        //   be relative to a potential view's `selector` property.
        // * empty: empty element before appending the new one.
        _renderSubview: function (id, options) {
            var itemview = this.getView(id);
            var renderArguments = _.tail(arguments, 2);
            options || (options = {});

            if (this.manageRendering && (!itemview._rendered || !itemview.recycle)) {
                itemview.render.apply(itemview, renderArguments);
            }

            if (!itemview.el) {
                return ;
            }

            var $el = this.$el;
            if (this.selector) {
                $el = this.$(this.selector);
            }

            // select a relative element
            if (options.selector) {
                $el = $el.find(options.selector);
            }

            // clean before appending
            if (options.empty) {
                $el.empty();
            }

            appendSubview(itemview, $el, options);

            return ;
        },

        _renderAllSubviews: function() {
            var composite = this;
            var args = _.toArray(arguments);
            _.each(this.subviews, function (itemview, id) {
                composite._renderSubview.apply(composite, [id, {}].concat(args));
            });
        },

        _detachAllSubviews: function() {
            var composite = this;
            _.each(this.subviews, function (itemview, id) {
                composite.detachView(id);
            });
        },
        // detach view with `id` so it can be reused
        detachView: function (id, options) {
            var itemview = this.getView(id);
            // no view means nothing to remove
            if (!itemview) return ;

            // case it is a Fossil view
            // element is detached.
            if (itemview.detach) {
                itemview.detach();
                return ;
            }

            // otherwise
            if (itemview.$el) {
                itemview.$el.detach();
            }
        },
        // remove view with `id`
        removeView: function (id, force) {
            var itemview = this.getView(id);
            // no view means nothing to remove
            if (!itemview) return ;

            // case it is a View object
            if (itemview.remove) {
                itemview.remove(force);
            }
        },

        // render template, then
        render: function () {
            this._detachAllSubviews();
            _super.render.apply(this, arguments);
            return this;
        },
        // attach views just after the template is rendered
        // it allows to take advantage of attachPlugins native behavior
        onRendered: function () {
            this._renderAllSubviews.apply(this, arguments);
        },

        // invoke a method on every subview, passing extra arguments.
        invokeSubviews: function (method) {
            var args = _.rest(arguments);
            return _.map(this.subviews, function invokeSubview (itemview, id) {
                if (typeof itemview[method] === "function") {
                    itemview[method].apply(itemview, args);
                }
            });
        },

        _attachPlugins: function () {
            if (!this.isAttachedToDOM()) {
                return ;
            }
            _super._attachPlugins.apply(this, arguments);
            _.each(this.subviews, function attachPlugin (itemview, id) {
                if (itemview._attachPlugins) {
                    itemview._attachPlugins();
                } else if (itemview.attachPlugins) {
                    // case of non Fossil views
                    itemview.attachPlugins();
                }
            });
        },

        _detachPlugins: function () {
            var args = arguments;
            _super._detachPlugins.apply(this, arguments);
            return _.map(this.subviews, function invokeSubview (itemview, id) {
                if (typeof itemview._detachPlugin === "function") {
                    itemview._detachPlugin.apply(itemview, args);
                } else if (typeof itemview.detachPlugin === "function") {
                    itemview.detachPlugin.apply(itemview, args);
                }
            });
        },

        remove: function (force) {
            _super.remove.apply(this, arguments);
            // in case of a remove, then invoke
            // it on subviews too.
            if (force || !this.recycle) {
                this.invokeSubviews('remove');
            }
        }

    });

    // forward method to subviews and calls _super
    _.each(['delegateEvents', 'undelegateEvents'], function (method) {
        Composite.prototype[method] = function () {
            _super[method].apply(this, arguments);
            this.invokeSubviews(method);
        };
    });

    function appendSubview(view, $el, options) {
        var selector;
        // first element in list
        if (options.index === 0) {
            $el.prepend(view.el);
            return ;
        }

        // an index is given
        if (options.index) {
            selector = '> :nth-child(' + (parseInt(options.index, 10)) + ')';
            view.$el.insertAfter($el.find(selector));
            return ;
        }

        $el.append(view.el);
    }

    return Composite;
});

// This file defines the `Collection` view.
// This file depends on Fossil's `Composite` view
define('collection',['underscore', 'backbone', './composite', './view'], function (_, Backbone, Composite, View) {
    

    var _super = Composite.prototype;
    var Collection = Composite.extend({
        constructor: function (options) {
            _ensureCollection(this);
            if (options && options.ItemView) {
                this.ItemView = options.ItemView;
            }
            Composite.apply(this, arguments);
            this.bindCollectionEvents();
        },

        ItemView: View,

        getView: function (id) {
            if (!this.subviews[id]) {
                this.subviews[id] = new this.ItemView(this._getItemViewOptions(id));
            }

            return this.subviews[id];
        },

        _getItemViewOptions: function (id) {
            return {
                model: this.collection.get(id)
            };
        },

        // use view.stopListening(view.collection) to undelegate events.
        bindCollectionEvents: function () {
            this.listenTo(this.collection, 'add', _.bind(this.onAddModel, this));
            this.listenTo(this.collection, 'remove', _.bind(this.onRemoveModel, this));
            this.listenTo(this.collection, 'sort', _.bind(this.onCollectionSort, this));
            this.listenTo(this.collection, 'sync', _.bind(this.onCollectionSync, this));
        },
        onAddModel: function (model, collection, options) {
            var id = model.cid;

            // remove old
            if (this.subviews[id] && this.subviews[id].remove) {
                this.subviews[id].remove();
                this.subviews[id] = null;
            }

            if (this._rendered) {
                this._renderSubview(id, {
                    index: options.at
                });
            }
        },
        onRemoveModel: function (model, collection, options) {
            var id = model.cid;
            this.getView(id).remove();
            delete this.subviews[id];
        },
        onCollectionSort: function (collection, options) {
            this.render();
        },
        onCollectionSync: function () {
            console.log(arguments);
        },

        _renderAllSubviews: function () {
            var composite = this;
            var args = _.toArray(arguments);
            // render in collection order
            this.collection.each(function (model, id) {
                composite._renderSubview.apply(composite, [model.cid, {}].concat(args));
            });
        }
    });

    function _ensureCollection (view) {
        if (!view.collection) {
            view.collection = new Backbone.Collection();
        }
    }

    return Collection;
});

// This file defines the `RegionManager` view.
// This file depends on Fossil's `Composite` view
define('regionManager',['underscore', 'backbone', './composite'], function (_, Backbone, Composite) {
    

    var messages = {
        require_region: _.template("Unknown region <%- id %>")
    };

    var _super = Composite.prototype;
    var RegionManager = Composite.extend({
        regions: {},
        constructor: function (options) {
            options || (options = {});
            this.regions = _.clone(this.regions);
            this.defineRegion(options.regions || this.regions);
            Composite.apply(this, arguments);
        },

        // define a new region
        // region.defineRegion(id, selector, [view]);
        defineRegion: function (id, selector, view) {
            var canvas = this;
            if (_.isObject(id)) {
                var views = selector || {};
                // this is an object
                _.each(id, function (selector, id) {
                    var v;
                    if (views && views[id]) {
                        v = views[id];
                    }
                    _defineRegion(canvas, id, selector, v);
                });

                return this;
            }

            _defineRegion(canvas, id, selector, view);

            return this;
        },

        _renderSubview: function (id, options) {
            if (!this.getView(id)) {
                return ;
            }
            if (!this.regions[id]) {
                throw new Error(messages.require_region({id: id}));
            }
            var extra = _.tail(arguments, 2);

            options = _.extend({
                empty: true,
                selector: this.regions[id]
            }, options || {});

            return _super._renderSubview.apply(this, [id, options].concat(extra));
        },

        _renderAllSubviews: function () {
            var composite = this;
            var args = _.toArray(arguments);
            _.each(this.regions, function (selector, id) {
                composite._renderSubview.apply(composite, [id, {}].concat(args));
            });
        }
    });

    function _defineRegion (canvas, id, selector, view) {
        canvas.regions[id] = selector;
        if (view) {
            canvas.registerView(view, id);
        }
    }

    return RegionManager;
});
    var view = require('view');
    var composite = require('composite');
    var collection = require('collection');
    var regionManager = require('regionManager');

    return {
        "View": require('view'),
        "Composite": require('composite'),
        "Collection": require('collection'),
        "RegionManager": require('regionManager')
    };
})(_, Backbone);
