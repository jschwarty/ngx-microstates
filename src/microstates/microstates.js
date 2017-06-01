"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = Object.assign || function (target) {
    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    return sources.reduce(function (target, source) {
      Object.keys(source).forEach(function (property) {
        target[property] = source[property];
      });
      return target;
    }, target);
  };
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = box;

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function box(value) {
  return new _state2.default(value);
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('./assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Property Descriptor that computes its value once and then permanently caches
 * the result.
 *
 * In order to make the computation of microstate properties easy to
 * reason about, we want them to be as lazy as possible. However, in
 * order to make sure that we don't do any extra computation than
 * necessary we want to permanently cache the result of those lazy
 * computations. That's where `ComputedProperty` comes in.
 *
 * Every instance of `ComputedProperty` is a valid instance of a
 * JavaScript property descriptor, which, by default,  is
 * is _not_ enumerable. It can be used in any API that expects a property
 * descriptor. For example:
 *
 *   let object = {};
 *   Object.defineProperty('constant', new ComputedProperty(function() {
 *     return {};
 *   }))
 *
 *   object.constant === object.constant //=> true
 *
 * In order to change the configuration of the property descriptor,
 * you can pass a set of overrides to the constructor to do things
 * like make it an enumerable property.
 *
 *   let object = {}
 *   Object.defineProperty('constant', new ComputedProperty(function() {
 *     return {}
 *   }, { enumerable: true }));
 *
 *   Object.keys(object) //=> ['constant']
 *
 * The value of `this` inside the computed property evaluation function will be
 * the object on which this property resides.
 *
 *   let object = {one: 1, two: 2};
 *   Object.defineProperty('info', new ComputedProperty(function() {
 *     return { type: typeof this, keys: Object.keys(this) };
 *   }));
 *
 *   object.info //=> { type: 'object', keys: ['one', 'two'] }
 *
 * Note that it's totally ok to permanently cache the results of computations
 * since the objects to which these properties will be attached are
 * immutable.
 *
 * @constructor ComputedProperty
 * @param {function} compute - evaluates the property value
 * @param {Object} [attributes] - extra attributes for the descriptor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description
 */
var ComputedProperty = function ComputedProperty(compute) {
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, ComputedProperty);

  var property = this;
  this.get = function () {
    if (!property.isComputed) {
      property.cache = compute.call(this);
      property.isComputed = true;
    }
    return property.cache;
  };
  (0, _assign2.default)(this, attributes);
};

exports.default = ComputedProperty;


ComputedProperty.prototype.writeable = false;

ComputedProperty.prototype.configurable = false;

ComputedProperty.prototype.enumerable = false;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = extend;

var _assign3 = require('./assign');

var _assign4 = _interopRequireDefault(_assign3);

var _computedProperty = require('./computed-property');

var _computedProperty2 = _interopRequireDefault(_computedProperty);

var _objectUtils = require('./object-utils');

var _box = require('./box');

var _box2 = _interopRequireDefault(_box);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var keys = Object.keys,
  defineProperty = Object.defineProperty,
  defineProperties = Object.defineProperties,
  getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;

/**
 * Holds the transition methods, the properties and the prototype for
 * a microstate constructor. In actuality, most of what makes a
 * microstate a microstate is contained in this class, including the
 * constructor.
 *
 * @constructor Metadata
 * @param {function} Microstate - the root constructor
 * @param {function} type - the root constructor
 * @param {object|boolean|number|string|function} value - the represented value
 */

var Metadata = cached(function () {
  function Metadata(Microstate, type, supertype, definition) {
    _classCallCheck(this, Metadata);

    this.type = type;
    this.supertype = supertype;
    this.definition = definition;
    this.Microstate = Microstate;
  }

  /**
   * The Microstate constructor actually delegates to the metadata,
   * and so this is the where most of the construction logic takes
   * place.
   *
   * It "decorates" the state with properties corresponding to the
   * properties of `value` which is the value that the microstate
   * wraps. So, if value is
   *
   *   {
   *     hello: 'World',
   *     how: 'are you?'
   *   }
   *
   * then a `hello` property and a `how` property will be defined on
   * the state instance coresponding to their values in the `value`
   * param.
   *
   * @param {Microstate} state - the state being constructed.
   * @param {object|function|number|boolean} value - the boxed value
   * @see ValueProperty
   * @see ValueOfMethod
   */


  _createClass(Metadata, [{
    key: 'construct',
    value: function construct(state) {
      var _this = this;

      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var constants = (0, _objectUtils.mapObject)(this.constants, function (key, descriptor) {
        return new ChildProperty(_this, state, key, function () {
          return descriptor.value;
        });
      });

      var values = (0, _objectUtils.mapObject)(value, function (key) {
        return new ChildProperty(_this, state, key, function () {
          if (_this.constants.hasOwnProperty(key)) {
            var constant = _this.constants[key].value;
            return _this.isMicrostate(constant) ? constant.set(value[key].valueOf()) : value[key];
          } else {
            return value[key];
          }
        });
      });

      var descriptors = (0, _assign4.default)(constants, values);

      defineProperties(state, descriptors);
      defineProperty(state, 'valueOf', new ValueOfMethod(this, state, value, descriptors));
    }
  }, {
    key: 'isMicrostate',


    /**
     * Tests if any object is a microstate.
     *
     * Microstates get special treatment throughout the process of
     * transitions, and so you need a way to check if an object is a
     * microstate. When metadata is created for a microstate
     * constructor, a reference to the very root of the microstate tree
     * is captured in order to make this check easy.
     *
     * @method isMicrostate
     * @param {object} object - the object to check
     * @returns {boolean} if `object` is a microstate
     */
    value: function isMicrostate(object) {
      return object instanceof this.Microstate;
    }

    /**
     * Defines a microstate prototype.
     *
     * This collects all of the transitions defined for the microstate
     * and pops them onto a new object that will serve as the prototype.
     *
     * @type {object}
     */

  }, {
    key: 'constants',
    get: function get() {
      var properties = Object.getOwnPropertyDescriptors(this.definition);
      return (0, _objectUtils.reduceObject)(properties, function (descriptors, name, descriptor) {
        if (name !== 'transitions' && name !== 'valueOf') {
          return (0, _assign4.default)(descriptors, _defineProperty({}, name, descriptor));
        } else {
          return descriptors;
        }
      });
    }
  }, {
    key: 'prototype',
    get: function get() {
      var descriptors = (0, _assign4.default)({}, this.ownTransitions);
      return Object.create(this.supertype.prototype, descriptors);
    }
  }, {
    key: 'ownTransitions',
    get: function get() {
      var metadata = this;
      return (0, _objectUtils.mapObject)(this.definition.transitions, function (name, method) {
        return new _computedProperty2.default(function () {
          return function () {
            var _this2 = this;

            var Type = this.constructor;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            var result = method.call.apply(method, [this, this.valueOf()].concat(args));
            if (result instanceof Type) {
              return result;
            } else if (result instanceof Object) {
              var merged = (0, _objectUtils.mapObject)(result, function (key, value) {
                var child = _this2[key];
                if (child) {
                  return new child.constructor(value.valueOf());
                } else {
                  return value;
                }
              });
              return new Type((0, _assign4.default)({}, this, merged));
            } else {
              return new Type(result.valueOf());
            }
          };
        });
      });
    }
  }, {
    key: 'transitions',
    get: function get() {
      var transitions = {};
      for (var metadata = this; metadata; metadata = metadata.supertype.metadata) {
        (0, _assign4.default)(transitions, metadata.ownTransitions);
      }
      return transitions;
    }
  }]);

  return Metadata;
}());

function contextualize(state, holder, key) {
  var metadata = state.constructor.metadata;

  var transitions = (0, _objectUtils.mapObject)(metadata.transitions, function (name, descriptor) {
    return new _computedProperty2.default(function () {
      return function () {
        var transition = descriptor.get.call(state);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var result = transition.call.apply(transition, [state].concat(args));
        return holder.put(key, result);
      };
    });
  });

  var attributes = (0, _objectUtils.mapObject)(state, function (name) {
    var descriptor = new _computedProperty2.default(function () {
      return contextualize(state[name], this, name);
    }, { enumerable: true });

    return descriptor;
  });

  return Object.create(state, (0, _assign4.default)(attributes, transitions));
}

function extend(Microstate, Super, properties) {
  var Type = function (_Super) {
    _inherits(State, _Super);

    function State() {
      _classCallCheck(this, State);

      return _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).apply(this, arguments));
    }

    return State;
  }(Super);
  var metadata = new Metadata(Microstate, Type, Super, properties);
  Type.metadata = metadata;
  Type.prototype = metadata.prototype;
  Type.prototype.constructor = Type;
  return Type;
}

