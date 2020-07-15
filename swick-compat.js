"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var _this8 = this;

  function kebabToCamel(name, capitalize) {
    return name.split('-').map(function (word, i) {
      return i || capitalize ? word[0].toUpperCase() + word.slice(1) : word;
    }).join('');
  }

  function camelToKebab(name) {
    return name.split(/(?=[A-Z])/g).map(function (word) {
      return word.toLowerCase();
    }).join('-');
  }

  function getObjectField(object, path) {
    if (!path) {
      return object;
    }

    path = Array.isArray(path) ? path : path.split('.');
    var field = object[path.shift()];
    return path.length && field ? getObjectField(field, path) : field || null;
  }

  function setObjectFields(object, fields) {
    var ModelWrapper = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (fields === null || _typeof(fields) !== 'object') {
      throw new Error('Unable to update a Model with ' + fields + '. Expected an object.');
    }

    var created = {},
        creates = 0,
        changed = {},
        changes = 0,
        deleted = {},
        deletes = 0;

    for (var key in fields) {
      var value = fields[key];
      var subresult = void 0;

      if (value === undefined) {
        if (key in object) {
          delete object[key];
          deleted[key] = true;
          deletes++;
        }
      } else if (ModelWrapper || object[key] instanceof Model) {
        // Delegate update to model without replacing it
        if (!(object[key] instanceof Model)) {
          created[key] = true;
          creates++;
          object[key] = new ModelWrapper(object[key]); // Wrap the original value
        }

        subresult = object[key].set(value instanceof Model ? value.value : value);
      } else if (value === null || _typeof(value) !== 'object') {
        // Primitives
        if (object[key] !== value) {
          if (!(key in object)) {
            created[key] = true;
            creates++;
          }

          object[key] = value;
          changed[key] = true;
          changes++;
        }
      } else {
        // Objects
        if (!object[key] || _typeof(object[key]) !== 'object') {
          object[key] = {};
          created[key] = true;
          creates++;
        }

        subresult = setObjectFields(object[key], value);
      }

      if (subresult) {
        created[key] = subresult.created;
        creates += subresult.creates;
        changed[key] = subresult.changed;
        changes += subresult.changes;
        deleted[key] = subresult.deleted;
        deletes += subresult.deletes;
      }
    }

    return {
      created: created,
      creates: creates,
      changed: changed,
      changes: changes,
      deleted: deleted,
      deletes: deletes
    };
  }

  function getDatasetProps(el) {
    // TODO: use props definition for validation
    var props = Object.assign({}, el.dataset);

    for (var key in props) {
      if (props[key] === '') {
        // Special case for empty attributes
        props[key] = true;
      }
    }

    return new Model(props);
  } // remove() polyfill


  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode === null) {
            return;
          }

          this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]); // Based on Backbone's implementation


  var eventSplitter = /\s+/;
  var pathSplitter = /[:.\/]+/;

  var _listening;

  var globalListenId = 0;

  var eventsApi = function eventsApi(iteratee, events, name, callback, opts) {
    if (name && _typeof(name) === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;

      for (var key in name) {
        events = eventsApi(iteratee, events, key, name[key], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      var _iterator = _createForOfIteratorHelper(name.split(eventSplitter)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _key = _step.value;
          events = iteratee(events, _key, callback, opts);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }

    return events;
  };

  var _onApi = function _onApi(events, part, callback, options) {
    part = part === '#' ? '*' : part === '+' ? '?' : part; // Support both mqtt-style wildcards and more usual */?

    var handlers = events[part] || (events[part] = []);
    var context = options.context,
        ctx = options.ctx,
        listening = options.listening;
    if (listening) listening.count++;
    handlers.push({
      callback: callback,
      context: context,
      ctx: context || ctx,
      listening: listening
    });
    return events;
  };

  var onApi = function onApi(events, name, callback, options) {
    if (callback) {
      var subevents = events;
      name = name === 'all' ? '*' : name;

      if (name && pathSplitter.test(name)) {
        var _iterator2 = _createForOfIteratorHelper(name.split(pathSplitter)),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var part = _step2.value;
            subevents = subevents[part] || (subevents[part] = {});
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        subevents = subevents[name] || (subevents[name] = {});
      }

      _onApi(subevents, '$', callback, options);
    }

    return events;
  };

  var _offApi = function _offApi(events, path, callback, context, listeners) {
    var names;

    if (path) {
      if (path.length) {
        var part = path.shift();

        if (part == '**') {
          // For unbinding the whole subtree
          names = Object.keys(events);
          path = null;
        } else {
          names = [part];
        }
      } else {
        names = ['$'];
      }
    } else {
      names = Object.keys(events);
    }

    var _iterator3 = _createForOfIteratorHelper(names),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var name = _step3.value;
        var handlers = events[name];
        if (!handlers) continue;

        if (name === '$') {
          var remaining = [];

          var _iterator4 = _createForOfIteratorHelper(handlers),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var handler = _step4.value;

              if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) {
                remaining.push(handler);
              } else {
                var listening = handler.listening;
                listening && listening.off(name, callback);
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          if (remaining.length) {
            events[name] = remaining;
          } else {
            delete events[name];
          }
        } else {
          _offApi(handlers, path, callback, context, listeners);

          if (!Object.keys(handlers).length) {
            delete events[name];
          }
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  };

  var offApi = function offApi(events, name, callback, _ref) {
    var context = _ref.context,
        listeners = _ref.listeners;
    if (!events) return;

    if (!name && !context && !callback) {
      var _iterator5 = _createForOfIteratorHelper(listeners),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var listener = _step5.value;
          listener.cleanup();
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      return;
    }

    name = name === 'all' ? '*' : name;

    _offApi(events, name && name.split(pathSplitter), callback, context, listeners);

    return events;
  };

  var _triggerApiLinear = function _triggerApiLinear(events, full, path, args) {
    var name = path.shift();
    var subevents = events[name];

    if (!path.length) {
      if (subevents && subevents['$']) triggerEvents(subevents['$'], args.concat([full]));
    } else {
      if (subevents) _triggerApiLinear(subevents, full, path.slice(), args);
      if (events['?']) _triggerApiLinear(events['?'], full, path, args);
    }

    if (events['*']) triggerEvents(events['*']['$'], args.concat([full]));
  };

  var _triggerApiTree = function _triggerApiTree(events, full, tree, args) {
    if (Array.isArray(tree)) {
      var _iterator6 = _createForOfIteratorHelper(tree),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var name = _step6.value;

          _triggerApiLinear(events, full, name.split(pathSplitter), args);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    } else {
      for (var _name in tree) {
        var subtree = tree[_name];
        var subevents = events[_name];

        if (subtree === true) {
          if (subevents && subevents['$']) triggerEvents(subevents['$'], args.concat([full]));
        } else {
          if (subevents) _triggerApiTree(subevents, full, subtree, args);
          if (events['?']) _triggerApiTree(events['?'], full, subtree, args);
        }
      }
    }

    if (events['*']) triggerEvents(events['*']['$'], args.concat([full]));
  };

  var triggerApi = function triggerApi(events, name, args) {
    if (events) {
      if (typeof name === 'string') {
        _triggerApiLinear(events, name, name.split(pathSplitter), args);
      } else {
        _triggerApiTree(events, name, name, args);
      }
    }

    return events;
  };

  var triggerEvents = function triggerEvents(events, args) {
    var ev,
        i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];

    switch (args.length) {
      case 0:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx);
        }

        return;

      case 1:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1);
        }

        return;

      case 2:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1, a2);
        }

        return;

      case 3:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
        }

        return;

      default:
        while (++i < l) {
          (ev = events[i]).callback.apply(ev.ctx, args);
        }

        return;
    }
  };

  var tryCatchOn = function tryCatchOn(obj, name, callback, context) {
    try {
      obj.on(name, callback, context);
    } catch (e) {
      return e;
    }
  };

  var onceMap = function onceMap(map, name, callback, offer) {
    if (callback) {
      var called = false;

      var once = map[name] = function () {
        if (!called) {
          called = true;
          offer(name, once);
          callback.apply(this, arguments);
        }
      };

      once._callback = callback;
    }

    return map;
  };

  var Eventer = /*#__PURE__*/function () {
    function Eventer() {
      _classCallCheck(this, Eventer);
    }

    _createClass(Eventer, [{
      key: "on",
      value: function on(name, callback, context) {
        this._events = eventsApi(onApi, this._events || {}, name, callback, {
          context: context,
          ctx: this,
          listening: _listening
        });

        if (_listening) {
          var listeners = this._listeners || (this._listeners = {});
          listeners[_listening.id] = _listening; // Allow the listening to use a counter, instead of tracking
          // callbacks for library interop

          _listening.interop = false;
        }

        return this;
      }
    }, {
      key: "listenTo",
      value: function listenTo(obj, name, callback) {
        if (!obj) return this;
        var id = obj._listenId || (obj._listenId = ++globalListenId);
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = _listening = listeningTo[id]; // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.

        if (!listening) {
          this._listenId || (this._listenId = ++globalListenId);
          listening = _listening = listeningTo[id] = new Listening(this, obj);
        } // Bind callbacks on obj.


        var error = tryCatchOn(obj, name, callback, this);
        _listening = void 0;
        if (error) throw error; // If the target obj is not Backbone.Events, track events manually.

        if (listening.interop) listening.on(name, callback);
        return this;
      }
    }, {
      key: "off",
      value: function off(name, callback, context) {
        if (!this._events) return this;
        this._events = eventsApi(offApi, this._events, name, callback, {
          context: context,
          listeners: this._listeners
        });
        return this;
      }
    }, {
      key: "stopListening",
      value: function stopListening(obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;
        var ids = obj ? [obj._listenId] : Object.keys(listeningTo);

        for (var i = 0; i < ids.length; i++) {
          var listening = listeningTo[ids[i]]; // If listening doesn't exist, this object is not currently
          // listening to obj. Break out early.

          if (!listening) break;
          listening.obj.off(name, callback, this);
          if (listening.interop) listening.off(name, callback);
        }

        if (Object.keys(listeningTo).length === 0) this._listeningTo = void 0;
        return this;
      }
    }, {
      key: "once",
      value: function once(name, callback, context) {
        var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
        if (typeof name === 'string' && context == null) callback = void 0;
        return this.on(events, callback, context);
      }
    }, {
      key: "listenToOnce",
      value: function listenToOnce(obj, name, callback) {
        var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
        return this.listenTo(obj, events);
      }
    }, {
      key: "trigger",
      value: function trigger(name) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        this._events && triggerApi(this._events, name, args);
        return this;
      }
    }]);

    return Eventer;
  }();

  Eventer.prototype.bind = Eventer.prototype.on;
  Eventer.prototype.unbind = Eventer.prototype.off;

  var Listener = /*#__PURE__*/function (_Eventer) {
    _inherits(Listener, _Eventer);

    var _super = _createSuper(Listener);

    function Listener(listener, obj) {
      var _this;

      _classCallCheck(this, Listener);

      _this.id = listener._listenId;
      _this.listener = listener;
      _this.obj = obj;
      _this.interop = true;
      _this.count = 0;
      _this._events = void 0;
      return _possibleConstructorReturn(_this);
    }

    _createClass(Listener, [{
      key: "off",
      value: function off(name, callback) {
        var cleanup;

        if (this.interop) {
          this._events = eventsApi(offApi, this._events, name, callback, {
            context: void 0,
            listeners: void 0
          });
          cleanup = !this._events;
        } else {
          this.count--;
          cleanup = this.count === 0;
        }

        if (cleanup) this.cleanup();
      }
    }, {
      key: "cleanup",
      value: function cleanup() {
        delete this.listener._listeningTo[this.obj._listenId];
        if (!this.interop) delete this.obj._listeners[this.id];
      }
    }]);

    return Listener;
  }(Eventer); // End of Eventer implementation


  var Component = /*#__PURE__*/function (_Eventer2) {
    _inherits(Component, _Eventer2);

    var _super2 = _createSuper(Component);

    function Component() {
      _classCallCheck(this, Component);

      return _super2.apply(this, arguments);
    }

    _createClass(Component, [{
      key: "mount",
      value: function mount(el) {
        el = el || this._stub;
        el && el.parentNode && el.parentNode.replaceChild(this.el, el);
        return this;
      }
    }, {
      key: "insert",
      value: function insert(parentEl, beforeEl) {
        parentEl.insertBefore(this.el, beforeEl);
        return this;
      } // Temporarily remove from parent without fully destroying (for conditional rendering)

    }, {
      key: "unmount",
      value: function unmount() {
        if (!this.el.parentNode) return this; // Not mounted

        this._stub = this._stub || document.createComment(''); // Replace with a comment, so we can easily put it back

        this.el.parentNode.replaceChild(this._stub, this.el);
        return this;
      } // Unbinds all listeners and destroys component

    }, {
      key: "remove",
      value: function remove() {
        this.off();
        this.el.remove();
        Swick.instances.delete(this.el);
      } // Utils for uniform access to child nodes/components

    }, {
      key: "childContent",
      value: function childContent(childName, text) {
        var el = this[childName];

        if (el instanceof Component) {
          el.data.set('content', text);
        } else {
          el.textContent = text;
        }
      }
    }, {
      key: "childHTML",
      value: function childHTML(childName, html) {
        var el = this[childName];

        if (el instanceof Component) {
          el.data.set('html', html);
        } else {
          el.innerHTML = html;
        }
      }
    }, {
      key: "childToggle",
      value: function childToggle(childName, prop, value) {
        var el = this[childName];

        if (el instanceof Component) {
          el.data.set(prop, value);
        } else {
          el.classList.toggle('is-' + camelToKebab(prop), !!value);
        }
      }
    }, {
      key: "childProp",
      value: function childProp(childName, prop, value) {
        var el = this[childName];

        if (el instanceof Component) {
          var update = {};
          update[prop] = value;
          el.data.set(update); // TODO: support this without making an update object
        } else {
          el[prop] = value;
        }
      }
    }, {
      key: "watch",
      value: function watch() {
        var _this2 = this;

        for (var _len2 = arguments.length, args = new Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var opts = args[0] && args[0].constructor === Object ? args.shift() : {};
        var callbacks = [];

        while (args[args.length - 1] instanceof Function || args[args.length - 1] && args[args.length - 1].constructor === Object) {
          callbacks.unshift(args.pop());
        }

        var callback = callbacks[0];
        var isMultiSource = Array.isArray(args[0]);
        var sources = isMultiSource ? args[0] : [args];
        var listener;
        var kv = opts.initial ? opts.initial : {};
        var watchers = {};

        var update = function update(key, value) {
          if (kv[key] !== value) {
            kv[key] = value;
            listener();
          }
        };

        var makeWatch = function makeWatch(i) {
          return function () {
            for (var _len3 = arguments.length, args = new Array(_len3), _key4 = 0; _key4 < _len3; _key4++) {
              args[_key4] = arguments[_key4];
            }

            var watcher = _this2.watch.apply(_this2, [{
              initial: {
                index: i
              }
            }].concat(args));

            watchers[i] = watchers[i] || [];
            watchers[i].push(watcher);
            return watcher;
          };
        };

        var stopWatching = function stopWatching(i) {
          if (watchers[i]) {
            var _iterator7 = _createForOfIteratorHelper(watchers[i]),
                _step7;

            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                var watcher = _step7.value;
                watcher.unwatch();
              }
            } catch (err) {
              _iterator7.e(err);
            } finally {
              _iterator7.f();
            }

            delete watchers[i];
          }
        };

        if (!isMultiSource && sources[0][0] instanceof List) {
          var list = sources[0][0];
          var elements = [];

          var addItem = function addItem(item, i, items) {
            var watch = makeWatch(i);
            var result = callback.add && callback.add.call(_this2, item, i, items, watch);

            if (result) {
              if (callbacks.length > 1) {
                watch.apply(_this2, result.concat(callbacks.slice(1)));
              } else {
                elements[i] = result;

                if (callback.container) {
                  // TODO: use Fragments when possible
                  callback.container.insertBefore(result.el || result, elements[i + 1] && elements[i + 1].el || elements[i + 1] || null);
                }
              }
            }
          };

          listener = function listener(items, _ref2) {
            var add = _ref2.add,
                move = _ref2.move,
                remove = _ref2.remove;

            if (remove) {
              for (var k in remove) {
                var i = parseInt(k);
                stopWatching(i);
                var result = callback.remove && callback.remove.call(_this2, remove[i], i, items);

                if (elements[i] && result !== false) {
                  elements[i].remove && elements[i].remove();
                  delete elements[i];
                }
              }
            }

            if (move) {
              var movedWatchers = {}; // Temporary object to prevent overwrites

              var movedElements = {};
              var indices = [];

              for (var _k in move) {
                var _i = parseInt(_k);

                indices.push(_i);

                if (move[_i] in watchers) {
                  movedWatchers[_i] = watchers[move[_i]];

                  var _iterator8 = _createForOfIteratorHelper(watchers[move[_i]]),
                      _step8;

                  try {
                    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                      var watcher = _step8.value;
                      watcher.update('index', _i);
                    }
                  } catch (err) {
                    _iterator8.e(err);
                  } finally {
                    _iterator8.f();
                  }

                  delete watchers[move[_i]];
                }

                callback.move && callback.move(items[_i], _i, move[_i], items);

                if (move[_i] in elements) {
                  movedElements[_i] = elements[move[_i]];
                  delete elements[move[_i]];
                }
              } // Using reversed order, so we can rely on elements[i + 1] to be already processed (and do insertBefore call)


              for (var j = indices.length - 1; j >= 0; j--) {
                var _i2 = indices[j];

                if (_i2 in movedWatchers) {
                  watchers[_i2] = movedWatchers[_i2];
                } else {
                  delete watchers[_i2];
                }

                if (_i2 in movedElements) {
                  elements[_i2] = movedElements[_i2];

                  if (callback.container) {
                    // TODO: probably can be optimized to prevent unneeded calls
                    callback.container.insertBefore(elements[_i2].el || elements[_i2], elements[_i2 + 1] && elements[_i2 + 1].el || elements[_i2 + 1] || null);
                  }
                } else {
                  delete elements[_i2];
                }
              }
            }

            if (add) {
              var _indices = [];

              for (var _k2 in add) {
                _indices.push(parseInt(_k2));
              } // Using reversed order, so we can rely on elements[i + 1] to be already processed (and do insertBefore call)


              for (var _j = _indices.length - 1; _j >= 0; _j--) {
                addItem(add[_indices[_j]], _indices[_j], items);
              }
            }

            console.log(elements);
          };

          list.on('*', listener);

          for (var i = 0; i < list.items.length; i++) {
            addItem(list.items[i], i, list.items);
          }
        } else {
          listener = function listener() {
            var values = [];

            var _iterator9 = _createForOfIteratorHelper(sources),
                _step9;

            try {
              for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                var source = _step9.value;
                var data = source[0];

                if (typeof data === 'string') {
                  values.push(kv[data]);
                } else if (data instanceof Model) {
                  values.push(source.length > 1 && !Array.isArray(source[1]) ? data.get(source[1]) : data.value);
                } else if (data instanceof Store) {
                  var ids = source[1];

                  if (Array.isArray(ids)) {
                    var value = {};

                    var _iterator10 = _createForOfIteratorHelper(ids),
                        _step10;

                    try {
                      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                        var id = _step10.value;
                        value[id] = data.get(id);
                      }
                    } catch (err) {
                      _iterator10.e(err);
                    } finally {
                      _iterator10.f();
                    }

                    values.push(value);
                  } else {
                    values.push(data.get(ids));
                  }
                }
              }
            } catch (err) {
              _iterator9.e(err);
            } finally {
              _iterator9.f();
            }

            stopWatching(0);
            var watch = makeWatch(0);
            values.push(watch);
            var result = callback.apply(_this2, values);

            if (result && callbacks.length > 1) {
              watch.apply(_this2, result.concat(callbacks.slice(1)));
            }
          };

          var _iterator11 = _createForOfIteratorHelper(sources),
              _step11;

          try {
            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              var source = _step11.value;
              var data = source[0];

              if (typeof data === 'string') {//
              } else if (data instanceof Model) {
                var keypath = source.length > 1 ? source[1] : '*';
                data.on('change:' + (Array.isArray(keypath) ? '(' + keypath.join(',') + ')' : keypath), listener);
              } else if (data instanceof Store) {
                var ids = source[1];

                var _keypath = source.length > 2 ? source[2] : '*';

                data.on('change:' + (Array.isArray(ids) ? '(' + ids.join(',') + ')' : ids) + ':' + (Array.isArray(_keypath) ? '(' + _keypath.join(',') + ')' : _keypath), listener);
              } else if (data instanceof List) {
                throw new Error('A list can only be a single data source.');
              } else {
                console.error('Unsupported data source: ', data, '. Expected a Model, Store or List instance.');
                throw new Error('Unsupported data source');
              }
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }

          listener(); // Initial call
        }

        return {
          // Provide method to stop watching all dependencies
          update: update,
          unwatch: function unwatch() {
            for (var _i3 in watchers) {
              var _iterator12 = _createForOfIteratorHelper(watchers[_i3]),
                  _step12;

              try {
                for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                  var watcher = _step12.value;
                  watcher.unwatch();
                }
              } catch (err) {
                _iterator12.e(err);
              } finally {
                _iterator12.f();
              }
            }

            _this2.off(null, listener);
          }
        };
      }
    }]);

    return Component;
  }(Eventer); // Special un-initialized version of a component (initializes on the first mount - replaced with actual component after that)


  var UnmountedComponent = /*#__PURE__*/function (_Component) {
    _inherits(UnmountedComponent, _Component);

    var _super3 = _createSuper(UnmountedComponent);

    function UnmountedComponent(parent, childName, compName, props, el) {
      var _this3;

      _classCallCheck(this, UnmountedComponent);

      _this3 = _super3.call(this);
      _this3.parent = parent;
      _this3.childName = childName;
      _this3.compName = compName;
      _this3.data = props;
      _this3.el = document.createComment('');
      el.parentNode.replaceChild(_this3.el, el); // Replace original (not yet alive) element with a stub

      return _this3;
    }

    _createClass(UnmountedComponent, [{
      key: "mount",
      value: function mount() {
        var comp = this.parent[this.childName] = new Swick.components[this.compName](this.data);
        comp.mount(this.el);
        return comp;
      }
    }, {
      key: "unmount",
      value: function unmount() {} // Noop

    }]);

    return UnmountedComponent;
  }(Component);

  var Model = /*#__PURE__*/function (_Eventer3) {
    _inherits(Model, _Eventer3);

    var _super4 = _createSuper(Model);

    function Model(value) {
      var _this4;

      _classCallCheck(this, Model);

      _this4 = _super4.call(this);

      if (value !== undefined && (!value || value.constructor !== Object)) {
        throw new Error('Unable to create a Model from ' + value + '. Expected an object.');
      }

      _this4.value = value || {};
      return _this4;
    }

    _createClass(Model, [{
      key: "id",
      value: function id() {
        return this.value.id;
      }
    }, {
      key: "get",
      value: function get(path) {
        return getObjectField(this.value, path);
      }
    }, {
      key: "set",
      value: function set(path, value) {
        if (value === undefined) {
          value = path;
          path = null;
        } // TODO: merge/notify


        var update = setObjectFields(this.value, value);

        if (update.creates || update.changes || update.deletes) {
          // Is anything changed?
          var events = {};
          update.creates && (events.create = update.created);
          update.changes && (events.change = update.changed);
          update.deletes && (events.delete = update.deleted);
          this.trigger(events, this.value);
        }

        return update;
      }
    }]);

    return Model;
  }(Eventer);

  var Store = /*#__PURE__*/function (_Eventer4) {
    _inherits(Store, _Eventer4);

    var _super5 = _createSuper(Store);

    function Store(items) {
      var _this5;

      var model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Model;

      _classCallCheck(this, Store);

      _this5 = _super5.call(this);
      _this5.items = {};
      _this5.model = model;

      if (Array.isArray(items)) {
        var _iterator13 = _createForOfIteratorHelper(items),
            _step13;

        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var item = _step13.value;
            _this5.items[_this5.modelId(item)] = item instanceof Model ? item : new model(item);
          }
        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }
      } else if (items instanceof Object) {
        for (var id in items) {
          var _item = items[id];
          _this5.items[id] = _item instanceof Model ? _item : new model(_item);
        }
      }

      return _this5;
    }

    _createClass(Store, [{
      key: "modelId",
      value: function modelId(attrs) {
        return attrs instanceof this.model ? attrs.id() : attrs.id;
      }
    }, {
      key: "get",
      value: function get(id, path) {
        var item = this.items[id] || null;
        if (!path) return item;
        return item && item.get(path);
      } // Set item(s) based on ids

    }, {
      key: "put",
      value: function put(values) {
        if (!Array.isArray(values)) {
          values = [values];
        }

        var map = {};

        var _iterator14 = _createForOfIteratorHelper(values),
            _step14;

        try {
          for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
            var value = _step14.value;
            map[this.modelId(value)] = value;
          }
        } catch (err) {
          _iterator14.e(err);
        } finally {
          _iterator14.f();
        }

        return this.set(map);
      }
    }, {
      key: "set",
      value: function set(id, path, value) {
        var map = {};

        if (path === undefined && value === undefined) {
          map = id;
        } else if (value === undefined) {
          map[id] = path;
          path = null;
        } else {
          map[id] = value;
        }

        var update = setObjectFields(this.items, map, this.model);

        if (update.creates || update.changes || update.deletes) {
          // Is anything changed?
          var events = {};
          update.creates && (events.create = update.created);
          update.changes && (events.change = update.changed);
          update.deletes && (events.delete = update.deleted);
          this.trigger(events, this.value);
        }
      }
    }]);

    return Store;
  }(Eventer);

  var List = /*#__PURE__*/function (_Eventer5) {
    _inherits(List, _Eventer5);

    var _super6 = _createSuper(List);

    function List() {
      var _this6;

      var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, List);

      _this6 = _super6.call(this);
      _this6.filtered = {}; // id => true

      _this6.items = items;

      if (store instanceof Model) {
        _this6.model = store;
        _this6.items = items.map(function (item) {
          return item instanceof store ? item : new store(item);
        }); // Wrap values
      } else if (store instanceof Store || store instanceof Function) {
        _this6.store = store;
      } else if (store !== null) {
        throw new Error('Unable to use ' + store + ' as a backing store for List. Expected Model, Store or a function (id => model).');
      }

      return _this6;
    }

    _createClass(List, [{
      key: "normaliseItems",
      value: function normaliseItems(items) {
        var _this7 = this;

        return this.model ? items.map(function (item) {
          return item instanceof _this7.model ? item : new _this7.model(item);
        }) : items;
      }
    }, {
      key: "idAt",
      value: function idAt(index) {
        return this.model ? items[index].id() : items[index];
      } // Read methods

    }, {
      key: "get",
      value: function get(index) {
        var item = this.items[index];
        return this.store ? this.store instanceof Function ? this.store(item) : this.store.get(item) : item;
      } // Write methods

    }, {
      key: "set",
      value: function set(index, path, value) {
        if (value === undefined) {
          // Replace specific model
          value = this.normaliseItems([path])[0];
          var events = {
            add: {},
            remove: {}
          };
          events.remove[index] = this.items[index];
          events.add[index] = value;
          this.items[index] = value;
          this.trigger(events, this.items);
        } else {
          // Delegate change to the model
          if (this.store) {
            this.store.set(this.items[index], path, value);
          } else if (this.items[index].set) {
            this.items[index].set(path, value);
          } else {
            throw new Error('Unable to set ' + value + ' for path ' + path + ' in ' + this.items[index] + ', as it has no set method.');
          }
        }
      }
    }, {
      key: "splice",
      value: function splice(index, count) {
        var _this$items;

        var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        index = Math.min(index, this.items.length);

        if (index < 0) {
          index = Math.max(0, this.items.length + index);
        }

        count = Math.min(Math.max(0, count), this.items.length - index);
        values = this.normaliseItems(values);
        var events = {};

        if (count > 0) {
          // Some elements were removed
          events.remove = {};

          for (var i = index; i < count; i++) {
            events.remove[i] = this.items[i];
          }
        }

        if (count !== values.length && index < this.items.length) {
          // Some elements were shifted
          events.move = {};

          for (var _i4 = index + count; _i4 < this.items.length; _i4++) {
            events.move[_i4 + values.length - count] = _i4;
          }
        }

        if (values.length > 0) {
          // Some elements were added
          events.add = {};

          for (var _i5 = 0; _i5 < values.length; _i5++) {
            events.add[index + _i5] = values[_i5];
          }
        }

        (_this$items = this.items).splice.apply(_this$items, [index, count].concat(_toConsumableArray(values)));

        this.trigger(events, this.items);
      }
    }, {
      key: "remove",
      value: function remove(ids) {
        var idMap = {};
        var events = {
          remove: {}
        };
        var removed = [];

        var _iterator15 = _createForOfIteratorHelper(ids),
            _step15;

        try {
          for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
            var id = _step15.value;
            idMap[id] = true;
          }
        } catch (err) {
          _iterator15.e(err);
        } finally {
          _iterator15.f();
        }

        var j = 0;

        for (var i = 0; i < this.items.length; i++) {
          if (this.idAt(i) in idMap) {
            removed.push(this.items[i]);
            events.remove[i] = this.items[i];
          } else {
            if (j < i) {
              this.items[j] = this.items[i];
              if (!events.move) events.move = {};
              events.move[j] = i;
            }

            j++;
          }
        }

        this.items.length = j;
        this.trigger(events, this.items);
        return removed;
      }
    }, {
      key: "removeAt",
      value: function removeAt(indices) {
        var indexMap = {};
        var events = {
          remove: {}
        };
        var removed = [];

        var _iterator16 = _createForOfIteratorHelper(indices),
            _step16;

        try {
          for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
            var index = _step16.value;
            indexMap[index] = true;
          }
        } catch (err) {
          _iterator16.e(err);
        } finally {
          _iterator16.f();
        }

        var j = 0;

        for (var i = 0; i < this.items.length; i++) {
          if (i in indexMap) {
            removed.push(this.items[i]);
            events.remove[i] = this.items[i];
          } else {
            if (j < i) {
              this.items[j] = this.items[i];
              if (!events.move) events.move = {};
              events.move[j] = i;
            }

            j++;
          }
        }

        this.items.length = j;
        this.trigger(events, this.items);
        return removed;
      }
    }, {
      key: "reset",
      value: function reset(values) {
        this.splice(0, this.items.length, values);
      }
    }, {
      key: "insert",
      value: function insert(index, values) {
        this.splice(index, 0, values);
      }
    }, {
      key: "append",
      value: function append(values) {
        this.splice(this.items.length, 0, values);
      }
    }, {
      key: "prepend",
      value: function prepend(values) {
        this.splice(0, 0, values);
      }
    }, {
      key: "push",
      value: function push() {
        for (var _len4 = arguments.length, values = new Array(_len4), _key5 = 0; _key5 < _len4; _key5++) {
          values[_key5] = arguments[_key5];
        }

        this.splice(this.items.length, 0, values);
      }
    }, {
      key: "unshift",
      value: function unshift() {
        for (var _len5 = arguments.length, values = new Array(_len5), _key6 = 0; _key6 < _len5; _key6++) {
          values[_key6] = arguments[_key6];
        }

        this.splice(0, 0, values);
      }
    }, {
      key: "shift",
      value: function shift() {
        var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        return this.splice(0, count);
      }
    }, {
      key: "pop",
      value: function pop() {
        var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        return this.splice(this.items.length - count, count);
      }
    }, {
      key: "swap",
      value: function swap(oldIndex, newIndex) {
        oldIndex = Math.max(0, Math.min(oldIndex, this.items.length - 1));
        newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));

        if (newIndex !== oldIndex) {
          var events = {
            move: {}
          };
          events.move[newIndex] = oldIndex;
          events.move[oldIndex] = newIndex;
          var value = this.items[oldIndex];
          this.items[oldIndex] = this.items[newIndex];
          this.items[newIndex] = value;
          this.trigger(events, this.items);
        }
      }
    }, {
      key: "move",
      value: function move(oldIndex, newIndex) {
        oldIndex = Math.max(0, Math.min(oldIndex, this.items.length - 1));
        newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));

        if (newIndex !== oldIndex) {
          var events = {
            move: {}
          };
          var value = this.items[oldIndex];

          if (newIndex < oldIndex) {
            for (var i = oldIndex; i > newIndex; i--) {
              events.move[i] = i - 1;
              this.items[i] = this.items[i - 1];
            }
          } else {
            for (var _i6 = oldIndex; _i6 < newIndex; _i6++) {
              events.move[_i6] = _i6 + 1;
              this.items[_i6] = this.items[_i6 + 1];
            }
          }

          events.move[newIndex] = oldIndex;
          this.items[newIndex] = value;
          this.trigger(events, this.items);
        }
      }
    }, {
      key: "reorder",
      value: function reorder(indices) {
        var newItems = [];
        var events = {
          move: {}
        };

        for (var i = 0; i < Math.min(this.items.length, indices.length); i++) {
          newItems[i] = this.items[indices[i]];
          events.move[i] = indices[i];
        }

        this.items = newItems;
        this.trigger(events, this.items);
      }
    }, {
      key: "sort",
      value: function sort(fn, keepSorted) {// TODO
      }
    }, {
      key: "filter",
      value: function filter() {
        var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        this.filterFn = fn; // Update filtered items

        var update = {};
        var change = {};

        if (fn) {
          for (var i = 0; i < this.items.length; i++) {
            var id = this.idAt(i);
            var oldState = !(id in this.filtered);
            var newState = fn.call(this, this.get(i), i, this.items);

            if (oldState != newState) {
              update[id] = newState;
              change[id] = true;

              if (newState) {
                delete this.filtered[id];
              } else {
                this.filtered[id] = true;
              }
            }
          }
        } else {
          for (var _id in this.filtered) {
            update[_id] = change[_id] = true;
          }

          this.filtered = {};
        }

        this.trigger({
          filter: change
        }, update);
      }
    }]);

    return List;
  }(Eventer);

  var Swick = {
    Eventer: Eventer,
    Model: Model,
    Store: Store,
    List: List,
    Component: Component,
    templates: {},
    components: {},
    instances: new WeakMap()
  };

  Swick.component = function (className, init, def) {
    var name = def.name || kebabToCamel(className, true);

    var Component = function Component(props, el) {
      if (props === null || props.constructor === Object) {
        props = new Model(props || {});
      }

      this.el = el || (def.el || Swick.templates[className]).cloneNode(true);
      Swick.instances.set(this.el, this);
      var childs = Array.from(this.el.querySelectorAll("[class^=\"".concat(className, "__\"]")));

      for (var _i7 = 0, _childs = childs; _i7 < _childs.length; _i7++) {
        var child = _childs[_i7];
        var childName = kebabToCamel(child.classList[0].substr(className.length + 2));
        var comp = child;

        if (child.classList[1]) {
          var compName = kebabToCamel(child.classList[1], true);

          if (compName in Swick.components) {
            var _props = getDatasetProps(child);

            if (_props.get('isUnmounted')) {
              comp = new UnmountedComponent(this, childName, compName, _props, child);
            } else {
              comp = new Swick.components[compName](_props);
              comp.mount(child);
            }
          }
        }

        this[childName] = comp;
      }

      this.data = props;
      init && init.call(this, props, el, this.watch.bind(this));
    };

    Object.defineProperty(Component, 'name', {
      value: name
    }); // TODO: make it more usable

    Component.prototype = new Swick.Component();
    Component.props = def.props || {};
    Swick.components[name] = Component;
    return Component;
  };

  Swick.registerTemplates = function (templatesEl) {
    if (!templatesEl) {
      templatesEl = document.getElementById('templates');
    }

    while (templatesEl.childElementCount) {
      var el = templatesEl.firstElementChild;
      var kebabName = el.classList[0]; //const name = kebabToCamel(kebabName, true);

      Swick.templates[kebabName] = el;
      el.remove();
    }

    templatesEl.remove();
  };

  var waitingForDOM = [];
  var isDOMReady = false;

  Swick.mount = function (appEl) {
    if (!isDOMReady) {
      waitingForDOM.push(Swick.mount.bind(_this8, appEl));
      return;
    }

    appEl = appEl || document.getElementById('app');
    var childs = Array.from(appEl.children);

    for (var _i8 = 0, _childs2 = childs; _i8 < _childs2.length; _i8++) {
      var child = _childs2[_i8];

      if (child.classList[0]) {
        var compName = kebabToCamel(child.classList[0], true);

        if (compName in Swick.components) {
          var props = getDatasetProps(child);
          var comp = new Swick.components[compName](props, props.get('isRendered') ? child : null);
          !props.get('isRendered') && comp.mount(child);
          continue;
        }
      }

      Swick.mount(child); // Scan children recursively
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    Swick.registerTemplates(document.getElementById('templates'));
    isDOMReady = true;

    var _iterator17 = _createForOfIteratorHelper(waitingForDOM),
        _step17;

    try {
      for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
        var func = _step17.value;
        func();
      }
    } catch (err) {
      _iterator17.e(err);
    } finally {
      _iterator17.f();
    }
  });
  window.Swick = Swick;

  if (!('Sw' in window)) {
    window.Sw = Swick;
  }
})();