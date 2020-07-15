
(function() {
  function kebabToCamel(name, capitalize) {
    return name.split('-').map((word, i) => (i || capitalize) ? word[0].toUpperCase() + word.slice(1) : word).join('');
  }
  function camelToKebab(name) {
    return name.split(/(?=[A-Z])/g).map(word => word.toLowerCase()).join('-');
  }
  function getObjectField(object, path) {
    if (!path) {
      return object;
    }
    path = Array.isArray(path) ? path : path.split('.');
    const field = object[path.shift()];
    return (path.length && field) ? getObjectField(field, path) : (field || null);
  }
  function setObjectFields(object, fields, ModelWrapper = null) {
    if (fields === null || typeof fields !== 'object') {
      throw new Error('Unable to update a Model with ' + fields + '. Expected an object.');
    }
    let created = {}, creates = 0, changed = {}, changes = 0, deleted = {}, deletes = 0;
    for (let key in fields) {
      const value = fields[key];
      let subresult;

      if (value === undefined) {
        if (key in object) {
          delete object[key];
          deleted[key] = true;
          deletes++;
        }
      } else
      if (ModelWrapper || object[key] instanceof Model) { // Delegate update to model without replacing it
        if (!(object[key] instanceof Model)) {
          created[key] = true;
          creates++;
          object[key] = new ModelWrapper(object[key]); // Wrap the original value
        }
        subresult = object[key].set(value instanceof Model ? value.value : value);
      } else
      if (value === null || typeof value !== 'object') { // Primitives
        if (object[key] !== value) {
          if (!(key in object)) {
            created[key] = true;
            creates++;
          }
          object[key] = value;
          changed[key] = true;
          changes++;
        }
      } else { // Objects
        if (!object[key] || typeof object[key] !== 'object') {
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
    return { created, creates, changed, changes, deleted, deletes };
  }
  function getDatasetProps(el) { // TODO: use props definition for validation
    const props = Object.assign({}, el.dataset);
    for (let key in props) {
      if (props[key] === '') { // Special case for empty attributes
        props[key] = true;
      }
    }
    return new Model(props);
  }

  // remove() polyfill
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
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  // Based on Backbone's implementation

  const eventSplitter = /\s+/;
  const pathSplitter = /[:.\/]+/;
  let _listening;
  let globalListenId = 0;
  const eventsApi = (iteratee, events, name, callback, opts) => {
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (let key in name) {
        events = eventsApi(iteratee, events, key, name[key], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (let key of name.split(eventSplitter)) {
        events = iteratee(events, key, callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  }

  const _onApi = (events, part, callback, options) => {
    part = (part === '#' ? '*' : (part === '+' ? '?' : part)); // Support both mqtt-style wildcards and more usual */?
    const handlers = events[part] || (events[part] = []);
    const context = options.context, ctx = options.ctx, listening = options.listening;
    if (listening) listening.count++;
    handlers.push({ callback, context, ctx: context || ctx, listening });
    return events;
  }

  const onApi = (events, name, callback, options) => {
    if (callback) {
      let subevents = events;
      name = (name === 'all') ? '*' : name;
      if (name && pathSplitter.test(name)) {
        for (let part of name.split(pathSplitter)) {
          subevents = subevents[part] || (subevents[part] = {});
        }
      } else {
        subevents = subevents[name] || (subevents[name] = {});
      }
      _onApi(subevents, '$', callback, options);
    }
    return events;
  }

  const _offApi = (events, path, callback, context, listeners) => {
    let names;
    if (path) {
      if (path.length) {
        const part = path.shift();
        if (part == '**') { // For unbinding the whole subtree
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
    for (let name of names) {
      const handlers = events[name];
      if (!handlers) continue;

      if (name === '$') {
        const remaining = [];
        for (let handler of handlers) {
          if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) {
            remaining.push(handler);
          } else {
            const listening = handler.listening;
            listening && listening.off(name, callback);
          }
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
  }

  const offApi = (events, name, callback, { context, listeners }) => {
    if (!events) return;

    if (!name && !context && !callback) {
      for (let listener of listeners) {
        listener.cleanup();
      }
      return;
    }

    name = (name === 'all') ? '*' : name;
    _offApi(events, name && name.split(pathSplitter), callback, context, listeners);
    return events;
  }

  const _triggerApiLinear = (events, full, path, args) => {
    const name = path.shift();
    const subevents = events[name];

    if (!path.length) {
      if (subevents && subevents['$']) triggerEvents(subevents['$'], args.concat([full]));
    } else {
      if (subevents) _triggerApiLinear(subevents, full, path.slice(), args);
      if (events['?']) _triggerApiLinear(events['?'], full, path, args);
    }
    if (events['*']) triggerEvents(events['*']['$'], args.concat([full]));
  }

  const _triggerApiTree = (events, full, tree, args) => {
    if (Array.isArray(tree)) {
      for (let name of tree) {
        _triggerApiLinear(events, full, name.split(pathSplitter), args);
      }
    } else {
      for (let name in tree) {
        const subtree = tree[name];
        const subevents = events[name];
        if (subtree === true) {
          if (subevents && subevents['$']) triggerEvents(subevents['$'], args.concat([full]));
        } else {
          if (subevents) _triggerApiTree(subevents, full, subtree, args);
          if (events['?']) _triggerApiTree(events['?'], full, subtree, args);
        }
      }
    }
    if (events['*']) triggerEvents(events['*']['$'], args.concat([full]));
  }

  const triggerApi = (events, name, args) => {
    if (events) {
      if (typeof name === 'string') {
        _triggerApiLinear(events, name, name.split(pathSplitter), args);
      } else {
        _triggerApiTree(events, name, name, args);
      }
    }
    return events;
  }

  const triggerEvents = (events, args) => {
    let ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  }

  const tryCatchOn = (obj, name, callback, context) => {
    try {
      obj.on(name, callback, context);
    } catch (e) {
      return e;
    }
  }

  const onceMap = (map, name, callback, offer) => {
    if (callback) {
      let called = false;
      const once = map[name] = function() {
        if (!called) {
          called = true;
          offer(name, once);
          callback.apply(this, arguments);
        }
      };
      once._callback = callback;
    }
    return map;
  }

  class Eventer {
    on(name, callback, context) {
      this._events = eventsApi(onApi, this._events || {}, name, callback, {
        context,
        ctx: this,
        listening: _listening
      });

      if (_listening) {
        var listeners = this._listeners || (this._listeners = {});
        listeners[_listening.id] = _listening;
        // Allow the listening to use a counter, instead of tracking
        // callbacks for library interop
        _listening.interop = false;
      }

      return this;
    }

    listenTo(obj, name, callback) {
      if (!obj) return this;
      const id = obj._listenId || (obj._listenId = ++globalListenId);
      const listeningTo = this._listeningTo || (this._listeningTo = {});
      let listening = _listening = listeningTo[id];

      // This object is not listening to any other events on `obj` yet.
      // Setup the necessary references to track the listening callbacks.
      if (!listening) {
        this._listenId || (this._listenId = ++globalListenId);
        listening = _listening = listeningTo[id] = new Listening(this, obj);
      }

      // Bind callbacks on obj.
      const error = tryCatchOn(obj, name, callback, this);
      _listening = void 0;

      if (error) throw error;
      // If the target obj is not Backbone.Events, track events manually.
      if (listening.interop) listening.on(name, callback);

      return this;
    }

    off(name, callback, context) {
      if (!this._events) return this;
      this._events = eventsApi(offApi, this._events, name, callback, {
        context,
        listeners: this._listeners
      });

      return this;
    }

    stopListening(obj, name, callback) {
      const listeningTo = this._listeningTo;
      if (!listeningTo) return this;

      const ids = obj ? [obj._listenId] : Object.keys(listeningTo);
      for (var i = 0; i < ids.length; i++) {
        var listening = listeningTo[ids[i]];

        // If listening doesn't exist, this object is not currently
        // listening to obj. Break out early.
        if (!listening) break;

        listening.obj.off(name, callback, this);
        if (listening.interop) listening.off(name, callback);
      }
      if (Object.keys(listeningTo).length === 0) this._listeningTo = void 0;

      return this;
    }

    once(name, callback, context) {
      const events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
      if (typeof name === 'string' && context == null) callback = void 0;
      return this.on(events, callback, context);
    }

    listenToOnce(obj, name, callback) {
      const events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
      return this.listenTo(obj, events);
    }

    trigger(name, ...args) {
      this._events && triggerApi(this._events, name, args);
      return this;
    }
  }
  Eventer.prototype.bind = Eventer.prototype.on;
  Eventer.prototype.unbind = Eventer.prototype.off;

  class Listener extends Eventer {
    constructor(listener, obj) {
      this.id = listener._listenId;
      this.listener = listener;
      this.obj = obj;
      this.interop = true;
      this.count = 0;
      this._events = void 0;
    }

    off(name, callback) {
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

    cleanup() {
      delete this.listener._listeningTo[this.obj._listenId];
      if (!this.interop) delete this.obj._listeners[this.id];
    }
  }

  // End of Eventer implementation

  class Component extends Eventer {

    mount(el) {
      el = el || this._stub;
      el && el.parentNode && el.parentNode.replaceChild(this.el, el);
      return this;
    }

    insert(parentEl, beforeEl) {
      parentEl.insertBefore(this.el, beforeEl);
      return this;
    }

    // Temporarily remove from parent without fully destroying (for conditional rendering)
    unmount() {
      if (!this.el.parentNode) return this; // Not mounted
      this._stub = this._stub || document.createComment(''); // Replace with a comment, so we can easily put it back
      this.el.parentNode.replaceChild(this._stub, this.el);
      return this;
    }

    // Unbinds all listeners and destroys component
    remove() {
      this.off();
      this.el.remove();
      Swick.instances.delete(this.el);
    }

    // Utils for uniform access to child nodes/components
    childContent(childName, text) {
      const el = this[childName];
      if (el instanceof Component) {
        el.data.set('content', text);
      } else {
        el.textContent = text;
      }
    }
    childHTML(childName, html) {
      const el = this[childName];
      if (el instanceof Component) {
        el.data.set('html', html);
      } else {
        el.innerHTML = html;
      }
    }
    childToggle(childName, prop, value) {
      const el = this[childName];
      if (el instanceof Component) {
        el.data.set(prop, value);
      } else {
        el.classList.toggle('is-' + camelToKebab(prop), !!value);
      }
    }
    childProp(childName, prop, value) {
      const el = this[childName];
      if (el instanceof Component) {
        const update = {};
        update[prop] = value;
        el.data.set(update); // TODO: support this without making an update object
      } else {
        el[prop] = value;
      }
    }

    watch(...args) {
      const opts = (args[0] && args[0].constructor === Object) ? args.shift() : {};
      let callbacks = [];
      while (args[args.length - 1] instanceof Function || (args[args.length - 1] && args[args.length - 1].constructor === Object)) {
        callbacks.unshift(args.pop());
      }
      const callback = callbacks[0];
      const isMultiSource = Array.isArray(args[0]);
      let sources = isMultiSource ? args[0] : [args];
      let listener;
      const kv = opts.initial ? opts.initial : {};
      const watchers = {};
      const update = (key, value) => {
        if (kv[key] !== value) {
          kv[key] = value;
          listener();
        }
      }
      const makeWatch = (i) => {
        return (...args) => {
          const watcher = this.watch({ initial: { index: i } }, ...args);
          watchers[i] = watchers[i] || [];
          watchers[i].push(watcher);
          return watcher;
        }
      }
      const stopWatching = (i) => {
        if (watchers[i]) {
          for (let watcher of watchers[i]) {
            watcher.unwatch();
          }
          delete watchers[i];
        }
      }
      if (!isMultiSource && (sources[0][0] instanceof List)) {
        const list = sources[0][0];
        const elements = [];
        const addItem = (item, i, items) => {
          const watch = makeWatch(i);
          const result = callback.add && callback.add.call(this, item, i, items, watch);
          if (result) {
            if (callbacks.length > 1) {
              watch.apply(this, result.concat(callbacks.slice(1)));
            } else {
              elements[i] = result;
              if (callback.container) {
                // TODO: use Fragments when possible
                callback.container.insertBefore(result.el || result, (elements[i + 1] && elements[i + 1].el) || elements[i + 1] || null);
              }
            }
          }
        }
        listener = (items, { add, move, remove }) => {
          if (remove) {
            for (let k in remove) {
              const i = parseInt(k);
              stopWatching(i);
              const result = callback.remove && callback.remove.call(this, remove[i], i, items);
              if (elements[i] && result !== false) {
                elements[i].remove && elements[i].remove();
                delete elements[i];
              }
            }
          }
          if (move) {
            const movedWatchers = {}; // Temporary object to prevent overwrites
            const movedElements = {};
            const indices = [];
            for (let k in move) {
              const i = parseInt(k);
              indices.push(i);
              if (move[i] in watchers) {
                movedWatchers[i] = watchers[move[i]];
                for (let watcher of watchers[move[i]]) {
                  watcher.update('index', i);
                }
                delete watchers[move[i]];
              }
              callback.move && callback.move(items[i], i, move[i], items);
              if (move[i] in elements) {
                movedElements[i] = elements[move[i]];
                delete elements[move[i]];
              }
            }
            // Using reversed order, so we can rely on elements[i + 1] to be already processed (and do insertBefore call)
            for (let j = indices.length - 1; j >= 0; j--) {
              const i = indices[j];
              if (i in movedWatchers) {
                watchers[i] = movedWatchers[i];
              } else {
                delete watchers[i];
              }
              if (i in movedElements) {
                elements[i] = movedElements[i];
                if (callback.container) {
                  // TODO: probably can be optimized to prevent unneeded calls
                  callback.container.insertBefore(elements[i].el || elements[i], (elements[i + 1] && elements[i + 1].el) || elements[i + 1] || null);
                }
              } else {
                delete elements[i];
              }
            }
          }
          if (add) {
            const indices = [];
            for (let k in add) {
              indices.push(parseInt(k));
            }
            // Using reversed order, so we can rely on elements[i + 1] to be already processed (and do insertBefore call)
            for (let j = indices.length - 1; j >= 0; j--) {
              addItem(add[indices[j]], indices[j], items);
            }
          }
          console.log(elements);
        }
        list.on('*', listener);
        for (let i = 0; i < list.items.length; i++) {
          addItem(list.items[i], i, list.items);
        }
      } else {
        listener = () => {
          const values = [];
          for (let source of sources) {
            const data = source[0];
            if (typeof data === 'string') {
              values.push(kv[data]);
            } else
            if (data instanceof Model) {
              values.push(source.length > 1 && !Array.isArray(source[1]) ? data.get(source[1]) : data.value);
            } else
            if (data instanceof Store) {
              const ids = source[1];
              if (Array.isArray(ids)) {
                const value = {};
                for (let id of ids) {
                  value[id] = data.get(id);
                }
                values.push(value);
              } else {
                values.push(data.get(ids));
              }
            }
          }
          stopWatching(0);
          const watch = makeWatch(0);
          values.push(watch);
          const result = callback.apply(this, values);
          if (result && callbacks.length > 1) {
            watch.apply(this, result.concat(callbacks.slice(1)));
          }
        }
        for (let source of sources) {
          const data = source[0];
          if (typeof data === 'string') {
            //
          } else
          if (data instanceof Model) {
            const keypath = source.length > 1 ? source[1] : '*';
            data.on('change:' + (Array.isArray(keypath) ? '(' + keypath.join(',') + ')' : keypath), listener);
          } else
          if (data instanceof Store) {
            const ids = source[1];
            const keypath = source.length > 2 ? source[2] : '*';
            data.on('change:' + (Array.isArray(ids) ? '(' + ids.join(',') + ')' : ids) + ':' + (Array.isArray(keypath) ? '(' + keypath.join(',') + ')' : keypath), listener);
          } else
          if (data instanceof List) {
            throw new Error('A list can only be a single data source.');
          } else {
            console.error('Unsupported data source: ', data, '. Expected a Model, Store or List instance.');
            throw new Error('Unsupported data source');
          }
        }
        listener(); // Initial call
      }

      return { // Provide method to stop watching all dependencies
        update,
        unwatch: () => {
          for (let i in watchers) {
            for (let watcher of watchers[i]) {
              watcher.unwatch();
            }
          }
          this.off(null, listener);
        }
      };
    }
  }

  // Special un-initialized version of a component (initializes on the first mount - replaced with actual component after that)
  class UnmountedComponent extends Component {
    constructor(parent, childName, compName, props, el) {
      super();
      this.parent = parent;
      this.childName = childName;
      this.compName = compName;
      this.data = props;
      this.el = document.createComment('');
      el.parentNode.replaceChild(this.el, el); // Replace original (not yet alive) element with a stub
    }

    mount() {
      const comp = this.parent[this.childName] = new Swick.components[this.compName](this.data);
      comp.mount(this.el);
      return comp;
    }

    unmount() {} // Noop
  }

  class Model extends Eventer {
    constructor(value) {
      super();
      if (value !== undefined && (!value || value.constructor !== Object)) {
        throw new Error('Unable to create a Model from ' + value + '. Expected an object.');
      }
      this.value = value || {};
    }

    id() {
      return this.value.id;
    }

    get(path) {
      return getObjectField(this.value, path);
    }

    set(path, value) {
      if (value === undefined) {
        value = path;
        path = null;
      }
      // TODO: merge/notify
      const update = setObjectFields(this.value, value);
      if (update.creates || update.changes || update.deletes) { // Is anything changed?
        const events = {};
        update.creates && (events.create = update.created);
        update.changes && (events.change = update.changed);
        update.deletes && (events.delete = update.deleted);
        this.trigger(events, this.value);
      }
      return update;
    }
  }

  class Store extends Eventer {
    constructor(items, model = Model) {
      super();
      this.items = {};
      this.model = model;
      if (Array.isArray(items)) {
        for (let item of items) {
          this.items[this.modelId(item)] = item instanceof Model ? item : new model(item);
        }
      } else
      if (items instanceof Object) {
        for (let id in items) {
          const item = items[id];
          this.items[id] = item instanceof Model ? item : new model(item);
        }
      }
    }

    modelId(attrs) {
      return (attrs instanceof this.model) ? attrs.id() : attrs.id;
    }

    get(id, path) {
      const item = this.items[id] || null;
      if (!path)  return item;
      return item && item.get(path);
    }

    // Set item(s) based on ids
    put(values) {
      if (!Array.isArray(values)) {
        values = [values];
      }
      const map = {};
      for (let value of values) {
        map[this.modelId(value)] = value;
      }
      return this.set(map);
    }

    set(id, path, value) {
      let map = {};
      if (path === undefined && value === undefined) {
        map = id;
      } else
      if (value === undefined) {
        map[id] = path;
        path = null;
      } else {
        map[id] = value;
      }
      const update = setObjectFields(this.items, map, this.model);
      if (update.creates || update.changes || update.deletes) { // Is anything changed?
        const events = {};
        update.creates && (events.create = update.created);
        update.changes && (events.change = update.changed);
        update.deletes && (events.delete = update.deleted);
        this.trigger(events, this.value);
      }
    }
  }

  class List extends Eventer {
    constructor(items = [], store = null) {
      super();
      this.filtered = {}; // id => true
      this.items = items;
      if (store instanceof Model) {
        this.model = store;
        this.items = items.map(item => item instanceof store ? item : new store(item)); // Wrap values
      } else
      if (store instanceof Store || store instanceof Function) {
        this.store = store;
      } else
      if (store !== null) {
        throw new Error('Unable to use ' + store + ' as a backing store for List. Expected Model, Store or a function (id => model).');
      }
    }

    normaliseItems(items) {
      return this.model ? items.map(item => item instanceof this.model ? item : new this.model(item)) : items;
    }

    idAt(index) {
      return this.model ? items[index].id() : items[index];
    }

    // Read methods

    get(index) {
      const item = this.items[index];
      return this.store ? (this.store instanceof Function ? this.store(item) : this.store.get(item)) : item;
    }

    // Write methods

    set(index, path, value) {
      if (value === undefined) {
        // Replace specific model
        value = this.normaliseItems([path])[0];
        const events = { add: {}, remove: {} };
        events.remove[index] = this.items[index];
        events.add[index] = value;
        this.items[index] = value;
        this.trigger(events, this.items);
      } else {
        // Delegate change to the model
        if (this.store) {
          this.store.set(this.items[index], path, value);
        } else
        if (this.items[index].set) {
          this.items[index].set(path, value);
        } else {
          throw new Error('Unable to set ' + value + ' for path ' + path + ' in ' + this.items[index] + ', as it has no set method.');
        }
      }
    }

    splice(index, count, values = []) {
      index = Math.min(index, this.items.length);
      if (index < 0) {
        index = Math.max(0, this.items.length + index);
      }
      count = Math.min(Math.max(0, count), this.items.length - index);
      values = this.normaliseItems(values);
      const events = {};
      if (count > 0) { // Some elements were removed
        events.remove = {};
        for (let i = index; i < count; i++) {
          events.remove[i] = this.items[i];
        }
      }
      if (count !== values.length && index < this.items.length) { // Some elements were shifted
        events.move = {};
        for (let i = index + count; i < this.items.length; i++) {
          events.move[i + values.length - count] = i;
        }
      }
      if (values.length > 0) { // Some elements were added
        events.add = {};
        for (let i = 0; i < values.length; i++) {
          events.add[index + i] = values[i];
        }
      }
      this.items.splice(index, count, ...values);
      this.trigger(events, this.items);
    }

    remove(ids) {
      const idMap = {};
      const events = { remove: {} };
      const removed = [];
      for (let id of ids) {
        idMap[id] = true;
      }
      let j = 0;
      for (let i = 0; i < this.items.length; i++) {
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

    removeAt(indices) {
      const indexMap = {};
      const events = { remove: {} };
      const removed = [];
      for (let index of indices) {
        indexMap[index] = true;
      }
      let j = 0;
      for (let i = 0; i < this.items.length; i++) {
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

    reset(values) {
      this.splice(0, this.items.length, values);
    }
    
    insert(index, values) {
      this.splice(index, 0, values);
    }

    append(values) {
      this.splice(this.items.length, 0, values);
    }

    prepend(values) {
      this.splice(0, 0, values);
    }

    push(...values) {
      this.splice(this.items.length, 0, values);
    }

    unshift(...values) {
      this.splice(0, 0, values);
    }

    shift(count = 1) {
      return this.splice(0, count);
    }

    pop(count = 1) {
      return this.splice(this.items.length - count, count);
    }
    
    swap(oldIndex, newIndex) {
      oldIndex = Math.max(0, Math.min(oldIndex, this.items.length - 1));
      newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));
      if (newIndex !== oldIndex) {
        const events = { move: {} };
        events.move[newIndex] = oldIndex;
        events.move[oldIndex] = newIndex;
        const value = this.items[oldIndex];
        this.items[oldIndex] = this.items[newIndex];
        this.items[newIndex] = value;
        this.trigger(events, this.items);
      }
    }

    move(oldIndex, newIndex) {
      oldIndex = Math.max(0, Math.min(oldIndex, this.items.length - 1));
      newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));
      if (newIndex !== oldIndex) {
        const events = { move: {} };
        const value = this.items[oldIndex];
        if (newIndex < oldIndex) {
          for (let i = oldIndex; i > newIndex; i--) {
            events.move[i] = i - 1;
            this.items[i] = this.items[i - 1];
          }
        } else {
          for (let i = oldIndex; i < newIndex; i++) {
            events.move[i] = i + 1;
            this.items[i] = this.items[i + 1];
          }
        }
        events.move[newIndex] = oldIndex;
        this.items[newIndex] = value;
        this.trigger(events, this.items);
      }
    }

    reorder(indices) {
      const newItems = [];
      const events = { move: {} };
      for (let i = 0; i < Math.min(this.items.length, indices.length); i++) {
        newItems[i] = this.items[indices[i]];
        events.move[i] = indices[i];
      }
      this.items = newItems;
      this.trigger(events, this.items);
    }

    sort(fn, keepSorted) {
      // TODO
    }

    filter(fn = null) {
      this.filterFn = fn;
      // Update filtered items
      const update = {};
      const change = {};
      if (fn) {
        for (let i = 0; i < this.items.length; i++) {
          const id = this.idAt(i);
          const oldState = !(id in this.filtered);
          const newState = fn.call(this, this.get(i), i, this.items);
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
        for (let id in this.filtered) {
          update[id] = change[id] = true;
        }
        this.filtered = {};
      }
      this.trigger({ filter: change }, update);
    }
  }

  const Swick = {
    Eventer, Model, Store, List, Component,
    templates: {},
    components: {},
    instances: new WeakMap(),
  };

  Swick.component = (className, init, def) => {
    const name = def.name || kebabToCamel(className, true);
    const Component = function(props, el) {
      if (props === null || props.constructor === Object) {
        props = new Model(props || {});
      }
      this.el = el || (def.el || Swick.templates[className]).cloneNode(true);
      Swick.instances.set(this.el, this);
      const childs = Array.from(this.el.querySelectorAll(`[class^="${className}__"]`));
      for (let child of childs) {
        const childName = kebabToCamel(child.classList[0].substr(className.length + 2));
        let comp = child;
        if (child.classList[1]) {
          const compName = kebabToCamel(child.classList[1], true);
          if (compName in Swick.components) {
            const props = getDatasetProps(child);
            if (props.get('isUnmounted')) {
              comp = new UnmountedComponent(this, childName, compName, props, child);
            } else {
              comp = new Swick.components[compName](props);
              comp.mount(child);
            }
          }
        }
        this[childName] = comp;
      }
      this.data = props;
      init && init.call(this, props, this.watch.bind(this));
    }
    Object.defineProperty(Component, 'name', { value: name }); // TODO: make it more usable
    Component.prototype = new Swick.Component;
    Component.props = def.props || {};
    Swick.components[name] = Component;
    return Component;
  }

  Swick.registerTemplates = (templatesEl) => {
    if (!templatesEl) {
      templatesEl = document.getElementById('templates');
    }
    while (templatesEl.childElementCount) {
      const el = templatesEl.firstElementChild;
      const kebabName = el.classList[0];
      //const name = kebabToCamel(kebabName, true);
      Swick.templates[kebabName] = el;
      el.remove();
    }
    templatesEl.remove();
  }

  const waitingForDOM = [];
  let isDOMReady = false;

  Swick.mount = (appEl) => {
    if (!isDOMReady) {
      waitingForDOM.push(Swick.mount.bind(this, appEl));
      return;
    }
    appEl = appEl || document.getElementById('app');
    const childs = Array.from(appEl.children);
    for (let child of childs) {
      if (child.classList[0]) {
        const compName = kebabToCamel(child.classList[0], true);
        if (compName in Swick.components) {
          const props = getDatasetProps(child);
          const comp = new Swick.components[compName](props, props.get('isRendered') ? child : null);
          !props.get('isRendered') && comp.mount(child);
          continue;
        }
      }
      Swick.mount(child); // Scan children recursively
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    Swick.registerTemplates(document.getElementById('templates'));
    isDOMReady = true;
    for (let func of waitingForDOM) {
      func();
    }
  });

  window.Swick = Swick;
  if (!('Sw' in window)) {
    window.Sw = Swick;
  }
})();