var ChildProperty = function (_ComputedProperty) {
  _inherits(ChildProperty, _ComputedProperty);

  _createClass(ChildProperty, [{
    key: 'enumerable',
    get: function get() {
      return true;
    }
  }]);

  function ChildProperty(metadata, state, name, resolve) {
    _classCallCheck(this, ChildProperty);

    return _possibleConstructorReturn(this, (ChildProperty.__proto__ || Object.getPrototypeOf(ChildProperty)).call(this, function () {
      var child = resolve();
      var substate = metadata.isMicrostate(child) ? child : (0, _box2.default)(child);
      return contextualize(substate, state, name);
    }));
  }

  return ChildProperty;
}(_computedProperty2.default);

var ValueOfMethod = function (_ComputedProperty2) {
  _inherits(ValueOfMethod, _ComputedProperty2);

  function ValueOfMethod(metadata, state, value, descriptors) {
    _classCallCheck(this, ValueOfMethod);

    /**
     * super receives a function that will return the valueOf this microstate.
     * The returned value is cached by ComputedProperty.
     */
    return _possibleConstructorReturn(this, (ValueOfMethod.__proto__ || Object.getPrototypeOf(ValueOfMethod)).call(this, function () {
      var valueOf = compute();
      function compute() {
        if (keys(descriptors).length > 0) {
          var properties = keys(descriptors).reduce(function (result, key) {
            return (0, _assign4.default)(result, _defineProperty({}, key, new _computedProperty2.default(function () {
              return state[key].valueOf();
            }, { enumerable: true })));
          }, {});
          return Object.create(typeof value === 'undefined' ? null : value, properties);
        } else {
          return value;
        }
      }
      if (metadata.definition.hasOwnProperty('valueOf')) {
        /**
         * Class has a custom valueOf method. This custom valueOf method
         * should receive the fully expanded value of this microstate.
         */
        var customValueOf = metadata.definition.valueOf.call(state, valueOf);
        return function () {
          return customValueOf;
        };
      } else {
        /**
         * Without custom valueOf just return result of unboxing of value
         */
        return function () {
          return valueOf;
        };
      }
    }));
  }

  return ValueOfMethod;
}(_computedProperty2.default);

function cached(constructor) {
  var prototype = constructor.prototype;

  (0, _objectUtils.eachProperty)(getOwnPropertyDescriptors(prototype), function (key, descriptor) {
    if (descriptor.get) {
      defineProperty(prototype, key, {
        get: function get() {
          var value = descriptor.get.call(this);
          var writeable = descriptor.writeable,
            enumerable = descriptor.enumerable;

          defineProperty(this, key, { value: value, writeable: writeable, enumerable: enumerable });
          return value;
        }
      });
    }
  });
  return constructor;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mapObject = mapObject;
exports.reduceObject = reduceObject;
exports.eachProperty = eachProperty;

var _assign2 = require('./assign');

var _assign3 = _interopRequireDefault(_assign2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Maps over the keys of an object converting the values of those keys into new
 * objects. The return value will be an object with the same set of
 * keys, but a different set of values. E.g.
 *
 * > mapObject({first: 1, second: 2}, (value)=> value *2)
 *
 *   {first: 2, second: 4}
 */
function mapObject() {
  var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var fn = arguments[1];

  return reduceObject(object, function (result, name, value) {
    return (0, _assign3.default)(result, _defineProperty({}, name, fn(name, value)));
  });
}

function reduceObject(object, fn) {
  var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  eachProperty(object, function (name, value) {
    result = fn(result, name, value);
  });
  return result;
}

function eachProperty(object, fn) {
  if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object') {
    Object.keys(object).forEach(function (name) {
      fn(name, object[name]);
    });
  }
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assign2 = require('./assign');

var _assign3 = _interopRequireDefault(_assign2);

var _extend2 = require('./extend');

var _extend3 = _interopRequireDefault(_extend2);

var _objectUtils = require('./object-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Opaque = function () {
  function Opaque(value) {
    _classCallCheck(this, Opaque);

    var metadata = this.constructor.metadata;
    metadata.construct(this, value);
    Object.freeze(this);
  }

  _createClass(Opaque, null, [{
    key: 'extend',
    value: function extend(properties) {
      return (0, _extend3.default)(Opaque, this, properties);
    }
  }]);

  return Opaque;
}();

exports.default = Opaque.extend({
  transitions: {
    set: function set(current, value) {
      return new this.constructor(value);
    },
    assign: function assign(current, attrs) {
      return attrs;
    },
    put: function put(current, key, value) {
      return _defineProperty({}, key, value);
    },
    delete: function _delete(current, key) {
      return this.set((0, _objectUtils.reduceObject)(current, function (attrs, name, value) {
        return name === key ? attrs : (0, _assign3.default)(attrs, _defineProperty({}, name, value));
      }));
    }
  }
});
