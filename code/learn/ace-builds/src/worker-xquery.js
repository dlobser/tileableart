"no use strict";
;(function(window) {
if (typeof window.window != "undefined" && window.document) {
    return;
}

window.console = function() {
    var msgs = Array.prototype.slice.call(arguments, 0);
    postMessage({type: "log", data: msgs});
};
window.console.error =
window.console.warn = 
window.console.log =
window.console.trace = window.console;

window.window = window;
window.ace = window;

window.onerror = function(message, file, line, col, err) {
    console.error("Worker " + err.stack);
};

window.normalizeModule = function(parentId, moduleName) {
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return window.normalizeModule(parentId, chunks[0]) + "!" + window.normalizeModule(parentId, chunks[1]);
    }
    if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = (base ? base + "/" : "") + moduleName;
        
        while(moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/^\.\//, "").replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }
    
    return moduleName;
};

window.require = function(parentId, id) {
    if (!id) {
        id = parentId
        parentId = null;
    }
    if (!id.charAt)
        throw new Error("worker.js require() accepts only (parentId, id) as arguments");

    id = window.normalizeModule(parentId, id);

    var module = window.require.modules[id];
    if (module) {
        if (!module.initialized) {
            module.initialized = true;
            module.exports = module.factory().exports;
        }
        return module.exports;
    }
    
    var chunks = id.split("/");
    if (!window.require.tlns)
        return console.log("unable to load " + id);
    chunks[0] = window.require.tlns[chunks[0]] || chunks[0];
    var path = chunks.join("/") + ".js";
    
    window.require.id = id;
    importScripts(path);
    return window.require(parentId, id);
};
window.require.modules = {};
window.require.tlns = {};

window.define = function(id, deps, factory) {
    if (arguments.length == 2) {
        factory = deps;
        if (typeof id != "string") {
            deps = id;
            id = window.require.id;
        }
    } else if (arguments.length == 1) {
        factory = id;
        deps = []
        id = window.require.id;
    }

    if (!deps.length)
        deps = ['require', 'exports', 'module']

    if (id.indexOf("text!") === 0) 
        return;
    
    var req = function(childId) {
        return window.require(id, childId);
    };

    window.require.modules[id] = {
        exports: {},
        factory: function() {
            var module = this;
            var returnExports = factory.apply(this, deps.map(function(dep) {
              switch(dep) {
                  case 'require': return req
                  case 'exports': return module.exports
                  case 'module':  return module
                  default:        return req(dep)
              }
            }));
            if (returnExports)
                module.exports = returnExports;
            return module;
        }
    };
};
window.define.amd = {}

window.initBaseUrls  = function initBaseUrls(topLevelNamespaces) {
    require.tlns = topLevelNamespaces;
}

window.initSender = function initSender() {

    var EventEmitter = window.require("ace/lib/event_emitter").EventEmitter;
    var oop = window.require("ace/lib/oop");
    
    var Sender = function() {};
    
    (function() {
        
        oop.implement(this, EventEmitter);
                
        this.callback = function(data, callbackId) {
            postMessage({
                type: "call",
                id: callbackId,
                data: data
            });
        };
    
        this.emit = function(name, data) {
            postMessage({
                type: "event",
                name: name,
                data: data
            });
        };
        
    }).call(Sender.prototype);
    
    return new Sender();
}

window.main = null;
window.sender = null;

window.onmessage = function(e) {
    var msg = e.data;
    if (msg.command) {
        if (main[msg.command])
            main[msg.command].apply(main, msg.args);
        else
            throw new Error("Unknown command:" + msg.command);
    }
    else if (msg.init) {        
        initBaseUrls(msg.tlns);
        require("ace/lib/es5-shim");
        sender = initSender();
        var clazz = require(msg.module)[msg.classname];
        main = new clazz(sender);
    } 
    else if (msg.event && sender) {
        sender._emit(msg.event, msg.data);
    }
};
})(this);// https://github.com/kriskowal/es5-shim

define('ace/lib/es5-shim', ['require', 'exports', 'module' ], function(require, exports, module) {

function Empty() {}

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        var target = this;
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = slice.call(arguments, 1); // for normal call
        var bound = function () {

            if (this instanceof bound) {

                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        if(target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}
if ([1,2].splice(0).length != 2) {
    if(function() { // test IE < 9 to splice bug - see issue #138
        function makeArray(l) {
            var a = new Array(l+2);
            a[0] = a[1] = 0;
            return a;
        }
        var array = [], lengthBefore;
        
        array.splice.apply(array, makeArray(20));
        array.splice.apply(array, makeArray(26));

        lengthBefore = array.length; //46
        array.splice(5, 0, "XXX"); // add one element

        lengthBefore + 1 == array.length

        if (lengthBefore + 1 == array.length) {
            return true;// has right splice implementation without bugs
        }
    }()) {//IE 6/7
        var array_splice = Array.prototype.splice;
        Array.prototype.splice = function(start, deleteCount) {
            if (!arguments.length) {
                return [];
            } else {
                return array_splice.apply(this, [
                    start === void 0 ? 0 : start,
                    deleteCount === void 0 ? (this.length - start) : deleteCount
                ].concat(slice.call(arguments, 2)))
            }
        };
    } else {//IE8
        Array.prototype.splice = function(pos, removeCount){
            var length = this.length;
            if (pos > 0) {
                if (pos > length)
                    pos = length;
            } else if (pos == void 0) {
                pos = 0;
            } else if (pos < 0) {
                pos = Math.max(length + pos, 0);
            }

            if (!(pos+removeCount < length))
                removeCount = length - pos;

            var removed = this.slice(pos, pos+removeCount);
            var insert = slice.call(arguments, 2);
            var add = insert.length;            
            if (pos === length) {
                if (add) {
                    this.push.apply(this, insert);
                }
            } else {
                var remove = Math.min(removeCount, length - pos);
                var tailOldPos = pos + remove;
                var tailNewPos = tailOldPos + add - remove;
                var tailCount = length - tailOldPos;
                var lengthAfterRemove = length - remove;

                if (tailNewPos < tailOldPos) { // case A
                    for (var i = 0; i < tailCount; ++i) {
                        this[tailNewPos+i] = this[tailOldPos+i];
                    }
                } else if (tailNewPos > tailOldPos) { // case B
                    for (i = tailCount; i--; ) {
                        this[tailNewPos+i] = this[tailOldPos+i];
                    }
                } // else, add == remove (nothing to do)

                if (add && pos === lengthAfterRemove) {
                    this.length = lengthAfterRemove; // truncate array
                    this.push.apply(this, insert);
                } else {
                    this.length = lengthAfterRemove + add; // reserves space
                    for (i = 0; i < add; ++i) {
                        this[pos+i] = insert[i];
                    }
                }
            }
            return removed;
        };
    }
}
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}
var boxedString = Object("a"),
    splitString = boxedString[0] != "a" || !(0 in boxedString);

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                fun.call(thisp, self[i], i, object);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                    object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    };
}
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }
        if (!length && arguments.length == 1) {
            throw new TypeError("reduce of empty array with no initial value");
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }
                if (++i >= length) {
                    throw new TypeError("reduce of empty array with no initial value");
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    };
}
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }
        if (!length && arguments.length == 1) {
            throw new TypeError("reduceRight of empty array with no initial value");
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }
                if (--i < 0) {
                    throw new TypeError("reduceRight of empty array with no initial value");
                }
            } while (true);
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    };
}
if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}
if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || (
            object.constructor ?
            object.constructor.prototype :
            prototypeOfObject
        );
    };
}
if (!Object.getOwnPropertyDescriptor) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a " +
                         "non-object: ";
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT + object);
        if (!owns(object, property))
            return;

        var descriptor, getter, setter;
        descriptor =  { enumerable: true, configurable: true };
        if (supportsAccessors) {
            var prototype = object.__proto__;
            object.__proto__ = prototypeOfObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) descriptor.get = getter;
                if (setter) descriptor.set = setter;
                return descriptor;
            }
        }
        descriptor.value = object[property];
        return descriptor;
    };
}
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}
if (!Object.create) {
    var createEmpty;
    if (Object.prototype.__proto__ === null) {
        createEmpty = function () {
            return { "__proto__": null };
        };
    } else {
        createEmpty = function () {
            var empty = {};
            for (var i in empty)
                empty[i] = null;
            empty.constructor =
            empty.hasOwnProperty =
            empty.propertyIsEnumerable =
            empty.isPrototypeOf =
            empty.toLocaleString =
            empty.toString =
            empty.valueOf =
            empty.__proto__ = null;
            return empty;
        }
    }

    Object.create = function create(prototype, properties) {
        var object;
        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype != "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
            object.__proto__ = prototype;
        }
        if (properties !== void 0)
            Object.defineProperties(object, properties);
        return object;
    };
}

function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, "sentinel", {});
        return "sentinel" in object;
    } catch (exception) {
    }
}
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document == "undefined" ||
        doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null)
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
            }
        }
        if (owns(descriptor, "value")) {

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                delete object[property];
                object[property] = descriptor.value;
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors)
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            if (owns(descriptor, "get"))
                defineGetter(object, property, descriptor.get);
            if (owns(descriptor, "set"))
                defineSetter(object, property, descriptor.set);
        }

        return object;
    };
}
if (!Object.defineProperties) {
    Object.defineProperties = function defineProperties(object, properties) {
        for (var property in properties) {
            if (owns(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}
if (!Object.seal) {
    Object.seal = function seal(object) {
        return object;
    };
}
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        return object;
    };
}
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object == "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        return object;
    };
}
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        if (Object(object) === object) {
            throw new TypeError(); // TODO message
        }
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}
if (!Object.keys) {
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if (
            (typeof object != "object" && typeof object != "function") ||
            object === null
        ) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    };
}

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
        input === null ||
        type === "undefined" ||
        type === "boolean" ||
        type === "number" ||
        type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toString = input.toString;
    if (typeof toString === "function") {
        val = toString.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    return Object(o);
};

});
 
define('ace/mode/xquery_worker', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/worker/mirror', 'ace/mode/xquery/JSONParseTreeHandler', 'ace/mode/xquery/XQueryParser', 'ace/mode/xquery/visitors/SemanticHighlighter'], function(require, exports, module) {

    
var oop = require("../lib/oop");
var Mirror = require("../worker/mirror").Mirror;
var JSONParseTreeHandler  = require("./xquery/JSONParseTreeHandler").JSONParseTreeHandler;
var XQueryParser  = require("./xquery/XQueryParser").XQueryParser;
var SemanticHighlighter = require("./xquery/visitors/SemanticHighlighter").SemanticHighlighter;

var XQueryWorker = exports.XQueryWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(200);
};

oop.inherits(XQueryWorker, Mirror);

(function() {
    
  this.onUpdate = function() {
    this.sender.emit("start");
    var value = this.doc.getValue();    
    var h = new JSONParseTreeHandler(value);
    var parser = new XQueryParser(value, h);
    try {
      parser.parse_XQuery();
      this.sender.emit("ok");
      var ast = h.getParseTree();
      var highlighter = new SemanticHighlighter(ast, value);
      var tokens = highlighter.getTokens();
      this.sender.emit("highlight", { tokens: tokens, lines: highlighter.lines });
    } catch(e) {
      if(e instanceof parser.ParseException) {
        var prefix = value.substring(0, e.getBegin());
        var line = prefix.split("\n").length;
        var column = e.getBegin() - prefix.lastIndexOf("\n");
        var message = parser.getErrorMessage(e);
        this.sender.emit("error", {
          row: line - 1,
          column: column,
          text: message,
          type: "error"
        });
      } else {
        throw e;
      }
    }
 };
    
}).call(XQueryWorker.prototype);

});

define('ace/lib/oop', ['require', 'exports', 'module' ], function(require, exports, module) {


exports.inherits = (function() {
    var createObject = Object.create || function(prototype, properties) {
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
        if (typeof properties !== 'undefined' && Object.defineProperties) {
            Object.defineProperties(object, properties);
        }
    };
    return function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = createObject(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };
}());

exports.mixin = function(obj, mixin) {
    for (var key in mixin) {
        obj[key] = mixin[key];
    }
    return obj;
};

exports.implement = function(proto, mixin) {
    exports.mixin(proto, mixin);
};

});
define('ace/worker/mirror', ['require', 'exports', 'module' , 'ace/document', 'ace/lib/lang'], function(require, exports, module) {


var Document = require("../document").Document;
var lang = require("../lib/lang");
    
var Mirror = exports.Mirror = function(sender) {
    this.sender = sender;
    var doc = this.doc = new Document("");
    
    var deferredUpdate = this.deferredUpdate = lang.delayedCall(this.onUpdate.bind(this));
    
    var _self = this;
    sender.on("change", function(e) {
        doc.applyDeltas(e.data);
        if (_self.$timeout)
            return deferredUpdate.schedule(_self.$timeout);
        _self.onUpdate();
    });
};

(function() {
    
    this.$timeout = 500;
    
    this.setTimeout = function(timeout) {
        this.$timeout = timeout;
    };
    
    this.setValue = function(value) {
        this.doc.setValue(value);
        this.deferredUpdate.schedule(this.$timeout);
    };
    
    this.getValue = function(callbackId) {
        this.sender.callback(this.doc.getValue(), callbackId);
    };
    
    this.onUpdate = function() {
    };
    
    this.isPending = function() {
        return this.deferredUpdate.isPending();
    };
    
}).call(Mirror.prototype);

});

define('ace/document', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/lib/event_emitter', 'ace/range', 'ace/anchor'], function(require, exports, module) {


var oop = require("./lib/oop");
var EventEmitter = require("./lib/event_emitter").EventEmitter;
var Range = require("./range").Range;
var Anchor = require("./anchor").Anchor;

var Document = function(text) {
    this.$lines = [];
    if (text.length == 0) {
        this.$lines = [""];
    } else if (Array.isArray(text)) {
        this._insertLines(0, text);
    } else {
        this.insert({row: 0, column:0}, text);
    }
};

(function() {

    oop.implement(this, EventEmitter);
    this.setValue = function(text) {
        var len = this.getLength();
        this.remove(new Range(0, 0, len, this.getLine(len-1).length));
        this.insert({row: 0, column:0}, text);
    };
    this.getValue = function() {
        return this.getAllLines().join(this.getNewLineCharacter());
    };
    this.createAnchor = function(row, column) {
        return new Anchor(this, row, column);
    };
    if ("aaa".split(/a/).length == 0)
        this.$split = function(text) {
            return text.replace(/\r\n|\r/g, "\n").split("\n");
        }
    else
        this.$split = function(text) {
            return text.split(/\r\n|\r|\n/);
        };


    this.$detectNewLine = function(text) {
        var match = text.match(/^.*?(\r\n|\r|\n)/m);
        this.$autoNewLine = match ? match[1] : "\n";
    };
    this.getNewLineCharacter = function() {
        switch (this.$newLineMode) {
          case "windows":
            return "\r\n";
          case "unix":
            return "\n";
          default:
            return this.$autoNewLine;
        }
    };

    this.$autoNewLine = "\n";
    this.$newLineMode = "auto";
    this.setNewLineMode = function(newLineMode) {
        if (this.$newLineMode === newLineMode)
            return;

        this.$newLineMode = newLineMode;
    };
    this.getNewLineMode = function() {
        return this.$newLineMode;
    };
    this.isNewLine = function(text) {
        return (text == "\r\n" || text == "\r" || text == "\n");
    };
    this.getLine = function(row) {
        return this.$lines[row] || "";
    };
    this.getLines = function(firstRow, lastRow) {
        return this.$lines.slice(firstRow, lastRow + 1);
    };
    this.getAllLines = function() {
        return this.getLines(0, this.getLength());
    };
    this.getLength = function() {
        return this.$lines.length;
    };
    this.getTextRange = function(range) {
        if (range.start.row == range.end.row) {
            return this.getLine(range.start.row)
                .substring(range.start.column, range.end.column);
        }
        var lines = this.getLines(range.start.row, range.end.row);
        lines[0] = (lines[0] || "").substring(range.start.column);
        var l = lines.length - 1;
        if (range.end.row - range.start.row == l)
            lines[l] = lines[l].substring(0, range.end.column);
        return lines.join(this.getNewLineCharacter());
    };

    this.$clipPosition = function(position) {
        var length = this.getLength();
        if (position.row >= length) {
            position.row = Math.max(0, length - 1);
            position.column = this.getLine(length-1).length;
        } else if (position.row < 0)
            position.row = 0;
        return position;
    };
    this.insert = function(position, text) {
        if (!text || text.length === 0)
            return position;

        position = this.$clipPosition(position);
        if (this.getLength() <= 1)
            this.$detectNewLine(text);

        var lines = this.$split(text);
        var firstLine = lines.splice(0, 1)[0];
        var lastLine = lines.length == 0 ? null : lines.splice(lines.length - 1, 1)[0];

        position = this.insertInLine(position, firstLine);
        if (lastLine !== null) {
            position = this.insertNewLine(position); // terminate first line
            position = this._insertLines(position.row, lines);
            position = this.insertInLine(position, lastLine || "");
        }
        return position;
    };
    this.insertLines = function(row, lines) {
        if (row >= this.getLength())
            return this.insert({row: row, column: 0}, "\n" + lines.join("\n"));
        return this._insertLines(Math.max(row, 0), lines);
    };
    this._insertLines = function(row, lines) {
        if (lines.length == 0)
            return {row: row, column: 0};
        if (lines.length > 0xFFFF) {
            var end = this._insertLines(row, lines.slice(0xFFFF));
            lines = lines.slice(0, 0xFFFF);
        }

        var args = [row, 0];
        args.push.apply(args, lines);
        this.$lines.splice.apply(this.$lines, args);

        var range = new Range(row, 0, row + lines.length, 0);
        var delta = {
            action: "insertLines",
            range: range,
            lines: lines
        };
        this._emit("change", { data: delta });
        return end || range.end;
    };
    this.insertNewLine = function(position) {
        position = this.$clipPosition(position);
        var line = this.$lines[position.row] || "";

        this.$lines[position.row] = line.substring(0, position.column);
        this.$lines.splice(position.row + 1, 0, line.substring(position.column, line.length));

        var end = {
            row : position.row + 1,
            column : 0
        };

        var delta = {
            action: "insertText",
            range: Range.fromPoints(position, end),
            text: this.getNewLineCharacter()
        };
        this._emit("change", { data: delta });

        return end;
    };
    this.insertInLine = function(position, text) {
        if (text.length == 0)
            return position;

        var line = this.$lines[position.row] || "";

        this.$lines[position.row] = line.substring(0, position.column) + text
                + line.substring(position.column);

        var end = {
            row : position.row,
            column : position.column + text.length
        };

        var delta = {
            action: "insertText",
            range: Range.fromPoints(position, end),
            text: text
        };
        this._emit("change", { data: delta });

        return end;
    };
    this.remove = function(range) {
        if (!range instanceof Range)
            range = Range.fromPoints(range.start, range.end);
        range.start = this.$clipPosition(range.start);
        range.end = this.$clipPosition(range.end);

        if (range.isEmpty())
            return range.start;

        var firstRow = range.start.row;
        var lastRow = range.end.row;

        if (range.isMultiLine()) {
            var firstFullRow = range.start.column == 0 ? firstRow : firstRow + 1;
            var lastFullRow = lastRow - 1;

            if (range.end.column > 0)
                this.removeInLine(lastRow, 0, range.end.column);

            if (lastFullRow >= firstFullRow)
                this._removeLines(firstFullRow, lastFullRow);

            if (firstFullRow != firstRow) {
                this.removeInLine(firstRow, range.start.column, this.getLine(firstRow).length);
                this.removeNewLine(range.start.row);
            }
        }
        else {
            this.removeInLine(firstRow, range.start.column, range.end.column);
        }
        return range.start;
    };
    this.removeInLine = function(row, startColumn, endColumn) {
        if (startColumn == endColumn)
            return;

        var range = new Range(row, startColumn, row, endColumn);
        var line = this.getLine(row);
        var removed = line.substring(startColumn, endColumn);
        var newLine = line.substring(0, startColumn) + line.substring(endColumn, line.length);
        this.$lines.splice(row, 1, newLine);

        var delta = {
            action: "removeText",
            range: range,
            text: removed
        };
        this._emit("change", { data: delta });
        return range.start;
    };
    this.removeLines = function(firstRow, lastRow) {
        if (firstRow < 0 || lastRow >= this.getLength())
            return this.remove(new Range(firstRow, 0, lastRow + 1, 0));
        return this._removeLines(firstRow, lastRow);
    };

    this._removeLines = function(firstRow, lastRow) {
        var range = new Range(firstRow, 0, lastRow + 1, 0);
        var removed = this.$lines.splice(firstRow, lastRow - firstRow + 1);

        var delta = {
            action: "removeLines",
            range: range,
            nl: this.getNewLineCharacter(),
            lines: removed
        };
        this._emit("change", { data: delta });
        return removed;
    };
    this.removeNewLine = function(row) {
        var firstLine = this.getLine(row);
        var secondLine = this.getLine(row+1);

        var range = new Range(row, firstLine.length, row+1, 0);
        var line = firstLine + secondLine;

        this.$lines.splice(row, 2, line);

        var delta = {
            action: "removeText",
            range: range,
            text: this.getNewLineCharacter()
        };
        this._emit("change", { data: delta });
    };
    this.replace = function(range, text) {
        if (!range instanceof Range)
            range = Range.fromPoints(range.start, range.end);
        if (text.length == 0 && range.isEmpty())
            return range.start;
        if (text == this.getTextRange(range))
            return range.end;

        this.remove(range);
        if (text) {
            var end = this.insert(range.start, text);
        }
        else {
            end = range.start;
        }

        return end;
    };
    this.applyDeltas = function(deltas) {
        for (var i=0; i<deltas.length; i++) {
            var delta = deltas[i];
            var range = Range.fromPoints(delta.range.start, delta.range.end);

            if (delta.action == "insertLines")
                this.insertLines(range.start.row, delta.lines);
            else if (delta.action == "insertText")
                this.insert(range.start, delta.text);
            else if (delta.action == "removeLines")
                this._removeLines(range.start.row, range.end.row - 1);
            else if (delta.action == "removeText")
                this.remove(range);
        }
    };
    this.revertDeltas = function(deltas) {
        for (var i=deltas.length-1; i>=0; i--) {
            var delta = deltas[i];

            var range = Range.fromPoints(delta.range.start, delta.range.end);

            if (delta.action == "insertLines")
                this._removeLines(range.start.row, range.end.row - 1);
            else if (delta.action == "insertText")
                this.remove(range);
            else if (delta.action == "removeLines")
                this._insertLines(range.start.row, delta.lines);
            else if (delta.action == "removeText")
                this.insert(range.start, delta.text);
        }
    };
    this.indexToPosition = function(index, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        for (var i = startRow || 0, l = lines.length; i < l; i++) {
            index -= lines[i].length + newlineLength;
            if (index < 0)
                return {row: i, column: index + lines[i].length + newlineLength};
        }
        return {row: l-1, column: lines[l-1].length};
    };
    this.positionToIndex = function(pos, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        var index = 0;
        var row = Math.min(pos.row, lines.length);
        for (var i = startRow || 0; i < row; ++i)
            index += lines[i].length + newlineLength;

        return index + pos.column;
    };

}).call(Document.prototype);

exports.Document = Document;
});

define('ace/lib/event_emitter', ['require', 'exports', 'module' ], function(require, exports, module) {


var EventEmitter = {};
var stopPropagation = function() { this.propagationStopped = true; };
var preventDefault = function() { this.defaultPrevented = true; };

EventEmitter._emit =
EventEmitter._dispatchEvent = function(eventName, e) {
    this._eventRegistry || (this._eventRegistry = {});
    this._defaultHandlers || (this._defaultHandlers = {});

    var listeners = this._eventRegistry[eventName] || [];
    var defaultHandler = this._defaultHandlers[eventName];
    if (!listeners.length && !defaultHandler)
        return;

    if (typeof e != "object" || !e)
        e = {};

    if (!e.type)
        e.type = eventName;
    if (!e.stopPropagation)
        e.stopPropagation = stopPropagation;
    if (!e.preventDefault)
        e.preventDefault = preventDefault;

    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++) {
        listeners[i](e, this);
        if (e.propagationStopped)
            break;
    }
    
    if (defaultHandler && !e.defaultPrevented)
        return defaultHandler(e, this);
};


EventEmitter._signal = function(eventName, e) {
    var listeners = (this._eventRegistry || {})[eventName];
    if (!listeners)
        return;
    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++)
        listeners[i](e, this);
};

EventEmitter.once = function(eventName, callback) {
    var _self = this;
    callback && this.addEventListener(eventName, function newCallback() {
        _self.removeEventListener(eventName, newCallback);
        callback.apply(null, arguments);
    });
};


EventEmitter.setDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers
    if (!handlers)
        handlers = this._defaultHandlers = {_disabled_: {}};
    
    if (handlers[eventName]) {
        var old = handlers[eventName];
        var disabled = handlers._disabled_[eventName];
        if (!disabled)
            handlers._disabled_[eventName] = disabled = [];
        disabled.push(old);
        var i = disabled.indexOf(callback);
        if (i != -1) 
            disabled.splice(i, 1);
    }
    handlers[eventName] = callback;
};
EventEmitter.removeDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers
    if (!handlers)
        return;
    var disabled = handlers._disabled_[eventName];
    
    if (handlers[eventName] == callback) {
        var old = handlers[eventName];
        if (disabled)
            this.setDefaultHandler(eventName, disabled.pop());
    } else if (disabled) {
        var i = disabled.indexOf(callback);
        if (i != -1)
            disabled.splice(i, 1);
    }
};

EventEmitter.on =
EventEmitter.addEventListener = function(eventName, callback, capturing) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        listeners = this._eventRegistry[eventName] = [];

    if (listeners.indexOf(callback) == -1)
        listeners[capturing ? "unshift" : "push"](callback);
    return callback;
};

EventEmitter.off =
EventEmitter.removeListener =
EventEmitter.removeEventListener = function(eventName, callback) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        return;

    var index = listeners.indexOf(callback);
    if (index !== -1)
        listeners.splice(index, 1);
};

EventEmitter.removeAllListeners = function(eventName) {
    if (this._eventRegistry) this._eventRegistry[eventName] = [];
};

exports.EventEmitter = EventEmitter;

});

define('ace/range', ['require', 'exports', 'module' ], function(require, exports, module) {

var comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};
var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};

(function() {
    this.isEqual = function(range) {
        return this.start.row === range.start.row &&
            this.end.row === range.end.row &&
            this.start.column === range.start.column &&
            this.end.column === range.end.column;
    };
    this.toString = function() {
        return ("Range: [" + this.start.row + "/" + this.start.column +
            "] -> [" + this.end.row + "/" + this.end.column + "]");
    };

    this.contains = function(row, column) {
        return this.compare(row, column) == 0;
    };
    this.compareRange = function(range) {
        var cmp,
            end = range.end,
            start = range.start;

        cmp = this.compare(end.row, end.column);
        if (cmp == 1) {
            cmp = this.compare(start.row, start.column);
            if (cmp == 1) {
                return 2;
            } else if (cmp == 0) {
                return 1;
            } else {
                return 0;
            }
        } else if (cmp == -1) {
            return -2;
        } else {
            cmp = this.compare(start.row, start.column);
            if (cmp == -1) {
                return -1;
            } else if (cmp == 1) {
                return 42;
            } else {
                return 0;
            }
        }
    };
    this.comparePoint = function(p) {
        return this.compare(p.row, p.column);
    };
    this.containsRange = function(range) {
        return this.comparePoint(range.start) == 0 && this.comparePoint(range.end) == 0;
    };
    this.intersects = function(range) {
        var cmp = this.compareRange(range);
        return (cmp == -1 || cmp == 0 || cmp == 1);
    };
    this.isEnd = function(row, column) {
        return this.end.row == row && this.end.column == column;
    };
    this.isStart = function(row, column) {
        return this.start.row == row && this.start.column == column;
    };
    this.setStart = function(row, column) {
        if (typeof row == "object") {
            this.start.column = row.column;
            this.start.row = row.row;
        } else {
            this.start.row = row;
            this.start.column = column;
        }
    };
    this.setEnd = function(row, column) {
        if (typeof row == "object") {
            this.end.column = row.column;
            this.end.row = row.row;
        } else {
            this.end.row = row;
            this.end.column = column;
        }
    };
    this.inside = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column) || this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideStart = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideEnd = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.compare = function(row, column) {
        if (!this.isMultiLine()) {
            if (row === this.start.row) {
                return column < this.start.column ? -1 : (column > this.end.column ? 1 : 0);
            };
        }

        if (row < this.start.row)
            return -1;

        if (row > this.end.row)
            return 1;

        if (this.start.row === row)
            return column >= this.start.column ? 0 : -1;

        if (this.end.row === row)
            return column <= this.end.column ? 0 : 1;

        return 0;
    };
    this.compareStart = function(row, column) {
        if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareEnd = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareInside = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.clipRows = function(firstRow, lastRow) {
        if (this.end.row > lastRow)
            var end = {row: lastRow + 1, column: 0};
        else if (this.end.row < firstRow)
            var end = {row: firstRow, column: 0};

        if (this.start.row > lastRow)
            var start = {row: lastRow + 1, column: 0};
        else if (this.start.row < firstRow)
            var start = {row: firstRow, column: 0};

        return Range.fromPoints(start || this.start, end || this.end);
    };
    this.extend = function(row, column) {
        var cmp = this.compare(row, column);

        if (cmp == 0)
            return this;
        else if (cmp == -1)
            var start = {row: row, column: column};
        else
            var end = {row: row, column: column};

        return Range.fromPoints(start || this.start, end || this.end);
    };

    this.isEmpty = function() {
        return (this.start.row === this.end.row && this.start.column === this.end.column);
    };
    this.isMultiLine = function() {
        return (this.start.row !== this.end.row);
    };
    this.clone = function() {
        return Range.fromPoints(this.start, this.end);
    };
    this.collapseRows = function() {
        if (this.end.column == 0)
            return new Range(this.start.row, 0, Math.max(this.start.row, this.end.row-1), 0)
        else
            return new Range(this.start.row, 0, this.end.row, 0)
    };
    this.toScreenRange = function(session) {
        var screenPosStart = session.documentToScreenPosition(this.start);
        var screenPosEnd = session.documentToScreenPosition(this.end);

        return new Range(
            screenPosStart.row, screenPosStart.column,
            screenPosEnd.row, screenPosEnd.column
        );
    };
    this.moveBy = function(row, column) {
        this.start.row += row;
        this.start.column += column;
        this.end.row += row;
        this.end.column += column;
    };

}).call(Range.prototype);
Range.fromPoints = function(start, end) {
    return new Range(start.row, start.column, end.row, end.column);
};
Range.comparePoints = comparePoints;

Range.comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};


exports.Range = Range;
});

define('ace/anchor', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/lib/event_emitter'], function(require, exports, module) {


var oop = require("./lib/oop");
var EventEmitter = require("./lib/event_emitter").EventEmitter;

var Anchor = exports.Anchor = function(doc, row, column) {
    this.$onChange = this.onChange.bind(this);
    this.attach(doc);
    
    if (typeof column == "undefined")
        this.setPosition(row.row, row.column);
    else
        this.setPosition(row, column);
};

(function() {

    oop.implement(this, EventEmitter);
    this.getPosition = function() {
        return this.$clipPositionToDocument(this.row, this.column);
    };
    this.getDocument = function() {
        return this.document;
    };
    this.$insertRight = false;
    this.onChange = function(e) {
        var delta = e.data;
        var range = delta.range;

        if (range.start.row == range.end.row && range.start.row != this.row)
            return;

        if (range.start.row > this.row)
            return;

        if (range.start.row == this.row && range.start.column > this.column)
            return;

        var row = this.row;
        var column = this.column;
        var start = range.start;
        var end = range.end;

        if (delta.action === "insertText") {
            if (start.row === row && start.column <= column) {
                if (start.column === column && this.$insertRight) {
                } else if (start.row === end.row) {
                    column += end.column - start.column;
                } else {
                    column -= start.column;
                    row += end.row - start.row;
                }
            } else if (start.row !== end.row && start.row < row) {
                row += end.row - start.row;
            }
        } else if (delta.action === "insertLines") {
            if (start.row <= row) {
                row += end.row - start.row;
            }
        } else if (delta.action === "removeText") {
            if (start.row === row && start.column < column) {
                if (end.column >= column)
                    column = start.column;
                else
                    column = Math.max(0, column - (end.column - start.column));

            } else if (start.row !== end.row && start.row < row) {
                if (end.row === row)
                    column = Math.max(0, column - end.column) + start.column;
                row -= (end.row - start.row);
            } else if (end.row === row) {
                row -= end.row - start.row;
                column = Math.max(0, column - end.column) + start.column;
            }
        } else if (delta.action == "removeLines") {
            if (start.row <= row) {
                if (end.row <= row)
                    row -= end.row - start.row;
                else {
                    row = start.row;
                    column = 0;
                }
            }
        }

        this.setPosition(row, column, true);
    };
    this.setPosition = function(row, column, noClip) {
        var pos;
        if (noClip) {
            pos = {
                row: row,
                column: column
            };
        } else {
            pos = this.$clipPositionToDocument(row, column);
        }

        if (this.row == pos.row && this.column == pos.column)
            return;

        var old = {
            row: this.row,
            column: this.column
        };

        this.row = pos.row;
        this.column = pos.column;
        this._emit("change", {
            old: old,
            value: pos
        });
    };
    this.detach = function() {
        this.document.removeEventListener("change", this.$onChange);
    };
    this.attach = function(doc) {
        this.document = doc || this.document;
        this.document.on("change", this.$onChange);
    };
    this.$clipPositionToDocument = function(row, column) {
        var pos = {};

        if (row >= this.document.getLength()) {
            pos.row = Math.max(0, this.document.getLength() - 1);
            pos.column = this.document.getLine(pos.row).length;
        }
        else if (row < 0) {
            pos.row = 0;
            pos.column = 0;
        }
        else {
            pos.row = row;
            pos.column = Math.min(this.document.getLine(pos.row).length, Math.max(0, column));
        }

        if (column < 0)
            pos.column = 0;

        return pos;
    };

}).call(Anchor.prototype);

});

define('ace/lib/lang', ['require', 'exports', 'module' ], function(require, exports, module) {


exports.stringReverse = function(string) {
    return string.split("").reverse().join("");
};

exports.stringRepeat = function (string, count) {
    var result = '';
    while (count > 0) {
        if (count & 1)
            result += string;

        if (count >>= 1)
            string += string;
    }
    return result;
};

var trimBeginRegexp = /^\s\s*/;
var trimEndRegexp = /\s\s*$/;

exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
};

exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
};

exports.copyObject = function(obj) {
    var copy = {};
    for (var key in obj) {
        copy[key] = obj[key];
    }
    return copy;
};

exports.copyArray = function(array){
    var copy = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject( array[i] );
        else 
            copy[i] = array[i];
    }
    return copy;
};

exports.deepCopy = function (obj) {
    if (typeof obj !== "object" || !obj)
        return obj;
    var cons = obj.constructor;
    if (cons === RegExp)
        return obj;
    
    var copy = cons();
    for (var key in obj) {
        if (typeof obj[key] === "object") {
            copy[key] = exports.deepCopy(obj[key]);
        } else {
            copy[key] = obj[key];
        }
    }
    return copy;
};

exports.arrayToMap = function(arr) {
    var map = {};
    for (var i=0; i<arr.length; i++) {
        map[arr[i]] = 1;
    }
    return map;

};

exports.createMap = function(props) {
    var map = Object.create(null);
    for (var i in props) {
        map[i] = props[i];
    }
    return map;
};
exports.arrayRemove = function(array, value) {
  for (var i = 0; i <= array.length; i++) {
    if (value === array[i]) {
      array.splice(i, 1);
    }
  }
};

exports.escapeRegExp = function(str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

exports.escapeHTML = function(str) {
    return str.replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;");
};

exports.getMatchOffsets = function(string, regExp) {
    var matches = [];

    string.replace(regExp, function(str) {
        matches.push({
            offset: arguments[arguments.length-2],
            length: str.length
        });
    });

    return matches;
};
exports.deferredCall = function(fcn) {

    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var deferred = function(timeout) {
        deferred.cancel();
        timer = setTimeout(callback, timeout || 0);
        return deferred;
    };

    deferred.schedule = deferred;

    deferred.call = function() {
        this.cancel();
        fcn();
        return deferred;
    };

    deferred.cancel = function() {
        clearTimeout(timer);
        timer = null;
        return deferred;
    };
    
    deferred.isPending = function() {
        return timer;
    };

    return deferred;
};


exports.delayedCall = function(fcn, defaultTimeout) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var _self = function(timeout) {
        if (timer == null)
            timer = setTimeout(callback, timeout || defaultTimeout);
    };

    _self.delay = function(timeout) {
        timer && clearTimeout(timer);
        timer = setTimeout(callback, timeout || defaultTimeout);
    };
    _self.schedule = _self;

    _self.call = function() {
        this.cancel();
        fcn();
    };

    _self.cancel = function() {
        timer && clearTimeout(timer);
        timer = null;
    };

    _self.isPending = function() {
        return timer;
    };

    return _self;
};
});
 
define('ace/mode/xquery/JSONParseTreeHandler', ['require', 'exports', 'module' ], function(require, exports, module) {

  var JSONParseTreeHandler = exports.JSONParseTreeHandler = function(code) {
    var list = [
        "OrExpr", "AndExpr", "ComparisonExpr", "StringConcatExpr", "RangeExpr"
        , "UnionExpr", "IntersectExceptExpr", "InstanceofExpr", "TreatExpr", "CastableExpr"
        , "CastExpr", "UnaryExpr", "ValueExpr", "FTContainsExpr", "SimpleMapExpr", "PathExpr", "RelativePathExpr"
        , "PostfixExpr", "StepExpr"
    ];
    
    var ast = null;
    var ptr = null;
    var remains = code;
    var cursor = 0;
    var lineCursor = 0;
    var line = 0;
    var col = 0;

    function createNode(name){
      return { name: name, children: [], getParent: null, pos: { sl: 0, sc: 0, el: 0, ec: 0 } };
    }
  
    function pushNode(name, begin){
      var node = createNode(name);
      if(ast === null) {
        ast = node;
        ptr = node;
      } else {
        node.getParent = ptr;
        ptr.children.push(node);
        ptr = ptr.children[ptr.children.length - 1];
      }
    }
    
    function popNode(){
     
      if(ptr.children.length > 0) {
        var s = ptr.children[0];
        var e = null;
        for(var i= ptr.children.length - 1; i >= 0;i--) {
          e = ptr.children[i];
          if(e.pos.el !== 0 || e.pos.ec !== 0) {
            break;
          }
        }
        ptr.pos.sl = s.pos.sl;
        ptr.pos.sc = s.pos.sc;
        ptr.pos.el = e.pos.el;
        ptr.pos.ec = e.pos.ec;
      }
      if(ptr.name === "FunctionName") {
        ptr.name = "EQName";  
      }
      if(ptr.name === "EQName" && ptr.value === undefined) {
        ptr.value = ptr.children[0].value;
        ptr.children.pop();
      }
      
      if(ptr.getParent !== null) {
        ptr = ptr.getParent;
      } else {
      }
      if(ptr.children.length > 0) {
        var lastChild = ptr.children[ptr.children.length - 1];
        if(lastChild.children.length === 1 && list.indexOf(lastChild.name) !== -1) {
          ptr.children[ptr.children.length - 1] = lastChild.children[0];
        }
      }
    }
    
    this.closeParseTree = function() {
      while(ptr.getParent !== null) {
        popNode();
      }
      popNode();
    };

    this.peek = function() {
      return ptr;    
    };
    
    this.getParseTree = function() {
      return ast;
    };
 
    this.reset = function(input) {};

    this.startNonterminal = function(name, begin) {
      pushNode(name, begin);
    };

    this.endNonterminal = function(name, end) {
      popNode();
    };

    this.terminal = function(name, begin, end) {
      name = (name.substring(0, 1) === "'" && name.substring(name.length - 1) === "'") ? "TOKEN" : name;
      pushNode(name, begin); 
      setValue(ptr, begin, end);
      popNode();
    };

    this.whitespace = function(begin, end) {
      var name = "WS";
      pushNode(name, begin);
      setValue(ptr, begin, end);
      popNode();
    };

    function setValue(node, begin, end) {
      
      var e = end - cursor;
      ptr.value = remains.substring(0, e); 
      remains = remains.substring(e);
      cursor = end;
      
      var sl = line;
      var sc = lineCursor;
      var el = sl + ptr.value.split("\n").length - 1;
      var lastIdx = ptr.value.lastIndexOf("\n");
      var ec = lastIdx === -1 ? sc + ptr.value.length : ptr.value.substring(lastIdx + 1).length;
      
      line = el;
      lineCursor = ec;

      ptr.pos.sl = sl; 
      ptr.pos.sc = sc; 
      ptr.pos.el = el; 
      ptr.pos.ec = ec; 
    } 
  };
});

                                                            define('ace/mode/xquery/XQueryParser', ['require', 'exports', 'module' ], function(require, exports, module) {
                                                            var XQueryParser = exports.XQueryParser = function XQueryParser(string, parsingEventHandler)
                                                            {
                                                              init(string, parsingEventHandler);
  var self = this;

  this.ParseException = function(b, e, s, o, x)
  {
    var
      begin = b,
      end = e,
      state = s,
      offending = o,
      expected = x;

    this.getBegin = function() {return begin;};
    this.getEnd = function() {return end;};
    this.getState = function() {return state;};
    this.getExpected = function() {return expected;};
    this.getOffending = function() {return offending;};

    this.getMessage = function()
    {
      return offending < 0 ? "lexical analysis failed" : "syntax error";
    };
  };

  function init(string, parsingEventHandler)
  {
    eventHandler = parsingEventHandler;
    input = string;
    size = string.length;
    reset(0, 0, 0);
  }

  this.getInput = function()
  {
    return input;
  };

  function reset(l, b, e)
  {
                 b0 = b; e0 = b;
    l1 = l; b1 = b; e1 = e;
    l2 = 0;
    end = e;
    ex = -1;
    memo = {};
    eventHandler.reset(input);
  }

  this.getOffendingToken = function(e)
  {
    var o = e.getOffending();
    return o >= 0 ? XQueryParser.TOKEN[o] : null;
  };

  this.getExpectedTokenSet = function(e)
  {
    var expected;
    if (e.getExpected() < 0)
    {
      expected = XQueryParser.getTokenSet(- e.getState());
    }
    else
    {
      expected = [XQueryParser.TOKEN[e.getExpected()]];
    }
    return expected;
  };

  this.getErrorMessage = function(e)
  {
    var tokenSet = this.getExpectedTokenSet(e);
    var found = this.getOffendingToken(e);
    var prefix = input.substring(0, e.getBegin());
    var lines = prefix.split("\n");
    var line = lines.length;
    var column = lines[line - 1].length + 1;
    var size = e.getEnd() - e.getBegin();
    return e.getMessage()
         + (found == null ? "" : ", found " + found)
         + "\nwhile expecting "
         + (tokenSet.length == 1 ? tokenSet[0] : ("[" + tokenSet.join(", ") + "]"))
         + "\n"
         + (size == 0 || found != null ? "" : "after successfully scanning " + size + " characters beginning ")
         + "at line " + line + ", column " + column + ":\n..."
         + input.substring(e.getBegin(), Math.min(input.length, e.getBegin() + 64))
         + "...";
  };

  this.parse_XQuery = function()
  {
    eventHandler.startNonterminal("XQuery", e0);
    lookahead1W(268);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Module();
    shift(25);                      // EOF
    eventHandler.endNonterminal("XQuery", e0);
  };

  function parse_Module()
  {
    eventHandler.startNonterminal("Module", e0);
    switch (l1)
    {
    case 274:                       // 'xquery'
      lookahead2W(199);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | '*' | '+' | ',' | '-' | '/' | '//' |
      break;
    default:
      lk = l1;
    }
    if (lk == 64274                 // 'xquery' 'encoding'
     || lk == 134930)               // 'xquery' 'version'
    {
      parse_VersionDecl();
    }
    lookahead1W(268);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    switch (l1)
    {
    case 182:                       // 'module'
      lookahead2W(194);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | '*' | '+' | ',' | '-' | '/' | '//' |
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 94390:                     // 'module' 'namespace'
      whitespace();
      parse_LibraryModule();
      break;
    default:
      whitespace();
      parse_MainModule();
    }
    eventHandler.endNonterminal("Module", e0);
  }

  function parse_VersionDecl()
  {
    eventHandler.startNonterminal("VersionDecl", e0);
    shift(274);                     // 'xquery'
    lookahead1W(116);               // S^WS | '(:' | 'encoding' | 'version'
    switch (l1)
    {
    case 125:                       // 'encoding'
      shift(125);                   // 'encoding'
      lookahead1W(17);              // StringLiteral | S^WS | '(:'
      shift(11);                    // StringLiteral
      break;
    default:
      shift(263);                   // 'version'
      lookahead1W(17);              // StringLiteral | S^WS | '(:'
      shift(11);                    // StringLiteral
      lookahead1W(109);             // S^WS | '(:' | ';' | 'encoding'
      if (l1 == 125)                // 'encoding'
      {
        shift(125);                 // 'encoding'
        lookahead1W(17);            // StringLiteral | S^WS | '(:'
        shift(11);                  // StringLiteral
      }
    }
    lookahead1W(28);                // S^WS | '(:' | ';'
    whitespace();
    parse_Separator();
    eventHandler.endNonterminal("VersionDecl", e0);
  }

  function parse_LibraryModule()
  {
    eventHandler.startNonterminal("LibraryModule", e0);
    parse_ModuleDecl();
    lookahead1W(138);               // S^WS | EOF | '(:' | 'declare' | 'import'
    whitespace();
    parse_Prolog();
    eventHandler.endNonterminal("LibraryModule", e0);
  }

  function parse_ModuleDecl()
  {
    eventHandler.startNonterminal("ModuleDecl", e0);
    shift(182);                     // 'module'
    lookahead1W(61);                // S^WS | '(:' | 'namespace'
    shift(184);                     // 'namespace'
    lookahead1W(247);               // NCName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_NCName();
    lookahead1W(29);                // S^WS | '(:' | '='
    shift(60);                      // '='
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    lookahead1W(28);                // S^WS | '(:' | ';'
    whitespace();
    parse_Separator();
    eventHandler.endNonterminal("ModuleDecl", e0);
  }

  function parse_Prolog()
  {
    eventHandler.startNonterminal("Prolog", e0);
    for (;;)
    {
      lookahead1W(268);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      switch (l1)
      {
      case 108:                     // 'declare'
        lookahead2W(213);           // S^WS | EOF | '!' | '!=' | '#' | '%' | '(' | '(:' | '*' | '+' | ',' | '-' | '/' |
        break;
      case 153:                     // 'import'
        lookahead2W(201);           // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | '*' | '+' | ',' | '-' | '/' | '//' |
        break;
      default:
        lk = l1;
      }
      if (lk != 42604               // 'declare' 'base-uri'
       && lk != 43628               // 'declare' 'boundary-space'
       && lk != 50284               // 'declare' 'construction'
       && lk != 53356               // 'declare' 'copy-namespaces'
       && lk != 54380               // 'declare' 'decimal-format'
       && lk != 55916               // 'declare' 'default'
       && lk != 72300               // 'declare' 'ft-option'
       && lk != 93337               // 'import' 'module'
       && lk != 94316               // 'declare' 'namespace'
       && lk != 104044              // 'declare' 'ordering'
       && lk != 113772              // 'declare' 'revalidation'
       && lk != 115353)             // 'import' 'schema'
      {
        break;
      }
      switch (l1)
      {
      case 108:                     // 'declare'
        lookahead2W(178);           // S^WS | '(:' | 'base-uri' | 'boundary-space' | 'construction' |
        break;
      default:
        lk = l1;
      }
      if (lk == 55916)              // 'declare' 'default'
      {
        lk = memoized(0, e0);
        if (lk == 0)
        {
          var b0A = b0; var e0A = e0; var l1A = l1;
          var b1A = b1; var e1A = e1; var l2A = l2;
          var b2A = b2; var e2A = e2;
          try
          {
            try_DefaultNamespaceDecl();
            lk = -1;
          }
          catch (p1A)
          {
            lk = -2;
          }
          b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
          b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
          b2 = b2A; e2 = e2A; end = e2A; }}
          memoize(0, e0, lk);
        }
      }
      switch (lk)
      {
      case -1:
        whitespace();
        parse_DefaultNamespaceDecl();
        break;
      case 94316:                   // 'declare' 'namespace'
        whitespace();
        parse_NamespaceDecl();
        break;
      case 153:                     // 'import'
        whitespace();
        parse_Import();
        break;
      case 72300:                   // 'declare' 'ft-option'
        whitespace();
        parse_FTOptionDecl();
        break;
      default:
        whitespace();
        parse_Setter();
      }
      lookahead1W(28);              // S^WS | '(:' | ';'
      whitespace();
      parse_Separator();
    }
    for (;;)
    {
      lookahead1W(268);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      switch (l1)
      {
      case 108:                     // 'declare'
        lookahead2W(210);           // S^WS | EOF | '!' | '!=' | '#' | '%' | '(' | '(:' | '*' | '+' | ',' | '-' | '/' |
        break;
      default:
        lk = l1;
      }
      if (lk != 16492               // 'declare' '%'
       && lk != 48748               // 'declare' 'collection'
       && lk != 51820               // 'declare' 'context'
       && lk != 74348               // 'declare' 'function'
       && lk != 79468               // 'declare' 'index'
       && lk != 82540               // 'declare' 'integrity'
       && lk != 101996              // 'declare' 'option'
       && lk != 131692              // 'declare' 'updating'
       && lk != 134252)             // 'declare' 'variable'
      {
        break;
      }
      switch (l1)
      {
      case 108:                     // 'declare'
        lookahead2W(175);           // S^WS | '%' | '(:' | 'collection' | 'context' | 'function' | 'index' |
        break;
      default:
        lk = l1;
      }
      switch (lk)
      {
      case 51820:                   // 'declare' 'context'
        whitespace();
        parse_ContextItemDecl();
        break;
      case 101996:                  // 'declare' 'option'
        whitespace();
        parse_OptionDecl();
        break;
      default:
        whitespace();
        parse_AnnotatedDecl();
      }
      lookahead1W(28);              // S^WS | '(:' | ';'
      whitespace();
      parse_Separator();
    }
    eventHandler.endNonterminal("Prolog", e0);
  }

  function parse_Separator()
  {
    eventHandler.startNonterminal("Separator", e0);
    shift(53);                      // ';'
    eventHandler.endNonterminal("Separator", e0);
  }

  function parse_Setter()
  {
    eventHandler.startNonterminal("Setter", e0);
    switch (l1)
    {
    case 108:                       // 'declare'
      lookahead2W(172);             // S^WS | '(:' | 'base-uri' | 'boundary-space' | 'construction' |
      break;
    default:
      lk = l1;
    }
    if (lk == 55916)                // 'declare' 'default'
    {
      lk = memoized(1, e0);
      if (lk == 0)
      {
        var b0A = b0; var e0A = e0; var l1A = l1;
        var b1A = b1; var e1A = e1; var l2A = l2;
        var b2A = b2; var e2A = e2;
        try
        {
          try_DefaultCollationDecl();
          lk = -2;
        }
        catch (p2A)
        {
          try
          {
            b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
            b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
            b2 = b2A; e2 = e2A; end = e2A; }}
            try_EmptyOrderDecl();
            lk = -6;
          }
          catch (p6A)
          {
            lk = -9;
          }
        }
        b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
        b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
        b2 = b2A; e2 = e2A; end = e2A; }}
        memoize(1, e0, lk);
      }
    }
    switch (lk)
    {
    case 43628:                     // 'declare' 'boundary-space'
      parse_BoundarySpaceDecl();
      break;
    case -2:
      parse_DefaultCollationDecl();
      break;
    case 42604:                     // 'declare' 'base-uri'
      parse_BaseURIDecl();
      break;
    case 50284:                     // 'declare' 'construction'
      parse_ConstructionDecl();
      break;
    case 104044:                    // 'declare' 'ordering'
      parse_OrderingModeDecl();
      break;
    case -6:
      parse_EmptyOrderDecl();
      break;
    case 113772:                    // 'declare' 'revalidation'
      parse_RevalidationDecl();
      break;
    case 53356:                     // 'declare' 'copy-namespaces'
      parse_CopyNamespacesDecl();
      break;
    default:
      parse_DecimalFormatDecl();
    }
    eventHandler.endNonterminal("Setter", e0);
  }

  function parse_BoundarySpaceDecl()
  {
    eventHandler.startNonterminal("BoundarySpaceDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(33);                // S^WS | '(:' | 'boundary-space'
    shift(85);                      // 'boundary-space'
    lookahead1W(133);               // S^WS | '(:' | 'preserve' | 'strip'
    switch (l1)
    {
    case 214:                       // 'preserve'
      shift(214);                   // 'preserve'
      break;
    default:
      shift(241);                   // 'strip'
    }
    eventHandler.endNonterminal("BoundarySpaceDecl", e0);
  }

  function parse_DefaultCollationDecl()
  {
    eventHandler.startNonterminal("DefaultCollationDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shift(109);                     // 'default'
    lookahead1W(38);                // S^WS | '(:' | 'collation'
    shift(94);                      // 'collation'
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    eventHandler.endNonterminal("DefaultCollationDecl", e0);
  }

  function try_DefaultCollationDecl()
  {
    shiftT(108);                    // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shiftT(109);                    // 'default'
    lookahead1W(38);                // S^WS | '(:' | 'collation'
    shiftT(94);                     // 'collation'
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shiftT(7);                      // URILiteral
  }

  function parse_BaseURIDecl()
  {
    eventHandler.startNonterminal("BaseURIDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(32);                // S^WS | '(:' | 'base-uri'
    shift(83);                      // 'base-uri'
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    eventHandler.endNonterminal("BaseURIDecl", e0);
  }

  function parse_ConstructionDecl()
  {
    eventHandler.startNonterminal("ConstructionDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(41);                // S^WS | '(:' | 'construction'
    shift(98);                      // 'construction'
    lookahead1W(133);               // S^WS | '(:' | 'preserve' | 'strip'
    switch (l1)
    {
    case 241:                       // 'strip'
      shift(241);                   // 'strip'
      break;
    default:
      shift(214);                   // 'preserve'
    }
    eventHandler.endNonterminal("ConstructionDecl", e0);
  }

  function parse_OrderingModeDecl()
  {
    eventHandler.startNonterminal("OrderingModeDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(68);                // S^WS | '(:' | 'ordering'
    shift(203);                     // 'ordering'
    lookahead1W(131);               // S^WS | '(:' | 'ordered' | 'unordered'
    switch (l1)
    {
    case 202:                       // 'ordered'
      shift(202);                   // 'ordered'
      break;
    default:
      shift(256);                   // 'unordered'
    }
    eventHandler.endNonterminal("OrderingModeDecl", e0);
  }

  function parse_EmptyOrderDecl()
  {
    eventHandler.startNonterminal("EmptyOrderDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shift(109);                     // 'default'
    lookahead1W(67);                // S^WS | '(:' | 'order'
    shift(201);                     // 'order'
    lookahead1W(49);                // S^WS | '(:' | 'empty'
    shift(123);                     // 'empty'
    lookahead1W(121);               // S^WS | '(:' | 'greatest' | 'least'
    switch (l1)
    {
    case 147:                       // 'greatest'
      shift(147);                   // 'greatest'
      break;
    default:
      shift(173);                   // 'least'
    }
    eventHandler.endNonterminal("EmptyOrderDecl", e0);
  }

  function try_EmptyOrderDecl()
  {
    shiftT(108);                    // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shiftT(109);                    // 'default'
    lookahead1W(67);                // S^WS | '(:' | 'order'
    shiftT(201);                    // 'order'
    lookahead1W(49);                // S^WS | '(:' | 'empty'
    shiftT(123);                    // 'empty'
    lookahead1W(121);               // S^WS | '(:' | 'greatest' | 'least'
    switch (l1)
    {
    case 147:                       // 'greatest'
      shiftT(147);                  // 'greatest'
      break;
    default:
      shiftT(173);                  // 'least'
    }
  }

  function parse_CopyNamespacesDecl()
  {
    eventHandler.startNonterminal("CopyNamespacesDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(44);                // S^WS | '(:' | 'copy-namespaces'
    shift(104);                     // 'copy-namespaces'
    lookahead1W(128);               // S^WS | '(:' | 'no-preserve' | 'preserve'
    whitespace();
    parse_PreserveMode();
    lookahead1W(25);                // S^WS | '(:' | ','
    shift(41);                      // ','
    lookahead1W(123);               // S^WS | '(:' | 'inherit' | 'no-inherit'
    whitespace();
    parse_InheritMode();
    eventHandler.endNonterminal("CopyNamespacesDecl", e0);
  }

  function parse_PreserveMode()
  {
    eventHandler.startNonterminal("PreserveMode", e0);
    switch (l1)
    {
    case 214:                       // 'preserve'
      shift(214);                   // 'preserve'
      break;
    default:
      shift(190);                   // 'no-preserve'
    }
    eventHandler.endNonterminal("PreserveMode", e0);
  }

  function parse_InheritMode()
  {
    eventHandler.startNonterminal("InheritMode", e0);
    switch (l1)
    {
    case 157:                       // 'inherit'
      shift(157);                   // 'inherit'
      break;
    default:
      shift(189);                   // 'no-inherit'
    }
    eventHandler.endNonterminal("InheritMode", e0);
  }

  function parse_DecimalFormatDecl()
  {
    eventHandler.startNonterminal("DecimalFormatDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(114);               // S^WS | '(:' | 'decimal-format' | 'default'
    switch (l1)
    {
    case 106:                       // 'decimal-format'
      shift(106);                   // 'decimal-format'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_EQName();
      break;
    default:
      shift(109);                   // 'default'
      lookahead1W(45);              // S^WS | '(:' | 'decimal-format'
      shift(106);                   // 'decimal-format'
    }
    for (;;)
    {
      lookahead1W(180);             // S^WS | '(:' | ';' | 'NaN' | 'decimal-separator' | 'digit' |
      if (l1 == 53)                 // ';'
      {
        break;
      }
      whitespace();
      parse_DFPropertyName();
      lookahead1W(29);              // S^WS | '(:' | '='
      shift(60);                    // '='
      lookahead1W(17);              // StringLiteral | S^WS | '(:'
      shift(11);                    // StringLiteral
    }
    eventHandler.endNonterminal("DecimalFormatDecl", e0);
  }

  function parse_DFPropertyName()
  {
    eventHandler.startNonterminal("DFPropertyName", e0);
    switch (l1)
    {
    case 107:                       // 'decimal-separator'
      shift(107);                   // 'decimal-separator'
      break;
    case 149:                       // 'grouping-separator'
      shift(149);                   // 'grouping-separator'
      break;
    case 156:                       // 'infinity'
      shift(156);                   // 'infinity'
      break;
    case 179:                       // 'minus-sign'
      shift(179);                   // 'minus-sign'
      break;
    case 67:                        // 'NaN'
      shift(67);                    // 'NaN'
      break;
    case 209:                       // 'percent'
      shift(209);                   // 'percent'
      break;
    case 208:                       // 'per-mille'
      shift(208);                   // 'per-mille'
      break;
    case 275:                       // 'zero-digit'
      shift(275);                   // 'zero-digit'
      break;
    case 116:                       // 'digit'
      shift(116);                   // 'digit'
      break;
    default:
      shift(207);                   // 'pattern-separator'
    }
    eventHandler.endNonterminal("DFPropertyName", e0);
  }

  function parse_Import()
  {
    eventHandler.startNonterminal("Import", e0);
    switch (l1)
    {
    case 153:                       // 'import'
      lookahead2W(126);             // S^WS | '(:' | 'module' | 'schema'
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 115353:                    // 'import' 'schema'
      parse_SchemaImport();
      break;
    default:
      parse_ModuleImport();
    }
    eventHandler.endNonterminal("Import", e0);
  }

  function parse_SchemaImport()
  {
    eventHandler.startNonterminal("SchemaImport", e0);
    shift(153);                     // 'import'
    lookahead1W(73);                // S^WS | '(:' | 'schema'
    shift(225);                     // 'schema'
    lookahead1W(137);               // URILiteral | S^WS | '(:' | 'default' | 'namespace'
    if (l1 != 7)                    // URILiteral
    {
      whitespace();
      parse_SchemaPrefix();
    }
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    lookahead1W(108);               // S^WS | '(:' | ';' | 'at'
    if (l1 == 81)                   // 'at'
    {
      shift(81);                    // 'at'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shift(7);                     // URILiteral
      for (;;)
      {
        lookahead1W(103);           // S^WS | '(:' | ',' | ';'
        if (l1 != 41)               // ','
        {
          break;
        }
        shift(41);                  // ','
        lookahead1W(15);            // URILiteral | S^WS | '(:'
        shift(7);                   // URILiteral
      }
    }
    eventHandler.endNonterminal("SchemaImport", e0);
  }

  function parse_SchemaPrefix()
  {
    eventHandler.startNonterminal("SchemaPrefix", e0);
    switch (l1)
    {
    case 184:                       // 'namespace'
      shift(184);                   // 'namespace'
      lookahead1W(247);             // NCName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_NCName();
      lookahead1W(29);              // S^WS | '(:' | '='
      shift(60);                    // '='
      break;
    default:
      shift(109);                   // 'default'
      lookahead1W(47);              // S^WS | '(:' | 'element'
      shift(121);                   // 'element'
      lookahead1W(61);              // S^WS | '(:' | 'namespace'
      shift(184);                   // 'namespace'
    }
    eventHandler.endNonterminal("SchemaPrefix", e0);
  }

  function parse_ModuleImport()
  {
    eventHandler.startNonterminal("ModuleImport", e0);
    shift(153);                     // 'import'
    lookahead1W(60);                // S^WS | '(:' | 'module'
    shift(182);                     // 'module'
    lookahead1W(90);                // URILiteral | S^WS | '(:' | 'namespace'
    if (l1 == 184)                  // 'namespace'
    {
      shift(184);                   // 'namespace'
      lookahead1W(247);             // NCName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_NCName();
      lookahead1W(29);              // S^WS | '(:' | '='
      shift(60);                    // '='
    }
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    lookahead1W(108);               // S^WS | '(:' | ';' | 'at'
    if (l1 == 81)                   // 'at'
    {
      shift(81);                    // 'at'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shift(7);                     // URILiteral
      for (;;)
      {
        lookahead1W(103);           // S^WS | '(:' | ',' | ';'
        if (l1 != 41)               // ','
        {
          break;
        }
        shift(41);                  // ','
        lookahead1W(15);            // URILiteral | S^WS | '(:'
        shift(7);                   // URILiteral
      }
    }
    eventHandler.endNonterminal("ModuleImport", e0);
  }

  function parse_NamespaceDecl()
  {
    eventHandler.startNonterminal("NamespaceDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(61);                // S^WS | '(:' | 'namespace'
    shift(184);                     // 'namespace'
    lookahead1W(247);               // NCName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_NCName();
    lookahead1W(29);                // S^WS | '(:' | '='
    shift(60);                      // '='
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    eventHandler.endNonterminal("NamespaceDecl", e0);
  }

  function parse_DefaultNamespaceDecl()
  {
    eventHandler.startNonterminal("DefaultNamespaceDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shift(109);                     // 'default'
    lookahead1W(115);               // S^WS | '(:' | 'element' | 'function'
    switch (l1)
    {
    case 121:                       // 'element'
      shift(121);                   // 'element'
      break;
    default:
      shift(145);                   // 'function'
    }
    lookahead1W(61);                // S^WS | '(:' | 'namespace'
    shift(184);                     // 'namespace'
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shift(7);                       // URILiteral
    eventHandler.endNonterminal("DefaultNamespaceDecl", e0);
  }

  function try_DefaultNamespaceDecl()
  {
    shiftT(108);                    // 'declare'
    lookahead1W(46);                // S^WS | '(:' | 'default'
    shiftT(109);                    // 'default'
    lookahead1W(115);               // S^WS | '(:' | 'element' | 'function'
    switch (l1)
    {
    case 121:                       // 'element'
      shiftT(121);                  // 'element'
      break;
    default:
      shiftT(145);                  // 'function'
    }
    lookahead1W(61);                // S^WS | '(:' | 'namespace'
    shiftT(184);                    // 'namespace'
    lookahead1W(15);                // URILiteral | S^WS | '(:'
    shiftT(7);                      // URILiteral
  }

  function parse_FTOptionDecl()
  {
    eventHandler.startNonterminal("FTOptionDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(52);                // S^WS | '(:' | 'ft-option'
    shift(141);                     // 'ft-option'
    lookahead1W(81);                // S^WS | '(:' | 'using'
    whitespace();
    parse_FTMatchOptions();
    eventHandler.endNonterminal("FTOptionDecl", e0);
  }

  function parse_AnnotatedDecl()
  {
    eventHandler.startNonterminal("AnnotatedDecl", e0);
    shift(108);                     // 'declare'
    for (;;)
    {
      lookahead1W(170);             // S^WS | '%' | '(:' | 'collection' | 'function' | 'index' | 'integrity' |
      if (l1 != 32                  // '%'
       && l1 != 257)                // 'updating'
      {
        break;
      }
      switch (l1)
      {
      case 257:                     // 'updating'
        whitespace();
        parse_CompatibilityAnnotation();
        break;
      default:
        whitespace();
        parse_Annotation();
      }
    }
    switch (l1)
    {
    case 262:                       // 'variable'
      whitespace();
      parse_VarDecl();
      break;
    case 145:                       // 'function'
      whitespace();
      parse_FunctionDecl();
      break;
    case 95:                        // 'collection'
      whitespace();
      parse_CollectionDecl();
      break;
    case 155:                       // 'index'
      whitespace();
      parse_IndexDecl();
      break;
    default:
      whitespace();
      parse_ICDecl();
    }
    eventHandler.endNonterminal("AnnotatedDecl", e0);
  }

  function parse_CompatibilityAnnotation()
  {
    eventHandler.startNonterminal("CompatibilityAnnotation", e0);
    shift(257);                     // 'updating'
    eventHandler.endNonterminal("CompatibilityAnnotation", e0);
  }

  function parse_Annotation()
  {
    eventHandler.startNonterminal("Annotation", e0);
    shift(32);                      // '%'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_EQName();
    lookahead1W(171);               // S^WS | '%' | '(' | '(:' | 'collection' | 'function' | 'index' | 'integrity' |
    if (l1 == 34)                   // '('
    {
      shift(34);                    // '('
      lookahead1W(154);             // IntegerLiteral | DecimalLiteral | DoubleLiteral | StringLiteral | S^WS | '(:'
      whitespace();
      parse_Literal();
      for (;;)
      {
        lookahead1W(101);           // S^WS | '(:' | ')' | ','
        if (l1 != 41)               // ','
        {
          break;
        }
        shift(41);                  // ','
        lookahead1W(154);           // IntegerLiteral | DecimalLiteral | DoubleLiteral | StringLiteral | S^WS | '(:'
        whitespace();
        parse_Literal();
      }
      shift(37);                    // ')'
    }
    eventHandler.endNonterminal("Annotation", e0);
  }

  function try_Annotation()
  {
    shiftT(32);                     // '%'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_EQName();
    lookahead1W(171);               // S^WS | '%' | '(' | '(:' | 'collection' | 'function' | 'index' | 'integrity' |
    if (l1 == 34)                   // '('
    {
      shiftT(34);                   // '('
      lookahead1W(154);             // IntegerLiteral | DecimalLiteral | DoubleLiteral | StringLiteral | S^WS | '(:'
      try_Literal();
      for (;;)
      {
        lookahead1W(101);           // S^WS | '(:' | ')' | ','
        if (l1 != 41)               // ','
        {
          break;
        }
        shiftT(41);                 // ','
        lookahead1W(154);           // IntegerLiteral | DecimalLiteral | DoubleLiteral | StringLiteral | S^WS | '(:'
        try_Literal();
      }
      shiftT(37);                   // ')'
    }
  }

  function parse_VarDecl()
  {
    eventHandler.startNonterminal("VarDecl", e0);
    shift(262);                     // 'variable'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    lookahead1W(147);               // S^WS | '(:' | ':=' | 'as' | 'external'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    lookahead1W(106);               // S^WS | '(:' | ':=' | 'external'
    switch (l1)
    {
    case 52:                        // ':='
      shift(52);                    // ':='
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_VarValue();
      break;
    default:
      shift(133);                   // 'external'
      lookahead1W(104);             // S^WS | '(:' | ':=' | ';'
      if (l1 == 52)                 // ':='
      {
        shift(52);                  // ':='
        lookahead1W(267);           // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
        whitespace();
        parse_VarDefaultValue();
      }
    }
    eventHandler.endNonterminal("VarDecl", e0);
  }

  function parse_VarValue()
  {
    eventHandler.startNonterminal("VarValue", e0);
    parse_ExprSingle();
    eventHandler.endNonterminal("VarValue", e0);
  }

  function parse_VarDefaultValue()
  {
    eventHandler.startNonterminal("VarDefaultValue", e0);
    parse_ExprSingle();
    eventHandler.endNonterminal("VarDefaultValue", e0);
  }

  function parse_ContextItemDecl()
  {
    eventHandler.startNonterminal("ContextItemDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(43);                // S^WS | '(:' | 'context'
    shift(101);                     // 'context'
    lookahead1W(55);                // S^WS | '(:' | 'item'
    shift(165);                     // 'item'
    lookahead1W(147);               // S^WS | '(:' | ':=' | 'as' | 'external'
    if (l1 == 79)                   // 'as'
    {
      shift(79);                    // 'as'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_ItemType();
    }
    lookahead1W(106);               // S^WS | '(:' | ':=' | 'external'
    switch (l1)
    {
    case 52:                        // ':='
      shift(52);                    // ':='
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_VarValue();
      break;
    default:
      shift(133);                   // 'external'
      lookahead1W(104);             // S^WS | '(:' | ':=' | ';'
      if (l1 == 52)                 // ':='
      {
        shift(52);                  // ':='
        lookahead1W(267);           // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
        whitespace();
        parse_VarDefaultValue();
      }
    }
    eventHandler.endNonterminal("ContextItemDecl", e0);
  }

  function parse_ParamList()
  {
    eventHandler.startNonterminal("ParamList", e0);
    parse_Param();
    for (;;)
    {
      lookahead1W(101);             // S^WS | '(:' | ')' | ','
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      whitespace();
      parse_Param();
    }
    eventHandler.endNonterminal("ParamList", e0);
  }

  function try_ParamList()
  {
    try_Param();
    for (;;)
    {
      lookahead1W(101);             // S^WS | '(:' | ')' | ','
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      try_Param();
    }
  }

  function parse_Param()
  {
    eventHandler.startNonterminal("Param", e0);
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_EQName();
    lookahead1W(143);               // S^WS | '(:' | ')' | ',' | 'as'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    eventHandler.endNonterminal("Param", e0);
  }

  function try_Param()
  {
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_EQName();
    lookahead1W(143);               // S^WS | '(:' | ')' | ',' | 'as'
    if (l1 == 79)                   // 'as'
    {
      try_TypeDeclaration();
    }
  }

  function parse_FunctionBody()
  {
    eventHandler.startNonterminal("FunctionBody", e0);
    parse_EnclosedExpr();
    eventHandler.endNonterminal("FunctionBody", e0);
  }

  function try_FunctionBody()
  {
    try_EnclosedExpr();
  }

  function parse_EnclosedExpr()
  {
    eventHandler.startNonterminal("EnclosedExpr", e0);
    shift(276);                     // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(282);                     // '}'
    eventHandler.endNonterminal("EnclosedExpr", e0);
  }

  function try_EnclosedExpr()
  {
    shiftT(276);                    // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(282);                    // '}'
  }

  function parse_OptionDecl()
  {
    eventHandler.startNonterminal("OptionDecl", e0);
    shift(108);                     // 'declare'
    lookahead1W(66);                // S^WS | '(:' | 'option'
    shift(199);                     // 'option'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_EQName();
    lookahead1W(17);                // StringLiteral | S^WS | '(:'
    shift(11);                      // StringLiteral
    eventHandler.endNonterminal("OptionDecl", e0);
  }

  function parse_Expr()
  {
    eventHandler.startNonterminal("Expr", e0);
    parse_ExprSingle();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_ExprSingle();
    }
    eventHandler.endNonterminal("Expr", e0);
  }

  function try_Expr()
  {
    try_ExprSingle();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_ExprSingle();
    }
  }

  function parse_FLWORExpr()
  {
    eventHandler.startNonterminal("FLWORExpr", e0);
    parse_InitialClause();
    for (;;)
    {
      lookahead1W(173);             // S^WS | '(:' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' | 'stable' |
      if (l1 == 220)                // 'return'
      {
        break;
      }
      whitespace();
      parse_IntermediateClause();
    }
    whitespace();
    parse_ReturnClause();
    eventHandler.endNonterminal("FLWORExpr", e0);
  }

  function try_FLWORExpr()
  {
    try_InitialClause();
    for (;;)
    {
      lookahead1W(173);             // S^WS | '(:' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' | 'stable' |
      if (l1 == 220)                // 'return'
      {
        break;
      }
      try_IntermediateClause();
    }
    try_ReturnClause();
  }

  function parse_InitialClause()
  {
    eventHandler.startNonterminal("InitialClause", e0);
    switch (l1)
    {
    case 137:                       // 'for'
      lookahead2W(141);             // S^WS | '$' | '(:' | 'sliding' | 'tumbling'
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 16009:                     // 'for' '$'
      parse_ForClause();
      break;
    case 174:                       // 'let'
      parse_LetClause();
      break;
    default:
      parse_WindowClause();
    }
    eventHandler.endNonterminal("InitialClause", e0);
  }

  function try_InitialClause()
  {
    switch (l1)
    {
    case 137:                       // 'for'
      lookahead2W(141);             // S^WS | '$' | '(:' | 'sliding' | 'tumbling'
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 16009:                     // 'for' '$'
      try_ForClause();
      break;
    case 174:                       // 'let'
      try_LetClause();
      break;
    default:
      try_WindowClause();
    }
  }

  function parse_IntermediateClause()
  {
    eventHandler.startNonterminal("IntermediateClause", e0);
    switch (l1)
    {
    case 137:                       // 'for'
    case 174:                       // 'let'
      parse_InitialClause();
      break;
    case 266:                       // 'where'
      parse_WhereClause();
      break;
    case 148:                       // 'group'
      parse_GroupByClause();
      break;
    case 105:                       // 'count'
      parse_CountClause();
      break;
    default:
      parse_OrderByClause();
    }
    eventHandler.endNonterminal("IntermediateClause", e0);
  }

  function try_IntermediateClause()
  {
    switch (l1)
    {
    case 137:                       // 'for'
    case 174:                       // 'let'
      try_InitialClause();
      break;
    case 266:                       // 'where'
      try_WhereClause();
      break;
    case 148:                       // 'group'
      try_GroupByClause();
      break;
    case 105:                       // 'count'
      try_CountClause();
      break;
    default:
      try_OrderByClause();
    }
  }

  function parse_ForClause()
  {
    eventHandler.startNonterminal("ForClause", e0);
    shift(137);                     // 'for'
    lookahead1W(21);                // S^WS | '$' | '(:'
    whitespace();
    parse_ForBinding();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      whitespace();
      parse_ForBinding();
    }
    eventHandler.endNonterminal("ForClause", e0);
  }

  function try_ForClause()
  {
    shiftT(137);                    // 'for'
    lookahead1W(21);                // S^WS | '$' | '(:'
    try_ForBinding();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      try_ForBinding();
    }
  }

  function parse_ForBinding()
  {
    eventHandler.startNonterminal("ForBinding", e0);
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    lookahead1W(164);               // S^WS | '(:' | 'allowing' | 'as' | 'at' | 'in' | 'score'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    lookahead1W(158);               // S^WS | '(:' | 'allowing' | 'at' | 'in' | 'score'
    if (l1 == 72)                   // 'allowing'
    {
      whitespace();
      parse_AllowingEmpty();
    }
    lookahead1W(150);               // S^WS | '(:' | 'at' | 'in' | 'score'
    if (l1 == 81)                   // 'at'
    {
      whitespace();
      parse_PositionalVar();
    }
    lookahead1W(122);               // S^WS | '(:' | 'in' | 'score'
    if (l1 == 228)                  // 'score'
    {
      whitespace();
      parse_FTScoreVar();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shift(154);                     // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("ForBinding", e0);
  }

  function try_ForBinding()
  {
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
    lookahead1W(164);               // S^WS | '(:' | 'allowing' | 'as' | 'at' | 'in' | 'score'
    if (l1 == 79)                   // 'as'
    {
      try_TypeDeclaration();
    }
    lookahead1W(158);               // S^WS | '(:' | 'allowing' | 'at' | 'in' | 'score'
    if (l1 == 72)                   // 'allowing'
    {
      try_AllowingEmpty();
    }
    lookahead1W(150);               // S^WS | '(:' | 'at' | 'in' | 'score'
    if (l1 == 81)                   // 'at'
    {
      try_PositionalVar();
    }
    lookahead1W(122);               // S^WS | '(:' | 'in' | 'score'
    if (l1 == 228)                  // 'score'
    {
      try_FTScoreVar();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shiftT(154);                    // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_AllowingEmpty()
  {
    eventHandler.startNonterminal("AllowingEmpty", e0);
    shift(72);                      // 'allowing'
    lookahead1W(49);                // S^WS | '(:' | 'empty'
    shift(123);                     // 'empty'
    eventHandler.endNonterminal("AllowingEmpty", e0);
  }

  function try_AllowingEmpty()
  {
    shiftT(72);                     // 'allowing'
    lookahead1W(49);                // S^WS | '(:' | 'empty'
    shiftT(123);                    // 'empty'
  }

  function parse_PositionalVar()
  {
    eventHandler.startNonterminal("PositionalVar", e0);
    shift(81);                      // 'at'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    eventHandler.endNonterminal("PositionalVar", e0);
  }

  function try_PositionalVar()
  {
    shiftT(81);                     // 'at'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
  }

  function parse_FTScoreVar()
  {
    eventHandler.startNonterminal("FTScoreVar", e0);
    shift(228);                     // 'score'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    eventHandler.endNonterminal("FTScoreVar", e0);
  }

  function try_FTScoreVar()
  {
    shiftT(228);                    // 'score'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
  }

  function parse_LetClause()
  {
    eventHandler.startNonterminal("LetClause", e0);
    shift(174);                     // 'let'
    lookahead1W(96);                // S^WS | '$' | '(:' | 'score'
    whitespace();
    parse_LetBinding();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(96);              // S^WS | '$' | '(:' | 'score'
      whitespace();
      parse_LetBinding();
    }
    eventHandler.endNonterminal("LetClause", e0);
  }

  function try_LetClause()
  {
    shiftT(174);                    // 'let'
    lookahead1W(96);                // S^WS | '$' | '(:' | 'score'
    try_LetBinding();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(96);              // S^WS | '$' | '(:' | 'score'
      try_LetBinding();
    }
  }

  function parse_LetBinding()
  {
    eventHandler.startNonterminal("LetBinding", e0);
    switch (l1)
    {
    case 31:                        // '$'
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_VarName();
      lookahead1W(105);             // S^WS | '(:' | ':=' | 'as'
      if (l1 == 79)                 // 'as'
      {
        whitespace();
        parse_TypeDeclaration();
      }
      break;
    default:
      parse_FTScoreVar();
    }
    lookahead1W(27);                // S^WS | '(:' | ':='
    shift(52);                      // ':='
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("LetBinding", e0);
  }

  function try_LetBinding()
  {
    switch (l1)
    {
    case 31:                        // '$'
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_VarName();
      lookahead1W(105);             // S^WS | '(:' | ':=' | 'as'
      if (l1 == 79)                 // 'as'
      {
        try_TypeDeclaration();
      }
      break;
    default:
      try_FTScoreVar();
    }
    lookahead1W(27);                // S^WS | '(:' | ':='
    shiftT(52);                     // ':='
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_WindowClause()
  {
    eventHandler.startNonterminal("WindowClause", e0);
    shift(137);                     // 'for'
    lookahead1W(135);               // S^WS | '(:' | 'sliding' | 'tumbling'
    switch (l1)
    {
    case 251:                       // 'tumbling'
      whitespace();
      parse_TumblingWindowClause();
      break;
    default:
      whitespace();
      parse_SlidingWindowClause();
    }
    eventHandler.endNonterminal("WindowClause", e0);
  }

  function try_WindowClause()
  {
    shiftT(137);                    // 'for'
    lookahead1W(135);               // S^WS | '(:' | 'sliding' | 'tumbling'
    switch (l1)
    {
    case 251:                       // 'tumbling'
      try_TumblingWindowClause();
      break;
    default:
      try_SlidingWindowClause();
    }
  }

  function parse_TumblingWindowClause()
  {
    eventHandler.startNonterminal("TumblingWindowClause", e0);
    shift(251);                     // 'tumbling'
    lookahead1W(85);                // S^WS | '(:' | 'window'
    shift(269);                     // 'window'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shift(154);                     // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    whitespace();
    parse_WindowStartCondition();
    if (l1 == 126                   // 'end'
     || l1 == 198)                  // 'only'
    {
      whitespace();
      parse_WindowEndCondition();
    }
    eventHandler.endNonterminal("TumblingWindowClause", e0);
  }

  function try_TumblingWindowClause()
  {
    shiftT(251);                    // 'tumbling'
    lookahead1W(85);                // S^WS | '(:' | 'window'
    shiftT(269);                    // 'window'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      try_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shiftT(154);                    // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
    try_WindowStartCondition();
    if (l1 == 126                   // 'end'
     || l1 == 198)                  // 'only'
    {
      try_WindowEndCondition();
    }
  }

  function parse_SlidingWindowClause()
  {
    eventHandler.startNonterminal("SlidingWindowClause", e0);
    shift(234);                     // 'sliding'
    lookahead1W(85);                // S^WS | '(:' | 'window'
    shift(269);                     // 'window'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shift(154);                     // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    whitespace();
    parse_WindowStartCondition();
    whitespace();
    parse_WindowEndCondition();
    eventHandler.endNonterminal("SlidingWindowClause", e0);
  }

  function try_SlidingWindowClause()
  {
    shiftT(234);                    // 'sliding'
    lookahead1W(85);                // S^WS | '(:' | 'window'
    shiftT(269);                    // 'window'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      try_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shiftT(154);                    // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
    try_WindowStartCondition();
    try_WindowEndCondition();
  }

  function parse_WindowStartCondition()
  {
    eventHandler.startNonterminal("WindowStartCondition", e0);
    shift(237);                     // 'start'
    lookahead1W(163);               // S^WS | '$' | '(:' | 'at' | 'next' | 'previous' | 'when'
    whitespace();
    parse_WindowVars();
    lookahead1W(83);                // S^WS | '(:' | 'when'
    shift(265);                     // 'when'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("WindowStartCondition", e0);
  }

  function try_WindowStartCondition()
  {
    shiftT(237);                    // 'start'
    lookahead1W(163);               // S^WS | '$' | '(:' | 'at' | 'next' | 'previous' | 'when'
    try_WindowVars();
    lookahead1W(83);                // S^WS | '(:' | 'when'
    shiftT(265);                    // 'when'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_WindowEndCondition()
  {
    eventHandler.startNonterminal("WindowEndCondition", e0);
    if (l1 == 198)                  // 'only'
    {
      shift(198);                   // 'only'
    }
    lookahead1W(50);                // S^WS | '(:' | 'end'
    shift(126);                     // 'end'
    lookahead1W(163);               // S^WS | '$' | '(:' | 'at' | 'next' | 'previous' | 'when'
    whitespace();
    parse_WindowVars();
    lookahead1W(83);                // S^WS | '(:' | 'when'
    shift(265);                     // 'when'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("WindowEndCondition", e0);
  }

  function try_WindowEndCondition()
  {
    if (l1 == 198)                  // 'only'
    {
      shiftT(198);                  // 'only'
    }
    lookahead1W(50);                // S^WS | '(:' | 'end'
    shiftT(126);                    // 'end'
    lookahead1W(163);               // S^WS | '$' | '(:' | 'at' | 'next' | 'previous' | 'when'
    try_WindowVars();
    lookahead1W(83);                // S^WS | '(:' | 'when'
    shiftT(265);                    // 'when'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_WindowVars()
  {
    eventHandler.startNonterminal("WindowVars", e0);
    if (l1 == 31)                   // '$'
    {
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_CurrentItem();
    }
    lookahead1W(159);               // S^WS | '(:' | 'at' | 'next' | 'previous' | 'when'
    if (l1 == 81)                   // 'at'
    {
      whitespace();
      parse_PositionalVar();
    }
    lookahead1W(153);               // S^WS | '(:' | 'next' | 'previous' | 'when'
    if (l1 == 215)                  // 'previous'
    {
      shift(215);                   // 'previous'
      lookahead1W(21);              // S^WS | '$' | '(:'
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_PreviousItem();
    }
    lookahead1W(127);               // S^WS | '(:' | 'next' | 'when'
    if (l1 == 187)                  // 'next'
    {
      shift(187);                   // 'next'
      lookahead1W(21);              // S^WS | '$' | '(:'
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_NextItem();
    }
    eventHandler.endNonterminal("WindowVars", e0);
  }

  function try_WindowVars()
  {
    if (l1 == 31)                   // '$'
    {
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_CurrentItem();
    }
    lookahead1W(159);               // S^WS | '(:' | 'at' | 'next' | 'previous' | 'when'
    if (l1 == 81)                   // 'at'
    {
      try_PositionalVar();
    }
    lookahead1W(153);               // S^WS | '(:' | 'next' | 'previous' | 'when'
    if (l1 == 215)                  // 'previous'
    {
      shiftT(215);                  // 'previous'
      lookahead1W(21);              // S^WS | '$' | '(:'
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_PreviousItem();
    }
    lookahead1W(127);               // S^WS | '(:' | 'next' | 'when'
    if (l1 == 187)                  // 'next'
    {
      shiftT(187);                  // 'next'
      lookahead1W(21);              // S^WS | '$' | '(:'
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_NextItem();
    }
  }

  function parse_CurrentItem()
  {
    eventHandler.startNonterminal("CurrentItem", e0);
    parse_EQName();
    eventHandler.endNonterminal("CurrentItem", e0);
  }

  function try_CurrentItem()
  {
    try_EQName();
  }

  function parse_PreviousItem()
  {
    eventHandler.startNonterminal("PreviousItem", e0);
    parse_EQName();
    eventHandler.endNonterminal("PreviousItem", e0);
  }

  function try_PreviousItem()
  {
    try_EQName();
  }

  function parse_NextItem()
  {
    eventHandler.startNonterminal("NextItem", e0);
    parse_EQName();
    eventHandler.endNonterminal("NextItem", e0);
  }

  function try_NextItem()
  {
    try_EQName();
  }

  function parse_CountClause()
  {
    eventHandler.startNonterminal("CountClause", e0);
    shift(105);                     // 'count'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    eventHandler.endNonterminal("CountClause", e0);
  }

  function try_CountClause()
  {
    shiftT(105);                    // 'count'
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
  }

  function parse_WhereClause()
  {
    eventHandler.startNonterminal("WhereClause", e0);
    shift(266);                     // 'where'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("WhereClause", e0);
  }

  function try_WhereClause()
  {
    shiftT(266);                    // 'where'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_GroupByClause()
  {
    eventHandler.startNonterminal("GroupByClause", e0);
    shift(148);                     // 'group'
    lookahead1W(34);                // S^WS | '(:' | 'by'
    shift(87);                      // 'by'
    lookahead1W(21);                // S^WS | '$' | '(:'
    whitespace();
    parse_GroupingSpecList();
    eventHandler.endNonterminal("GroupByClause", e0);
  }

  function try_GroupByClause()
  {
    shiftT(148);                    // 'group'
    lookahead1W(34);                // S^WS | '(:' | 'by'
    shiftT(87);                     // 'by'
    lookahead1W(21);                // S^WS | '$' | '(:'
    try_GroupingSpecList();
  }

  function parse_GroupingSpecList()
  {
    eventHandler.startNonterminal("GroupingSpecList", e0);
    parse_GroupingSpec();
    for (;;)
    {
      lookahead1W(176);             // S^WS | '(:' | ',' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' |
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      whitespace();
      parse_GroupingSpec();
    }
    eventHandler.endNonterminal("GroupingSpecList", e0);
  }

  function try_GroupingSpecList()
  {
    try_GroupingSpec();
    for (;;)
    {
      lookahead1W(176);             // S^WS | '(:' | ',' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' |
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      try_GroupingSpec();
    }
  }

  function parse_GroupingSpec()
  {
    eventHandler.startNonterminal("GroupingSpec", e0);
    parse_GroupingVariable();
    lookahead1W(182);               // S^WS | '(:' | ',' | ':=' | 'as' | 'collation' | 'count' | 'for' | 'group' |
    if (l1 == 52                    // ':='
     || l1 == 79)                   // 'as'
    {
      if (l1 == 79)                 // 'as'
      {
        whitespace();
        parse_TypeDeclaration();
      }
      lookahead1W(27);              // S^WS | '(:' | ':='
      shift(52);                    // ':='
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_ExprSingle();
    }
    if (l1 == 94)                   // 'collation'
    {
      shift(94);                    // 'collation'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shift(7);                     // URILiteral
    }
    eventHandler.endNonterminal("GroupingSpec", e0);
  }

  function try_GroupingSpec()
  {
    try_GroupingVariable();
    lookahead1W(182);               // S^WS | '(:' | ',' | ':=' | 'as' | 'collation' | 'count' | 'for' | 'group' |
    if (l1 == 52                    // ':='
     || l1 == 79)                   // 'as'
    {
      if (l1 == 79)                 // 'as'
      {
        try_TypeDeclaration();
      }
      lookahead1W(27);              // S^WS | '(:' | ':='
      shiftT(52);                   // ':='
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_ExprSingle();
    }
    if (l1 == 94)                   // 'collation'
    {
      shiftT(94);                   // 'collation'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shiftT(7);                    // URILiteral
    }
  }

  function parse_GroupingVariable()
  {
    eventHandler.startNonterminal("GroupingVariable", e0);
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    eventHandler.endNonterminal("GroupingVariable", e0);
  }

  function try_GroupingVariable()
  {
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
  }

  function parse_OrderByClause()
  {
    eventHandler.startNonterminal("OrderByClause", e0);
    switch (l1)
    {
    case 201:                       // 'order'
      shift(201);                   // 'order'
      lookahead1W(34);              // S^WS | '(:' | 'by'
      shift(87);                    // 'by'
      break;
    default:
      shift(236);                   // 'stable'
      lookahead1W(67);              // S^WS | '(:' | 'order'
      shift(201);                   // 'order'
      lookahead1W(34);              // S^WS | '(:' | 'by'
      shift(87);                    // 'by'
    }
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_OrderSpecList();
    eventHandler.endNonterminal("OrderByClause", e0);
  }

  function try_OrderByClause()
  {
    switch (l1)
    {
    case 201:                       // 'order'
      shiftT(201);                  // 'order'
      lookahead1W(34);              // S^WS | '(:' | 'by'
      shiftT(87);                   // 'by'
      break;
    default:
      shiftT(236);                  // 'stable'
      lookahead1W(67);              // S^WS | '(:' | 'order'
      shiftT(201);                  // 'order'
      lookahead1W(34);              // S^WS | '(:' | 'by'
      shiftT(87);                   // 'by'
    }
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_OrderSpecList();
  }

  function parse_OrderSpecList()
  {
    eventHandler.startNonterminal("OrderSpecList", e0);
    parse_OrderSpec();
    for (;;)
    {
      lookahead1W(176);             // S^WS | '(:' | ',' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' |
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_OrderSpec();
    }
    eventHandler.endNonterminal("OrderSpecList", e0);
  }

  function try_OrderSpecList()
  {
    try_OrderSpec();
    for (;;)
    {
      lookahead1W(176);             // S^WS | '(:' | ',' | 'count' | 'for' | 'group' | 'let' | 'order' | 'return' |
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_OrderSpec();
    }
  }

  function parse_OrderSpec()
  {
    eventHandler.startNonterminal("OrderSpec", e0);
    parse_ExprSingle();
    whitespace();
    parse_OrderModifier();
    eventHandler.endNonterminal("OrderSpec", e0);
  }

  function try_OrderSpec()
  {
    try_ExprSingle();
    try_OrderModifier();
  }

  function parse_OrderModifier()
  {
    eventHandler.startNonterminal("OrderModifier", e0);
    if (l1 == 80                    // 'ascending'
     || l1 == 113)                  // 'descending'
    {
      switch (l1)
      {
      case 80:                      // 'ascending'
        shift(80);                  // 'ascending'
        break;
      default:
        shift(113);                 // 'descending'
      }
    }
    lookahead1W(179);               // S^WS | '(:' | ',' | 'collation' | 'count' | 'empty' | 'for' | 'group' | 'let' |
    if (l1 == 123)                  // 'empty'
    {
      shift(123);                   // 'empty'
      lookahead1W(121);             // S^WS | '(:' | 'greatest' | 'least'
      switch (l1)
      {
      case 147:                     // 'greatest'
        shift(147);                 // 'greatest'
        break;
      default:
        shift(173);                 // 'least'
      }
    }
    lookahead1W(177);               // S^WS | '(:' | ',' | 'collation' | 'count' | 'for' | 'group' | 'let' | 'order' |
    if (l1 == 94)                   // 'collation'
    {
      shift(94);                    // 'collation'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shift(7);                     // URILiteral
    }
    eventHandler.endNonterminal("OrderModifier", e0);
  }

  function try_OrderModifier()
  {
    if (l1 == 80                    // 'ascending'
     || l1 == 113)                  // 'descending'
    {
      switch (l1)
      {
      case 80:                      // 'ascending'
        shiftT(80);                 // 'ascending'
        break;
      default:
        shiftT(113);                // 'descending'
      }
    }
    lookahead1W(179);               // S^WS | '(:' | ',' | 'collation' | 'count' | 'empty' | 'for' | 'group' | 'let' |
    if (l1 == 123)                  // 'empty'
    {
      shiftT(123);                  // 'empty'
      lookahead1W(121);             // S^WS | '(:' | 'greatest' | 'least'
      switch (l1)
      {
      case 147:                     // 'greatest'
        shiftT(147);                // 'greatest'
        break;
      default:
        shiftT(173);                // 'least'
      }
    }
    lookahead1W(177);               // S^WS | '(:' | ',' | 'collation' | 'count' | 'for' | 'group' | 'let' | 'order' |
    if (l1 == 94)                   // 'collation'
    {
      shiftT(94);                   // 'collation'
      lookahead1W(15);              // URILiteral | S^WS | '(:'
      shiftT(7);                    // URILiteral
    }
  }

  function parse_ReturnClause()
  {
    eventHandler.startNonterminal("ReturnClause", e0);
    shift(220);                     // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("ReturnClause", e0);
  }

  function try_ReturnClause()
  {
    shiftT(220);                    // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_QuantifiedExpr()
  {
    eventHandler.startNonterminal("QuantifiedExpr", e0);
    switch (l1)
    {
    case 235:                       // 'some'
      shift(235);                   // 'some'
      break;
    default:
      shift(129);                   // 'every'
    }
    lookahead1W(21);                // S^WS | '$' | '(:'
    shift(31);                      // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      whitespace();
      parse_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shift(154);                     // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shift(41);                    // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_VarName();
      lookahead1W(110);             // S^WS | '(:' | 'as' | 'in'
      if (l1 == 79)                 // 'as'
      {
        whitespace();
        parse_TypeDeclaration();
      }
      lookahead1W(53);              // S^WS | '(:' | 'in'
      shift(154);                   // 'in'
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_ExprSingle();
    }
    shift(224);                     // 'satisfies'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("QuantifiedExpr", e0);
  }

  function try_QuantifiedExpr()
  {
    switch (l1)
    {
    case 235:                       // 'some'
      shiftT(235);                  // 'some'
      break;
    default:
      shiftT(129);                  // 'every'
    }
    lookahead1W(21);                // S^WS | '$' | '(:'
    shiftT(31);                     // '$'
    lookahead1W(253);               // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_VarName();
    lookahead1W(110);               // S^WS | '(:' | 'as' | 'in'
    if (l1 == 79)                   // 'as'
    {
      try_TypeDeclaration();
    }
    lookahead1W(53);                // S^WS | '(:' | 'in'
    shiftT(154);                    // 'in'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
    for (;;)
    {
      if (l1 != 41)                 // ','
      {
        break;
      }
      shiftT(41);                   // ','
      lookahead1W(21);              // S^WS | '$' | '(:'
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_VarName();
      lookahead1W(110);             // S^WS | '(:' | 'as' | 'in'
      if (l1 == 79)                 // 'as'
      {
        try_TypeDeclaration();
      }
      lookahead1W(53);              // S^WS | '(:' | 'in'
      shiftT(154);                  // 'in'
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_ExprSingle();
    }
    shiftT(224);                    // 'satisfies'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_SwitchExpr()
  {
    eventHandler.startNonterminal("SwitchExpr", e0);
    shift(243);                     // 'switch'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shift(34);                      // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(37);                      // ')'
    for (;;)
    {
      lookahead1W(35);              // S^WS | '(:' | 'case'
      whitespace();
      parse_SwitchCaseClause();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shift(109);                     // 'default'
    lookahead1W(70);                // S^WS | '(:' | 'return'
    shift(220);                     // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("SwitchExpr", e0);
  }

  function try_SwitchExpr()
  {
    shiftT(243);                    // 'switch'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shiftT(34);                     // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(37);                     // ')'
    for (;;)
    {
      lookahead1W(35);              // S^WS | '(:' | 'case'
      try_SwitchCaseClause();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shiftT(109);                    // 'default'
    lookahead1W(70);                // S^WS | '(:' | 'return'
    shiftT(220);                    // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_SwitchCaseClause()
  {
    eventHandler.startNonterminal("SwitchCaseClause", e0);
    for (;;)
    {
      shift(88);                    // 'case'
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_SwitchCaseOperand();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shift(220);                     // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("SwitchCaseClause", e0);
  }

  function try_SwitchCaseClause()
  {
    for (;;)
    {
      shiftT(88);                   // 'case'
      lookahead1W(267);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_SwitchCaseOperand();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shiftT(220);                    // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_SwitchCaseOperand()
  {
    eventHandler.startNonterminal("SwitchCaseOperand", e0);
    parse_ExprSingle();
    eventHandler.endNonterminal("SwitchCaseOperand", e0);
  }

  function try_SwitchCaseOperand()
  {
    try_ExprSingle();
  }

  function parse_TypeswitchExpr()
  {
    eventHandler.startNonterminal("TypeswitchExpr", e0);
    shift(253);                     // 'typeswitch'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shift(34);                      // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(37);                      // ')'
    for (;;)
    {
      lookahead1W(35);              // S^WS | '(:' | 'case'
      whitespace();
      parse_CaseClause();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shift(109);                     // 'default'
    lookahead1W(95);                // S^WS | '$' | '(:' | 'return'
    if (l1 == 31)                   // '$'
    {
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_VarName();
    }
    lookahead1W(70);                // S^WS | '(:' | 'return'
    shift(220);                     // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("TypeswitchExpr", e0);
  }

  function try_TypeswitchExpr()
  {
    shiftT(253);                    // 'typeswitch'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shiftT(34);                     // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(37);                     // ')'
    for (;;)
    {
      lookahead1W(35);              // S^WS | '(:' | 'case'
      try_CaseClause();
      if (l1 != 88)                 // 'case'
      {
        break;
      }
    }
    shiftT(109);                    // 'default'
    lookahead1W(95);                // S^WS | '$' | '(:' | 'return'
    if (l1 == 31)                   // '$'
    {
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_VarName();
    }
    lookahead1W(70);                // S^WS | '(:' | 'return'
    shiftT(220);                    // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_CaseClause()
  {
    eventHandler.startNonterminal("CaseClause", e0);
    shift(88);                      // 'case'
    lookahead1W(260);               // EQName^Token | S^WS | '$' | '%' | '(' | '(:' | 'after' | 'allowing' |
    if (l1 == 31)                   // '$'
    {
      shift(31);                    // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_VarName();
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shift(79);                    // 'as'
    }
    lookahead1W(259);               // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_SequenceTypeUnion();
    shift(220);                     // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("CaseClause", e0);
  }

  function try_CaseClause()
  {
    shiftT(88);                     // 'case'
    lookahead1W(260);               // EQName^Token | S^WS | '$' | '%' | '(' | '(:' | 'after' | 'allowing' |
    if (l1 == 31)                   // '$'
    {
      shiftT(31);                   // '$'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_VarName();
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shiftT(79);                   // 'as'
    }
    lookahead1W(259);               // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_SequenceTypeUnion();
    shiftT(220);                    // 'return'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_SequenceTypeUnion()
  {
    eventHandler.startNonterminal("SequenceTypeUnion", e0);
    parse_SequenceType();
    for (;;)
    {
      lookahead1W(134);             // S^WS | '(:' | 'return' | '|'
      if (l1 != 279)                // '|'
      {
        break;
      }
      shift(279);                   // '|'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_SequenceType();
    }
    eventHandler.endNonterminal("SequenceTypeUnion", e0);
  }

  function try_SequenceTypeUnion()
  {
    try_SequenceType();
    for (;;)
    {
      lookahead1W(134);             // S^WS | '(:' | 'return' | '|'
      if (l1 != 279)                // '|'
      {
        break;
      }
      shiftT(279);                  // '|'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_SequenceType();
    }
  }

  function parse_IfExpr()
  {
    eventHandler.startNonterminal("IfExpr", e0);
    shift(152);                     // 'if'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shift(34);                      // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(37);                      // ')'
    lookahead1W(77);                // S^WS | '(:' | 'then'
    shift(245);                     // 'then'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    shift(122);                     // 'else'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_ExprSingle();
    eventHandler.endNonterminal("IfExpr", e0);
  }

  function try_IfExpr()
  {
    shiftT(152);                    // 'if'
    lookahead1W(22);                // S^WS | '(' | '(:'
    shiftT(34);                     // '('
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(37);                     // ')'
    lookahead1W(77);                // S^WS | '(:' | 'then'
    shiftT(245);                    // 'then'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
    shiftT(122);                    // 'else'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_ExprSingle();
  }

  function parse_TryCatchExpr()
  {
    eventHandler.startNonterminal("TryCatchExpr", e0);
    parse_TryClause();
    for (;;)
    {
      lookahead1W(36);              // S^WS | '(:' | 'catch'
      whitespace();
      parse_CatchClause();
      lookahead1W(184);             // S^WS | EOF | '(:' | ')' | ',' | ':' | ';' | ']' | 'after' | 'as' | 'ascending' |
      if (l1 != 91)                 // 'catch'
      {
        break;
      }
    }
    eventHandler.endNonterminal("TryCatchExpr", e0);
  }

  function try_TryCatchExpr()
  {
    try_TryClause();
    for (;;)
    {
      lookahead1W(36);              // S^WS | '(:' | 'catch'
      try_CatchClause();
      lookahead1W(184);             // S^WS | EOF | '(:' | ')' | ',' | ':' | ';' | ']' | 'after' | 'as' | 'ascending' |
      if (l1 != 91)                 // 'catch'
      {
        break;
      }
    }
  }

  function parse_TryClause()
  {
    eventHandler.startNonterminal("TryClause", e0);
    shift(250);                     // 'try'
    lookahead1W(87);                // S^WS | '(:' | '{'
    shift(276);                     // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_TryTargetExpr();
    shift(282);                     // '}'
    eventHandler.endNonterminal("TryClause", e0);
  }

  function try_TryClause()
  {
    shiftT(250);                    // 'try'
    lookahead1W(87);                // S^WS | '(:' | '{'
    shiftT(276);                    // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_TryTargetExpr();
    shiftT(282);                    // '}'
  }

  function parse_TryTargetExpr()
  {
    eventHandler.startNonterminal("TryTargetExpr", e0);
    parse_Expr();
    eventHandler.endNonterminal("TryTargetExpr", e0);
  }

  function try_TryTargetExpr()
  {
    try_Expr();
  }

  function parse_CatchClause()
  {
    eventHandler.startNonterminal("CatchClause", e0);
    shift(91);                      // 'catch'
    lookahead1W(255);               // Wildcard | EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    whitespace();
    parse_CatchErrorList();
    shift(276);                     // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(282);                     // '}'
    eventHandler.endNonterminal("CatchClause", e0);
  }

  function try_CatchClause()
  {
    shiftT(91);                     // 'catch'
    lookahead1W(255);               // Wildcard | EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
    try_CatchErrorList();
    shiftT(276);                    // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(282);                    // '}'
  }

  function parse_CatchErrorList()
  {
    eventHandler.startNonterminal("CatchErrorList", e0);
    parse_NameTest();
    for (;;)
    {
      lookahead1W(136);             // S^WS | '(:' | '{' | '|'
      if (l1 != 279)                // '|'
      {
        break;
      }
      shift(279);                   // '|'
      lookahead1W(255);             // Wildcard | EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_NameTest();
    }
    eventHandler.endNonterminal("CatchErrorList", e0);
  }

  function try_CatchErrorList()
  {
    try_NameTest();
    for (;;)
    {
      lookahead1W(136);             // S^WS | '(:' | '{' | '|'
      if (l1 != 279)                // '|'
      {
        break;
      }
      shiftT(279);                  // '|'
      lookahead1W(255);             // Wildcard | EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_NameTest();
    }
  }

  function parse_OrExpr()
  {
    eventHandler.startNonterminal("OrExpr", e0);
    parse_AndExpr();
    for (;;)
    {
      if (l1 != 200)                // 'or'
      {
        break;
      }
      shift(200);                   // 'or'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_AndExpr();
    }
    eventHandler.endNonterminal("OrExpr", e0);
  }

  function try_OrExpr()
  {
    try_AndExpr();
    for (;;)
    {
      if (l1 != 200)                // 'or'
      {
        break;
      }
      shiftT(200);                  // 'or'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_AndExpr();
    }
  }

  function parse_AndExpr()
  {
    eventHandler.startNonterminal("AndExpr", e0);
    parse_ComparisonExpr();
    for (;;)
    {
      if (l1 != 75)                 // 'and'
      {
        break;
      }
      shift(75);                    // 'and'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_ComparisonExpr();
    }
    eventHandler.endNonterminal("AndExpr", e0);
  }

  function try_AndExpr()
  {
    try_ComparisonExpr();
    for (;;)
    {
      if (l1 != 75)                 // 'and'
      {
        break;
      }
      shiftT(75);                   // 'and'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_ComparisonExpr();
    }
  }

  function parse_ComparisonExpr()
  {
    eventHandler.startNonterminal("ComparisonExpr", e0);
    parse_FTContainsExpr();
    if (l1 == 27                    // '!='
     || l1 == 54                    // '<'
     || l1 == 57                    // '<<'
     || l1 == 58                    // '<='
     || l1 == 60                    // '='
     || l1 == 61                    // '>'
     || l1 == 62                    // '>='
     || l1 == 63                    // '>>'
     || l1 == 128                   // 'eq'
     || l1 == 146                   // 'ge'
     || l1 == 150                   // 'gt'
     || l1 == 164                   // 'is'
     || l1 == 172                   // 'le'
     || l1 == 178                   // 'lt'
     || l1 == 186)                  // 'ne'
    {
      switch (l1)
      {
      case 128:                     // 'eq'
      case 146:                     // 'ge'
      case 150:                     // 'gt'
      case 172:                     // 'le'
      case 178:                     // 'lt'
      case 186:                     // 'ne'
        whitespace();
        parse_ValueComp();
        break;
      case 57:                      // '<<'
      case 63:                      // '>>'
      case 164:                     // 'is'
        whitespace();
        parse_NodeComp();
        break;
      default:
        whitespace();
        parse_GeneralComp();
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_FTContainsExpr();
    }
    eventHandler.endNonterminal("ComparisonExpr", e0);
  }

  function try_ComparisonExpr()
  {
    try_FTContainsExpr();
    if (l1 == 27                    // '!='
     || l1 == 54                    // '<'
     || l1 == 57                    // '<<'
     || l1 == 58                    // '<='
     || l1 == 60                    // '='
     || l1 == 61                    // '>'
     || l1 == 62                    // '>='
     || l1 == 63                    // '>>'
     || l1 == 128                   // 'eq'
     || l1 == 146                   // 'ge'
     || l1 == 150                   // 'gt'
     || l1 == 164                   // 'is'
     || l1 == 172                   // 'le'
     || l1 == 178                   // 'lt'
     || l1 == 186)                  // 'ne'
    {
      switch (l1)
      {
      case 128:                     // 'eq'
      case 146:                     // 'ge'
      case 150:                     // 'gt'
      case 172:                     // 'le'
      case 178:                     // 'lt'
      case 186:                     // 'ne'
        try_ValueComp();
        break;
      case 57:                      // '<<'
      case 63:                      // '>>'
      case 164:                     // 'is'
        try_NodeComp();
        break;
      default:
        try_GeneralComp();
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_FTContainsExpr();
    }
  }

  function parse_FTContainsExpr()
  {
    eventHandler.startNonterminal("FTContainsExpr", e0);
    parse_StringConcatExpr();
    if (l1 == 99)                   // 'contains'
    {
      shift(99);                    // 'contains'
      lookahead1W(76);              // S^WS | '(:' | 'text'
      shift(244);                   // 'text'
      lookahead1W(162);             // StringLiteral | S^WS | '(' | '(#' | '(:' | 'ftnot' | '{'
      whitespace();
      parse_FTSelection();
      if (l1 == 271)                // 'without'
      {
        whitespace();
        parse_FTIgnoreOption();
      }
    }
    eventHandler.endNonterminal("FTContainsExpr", e0);
  }

  function try_FTContainsExpr()
  {
    try_StringConcatExpr();
    if (l1 == 99)                   // 'contains'
    {
      shiftT(99);                   // 'contains'
      lookahead1W(76);              // S^WS | '(:' | 'text'
      shiftT(244);                  // 'text'
      lookahead1W(162);             // StringLiteral | S^WS | '(' | '(#' | '(:' | 'ftnot' | '{'
      try_FTSelection();
      if (l1 == 271)                // 'without'
      {
        try_FTIgnoreOption();
      }
    }
  }

  function parse_StringConcatExpr()
  {
    eventHandler.startNonterminal("StringConcatExpr", e0);
    parse_RangeExpr();
    for (;;)
    {
      if (l1 != 280)                // '||'
      {
        break;
      }
      shift(280);                   // '||'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_RangeExpr();
    }
    eventHandler.endNonterminal("StringConcatExpr", e0);
  }

  function try_StringConcatExpr()
  {
    try_RangeExpr();
    for (;;)
    {
      if (l1 != 280)                // '||'
      {
        break;
      }
      shiftT(280);                  // '||'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_RangeExpr();
    }
  }

  function parse_RangeExpr()
  {
    eventHandler.startNonterminal("RangeExpr", e0);
    parse_AdditiveExpr();
    if (l1 == 248)                  // 'to'
    {
      shift(248);                   // 'to'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_AdditiveExpr();
    }
    eventHandler.endNonterminal("RangeExpr", e0);
  }

  function try_RangeExpr()
  {
    try_AdditiveExpr();
    if (l1 == 248)                  // 'to'
    {
      shiftT(248);                  // 'to'
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_AdditiveExpr();
    }
  }

  function parse_AdditiveExpr()
  {
    eventHandler.startNonterminal("AdditiveExpr", e0);
    parse_MultiplicativeExpr();
    for (;;)
    {
      if (l1 != 40                  // '+'
       && l1 != 42)                 // '-'
      {
        break;
      }
      switch (l1)
      {
      case 40:                      // '+'
        shift(40);                  // '+'
        break;
      default:
        shift(42);                  // '-'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_MultiplicativeExpr();
    }
    eventHandler.endNonterminal("AdditiveExpr", e0);
  }

  function try_AdditiveExpr()
  {
    try_MultiplicativeExpr();
    for (;;)
    {
      if (l1 != 40                  // '+'
       && l1 != 42)                 // '-'
      {
        break;
      }
      switch (l1)
      {
      case 40:                      // '+'
        shiftT(40);                 // '+'
        break;
      default:
        shiftT(42);                 // '-'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_MultiplicativeExpr();
    }
  }

  function parse_MultiplicativeExpr()
  {
    eventHandler.startNonterminal("MultiplicativeExpr", e0);
    parse_UnionExpr();
    for (;;)
    {
      if (l1 != 38                  // '*'
       && l1 != 118                 // 'div'
       && l1 != 151                 // 'idiv'
       && l1 != 180)                // 'mod'
      {
        break;
      }
      switch (l1)
      {
      case 38:                      // '*'
        shift(38);                  // '*'
        break;
      case 118:                     // 'div'
        shift(118);                 // 'div'
        break;
      case 151:                     // 'idiv'
        shift(151);                 // 'idiv'
        break;
      default:
        shift(180);                 // 'mod'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_UnionExpr();
    }
    eventHandler.endNonterminal("MultiplicativeExpr", e0);
  }

  function try_MultiplicativeExpr()
  {
    try_UnionExpr();
    for (;;)
    {
      if (l1 != 38                  // '*'
       && l1 != 118                 // 'div'
       && l1 != 151                 // 'idiv'
       && l1 != 180)                // 'mod'
      {
        break;
      }
      switch (l1)
      {
      case 38:                      // '*'
        shiftT(38);                 // '*'
        break;
      case 118:                     // 'div'
        shiftT(118);                // 'div'
        break;
      case 151:                     // 'idiv'
        shiftT(151);                // 'idiv'
        break;
      default:
        shiftT(180);                // 'mod'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_UnionExpr();
    }
  }

  function parse_UnionExpr()
  {
    eventHandler.startNonterminal("UnionExpr", e0);
    parse_IntersectExceptExpr();
    for (;;)
    {
      if (l1 != 254                 // 'union'
       && l1 != 279)                // '|'
      {
        break;
      }
      switch (l1)
      {
      case 254:                     // 'union'
        shift(254);                 // 'union'
        break;
      default:
        shift(279);                 // '|'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_IntersectExceptExpr();
    }
    eventHandler.endNonterminal("UnionExpr", e0);
  }

  function try_UnionExpr()
  {
    try_IntersectExceptExpr();
    for (;;)
    {
      if (l1 != 254                 // 'union'
       && l1 != 279)                // '|'
      {
        break;
      }
      switch (l1)
      {
      case 254:                     // 'union'
        shiftT(254);                // 'union'
        break;
      default:
        shiftT(279);                // '|'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_IntersectExceptExpr();
    }
  }

  function parse_IntersectExceptExpr()
  {
    eventHandler.startNonterminal("IntersectExceptExpr", e0);
    parse_InstanceofExpr();
    for (;;)
    {
      lookahead1W(222);             // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
      if (l1 != 131                 // 'except'
       && l1 != 162)                // 'intersect'
      {
        break;
      }
      switch (l1)
      {
      case 162:                     // 'intersect'
        shift(162);                 // 'intersect'
        break;
      default:
        shift(131);                 // 'except'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_InstanceofExpr();
    }
    eventHandler.endNonterminal("IntersectExceptExpr", e0);
  }

  function try_IntersectExceptExpr()
  {
    try_InstanceofExpr();
    for (;;)
    {
      lookahead1W(222);             // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
      if (l1 != 131                 // 'except'
       && l1 != 162)                // 'intersect'
      {
        break;
      }
      switch (l1)
      {
      case 162:                     // 'intersect'
        shiftT(162);                // 'intersect'
        break;
      default:
        shiftT(131);                // 'except'
      }
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_InstanceofExpr();
    }
  }

  function parse_InstanceofExpr()
  {
    eventHandler.startNonterminal("InstanceofExpr", e0);
    parse_TreatExpr();
    lookahead1W(223);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 160)                  // 'instance'
    {
      shift(160);                   // 'instance'
      lookahead1W(64);              // S^WS | '(:' | 'of'
      shift(196);                   // 'of'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_SequenceType();
    }
    eventHandler.endNonterminal("InstanceofExpr", e0);
  }

  function try_InstanceofExpr()
  {
    try_TreatExpr();
    lookahead1W(223);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 160)                  // 'instance'
    {
      shiftT(160);                  // 'instance'
      lookahead1W(64);              // S^WS | '(:' | 'of'
      shiftT(196);                  // 'of'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_SequenceType();
    }
  }

  function parse_TreatExpr()
  {
    eventHandler.startNonterminal("TreatExpr", e0);
    parse_CastableExpr();
    lookahead1W(224);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 249)                  // 'treat'
    {
      shift(249);                   // 'treat'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shift(79);                    // 'as'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_SequenceType();
    }
    eventHandler.endNonterminal("TreatExpr", e0);
  }

  function try_TreatExpr()
  {
    try_CastableExpr();
    lookahead1W(224);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 249)                  // 'treat'
    {
      shiftT(249);                  // 'treat'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shiftT(79);                   // 'as'
      lookahead1W(259);             // EQName^Token | S^WS | '%' | '(' | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_SequenceType();
    }
  }

  function parse_CastableExpr()
  {
    eventHandler.startNonterminal("CastableExpr", e0);
    parse_CastExpr();
    lookahead1W(225);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 90)                   // 'castable'
    {
      shift(90);                    // 'castable'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shift(79);                    // 'as'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_SingleType();
    }
    eventHandler.endNonterminal("CastableExpr", e0);
  }

  function try_CastableExpr()
  {
    try_CastExpr();
    lookahead1W(225);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 90)                   // 'castable'
    {
      shiftT(90);                   // 'castable'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shiftT(79);                   // 'as'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_SingleType();
    }
  }

  function parse_CastExpr()
  {
    eventHandler.startNonterminal("CastExpr", e0);
    parse_UnaryExpr();
    lookahead1W(227);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 89)                   // 'cast'
    {
      shift(89);                    // 'cast'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shift(79);                    // 'as'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      whitespace();
      parse_SingleType();
    }
    eventHandler.endNonterminal("CastExpr", e0);
  }

  function try_CastExpr()
  {
    try_UnaryExpr();
    lookahead1W(227);               // S^WS | EOF | '!=' | '(:' | ')' | '*' | '+' | ',' | '-' | ':' | ';' | '<' | '<<' |
    if (l1 == 89)                   // 'cast'
    {
      shiftT(89);                   // 'cast'
      lookahead1W(30);              // S^WS | '(:' | 'as'
      shiftT(79);                   // 'as'
      lookahead1W(253);             // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
      try_SingleType();
    }
  }

  function parse_UnaryExpr()
  {
    eventHandler.startNonterminal("UnaryExpr", e0);
    for (;;)
    {
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      if (l1 != 40                  // '+'
       && l1 != 42)                 // '-'
      {
        break;
      }
      switch (l1)
      {
      case 42:                      // '-'
        shift(42);                  // '-'
        break;
      default:
        shift(40);                  // '+'
      }
    }
    whitespace();
    parse_ValueExpr();
    eventHandler.endNonterminal("UnaryExpr", e0);
  }

  function try_UnaryExpr()
  {
    for (;;)
    {
      lookahead1W(265);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      if (l1 != 40                  // '+'
       && l1 != 42)                 // '-'
      {
        break;
      }
      switch (l1)
      {
      case 42:                      // '-'
        shiftT(42);                 // '-'
        break;
      default:
        shiftT(40);                 // '+'
      }
    }
    try_ValueExpr();
  }

  function parse_ValueExpr()
  {
    eventHandler.startNonterminal("ValueExpr", e0);
    switch (l1)
    {
    case 260:                       // 'validate'
      lookahead2W(246);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 87812:                     // 'validate' 'lax'
    case 123140:                    // 'validate' 'strict'
    case 129284:                    // 'validate' 'type'
    case 141572:                    // 'validate' '{'
      parse_ValidateExpr();
      break;
    case 35:                        // '(#'
      parse_ExtensionExpr();
      break;
    default:
      parse_SimpleMapExpr();
    }
    eventHandler.endNonterminal("ValueExpr", e0);
  }

  function try_ValueExpr()
  {
    switch (l1)
    {
    case 260:                       // 'validate'
      lookahead2W(246);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    default:
      lk = l1;
    }
    switch (lk)
    {
    case 87812:                     // 'validate' 'lax'
    case 123140:                    // 'validate' 'strict'
    case 129284:                    // 'validate' 'type'
    case 141572:                    // 'validate' '{'
      try_ValidateExpr();
      break;
    case 35:                        // '(#'
      try_ExtensionExpr();
      break;
    default:
      try_SimpleMapExpr();
    }
  }

  function parse_SimpleMapExpr()
  {
    eventHandler.startNonterminal("SimpleMapExpr", e0);
    parse_PathExpr();
    for (;;)
    {
      if (l1 != 26)                 // '!'
      {
        break;
      }
      shift(26);                    // '!'
      lookahead1W(264);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_PathExpr();
    }
    eventHandler.endNonterminal("SimpleMapExpr", e0);
  }

  function try_SimpleMapExpr()
  {
    try_PathExpr();
    for (;;)
    {
      if (l1 != 26)                 // '!'
      {
        break;
      }
      shiftT(26);                   // '!'
      lookahead1W(264);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_PathExpr();
    }
  }

  function parse_GeneralComp()
  {
    eventHandler.startNonterminal("GeneralComp", e0);
    switch (l1)
    {
    case 60:                        // '='
      shift(60);                    // '='
      break;
    case 27:                        // '!='
      shift(27);                    // '!='
      break;
    case 54:                        // '<'
      shift(54);                    // '<'
      break;
    case 58:                        // '<='
      shift(58);                    // '<='
      break;
    case 61:                        // '>'
      shift(61);                    // '>'
      break;
    default:
      shift(62);                    // '>='
    }
    eventHandler.endNonterminal("GeneralComp", e0);
  }

  function try_GeneralComp()
  {
    switch (l1)
    {
    case 60:                        // '='
      shiftT(60);                   // '='
      break;
    case 27:                        // '!='
      shiftT(27);                   // '!='
      break;
    case 54:                        // '<'
      shiftT(54);                   // '<'
      break;
    case 58:                        // '<='
      shiftT(58);                   // '<='
      break;
    case 61:                        // '>'
      shiftT(61);                   // '>'
      break;
    default:
      shiftT(62);                   // '>='
    }
  }

  function parse_ValueComp()
  {
    eventHandler.startNonterminal("ValueComp", e0);
    switch (l1)
    {
    case 128:                       // 'eq'
      shift(128);                   // 'eq'
      break;
    case 186:                       // 'ne'
      shift(186);                   // 'ne'
      break;
    case 178:                       // 'lt'
      shift(178);                   // 'lt'
      break;
    case 172:                       // 'le'
      shift(172);                   // 'le'
      break;
    case 150:                       // 'gt'
      shift(150);                   // 'gt'
      break;
    default:
      shift(146);                   // 'ge'
    }
    eventHandler.endNonterminal("ValueComp", e0);
  }

  function try_ValueComp()
  {
    switch (l1)
    {
    case 128:                       // 'eq'
      shiftT(128);                  // 'eq'
      break;
    case 186:                       // 'ne'
      shiftT(186);                  // 'ne'
      break;
    case 178:                       // 'lt'
      shiftT(178);                  // 'lt'
      break;
    case 172:                       // 'le'
      shiftT(172);                  // 'le'
      break;
    case 150:                       // 'gt'
      shiftT(150);                  // 'gt'
      break;
    default:
      shiftT(146);                  // 'ge'
    }
  }

  function parse_NodeComp()
  {
    eventHandler.startNonterminal("NodeComp", e0);
    switch (l1)
    {
    case 164:                       // 'is'
      shift(164);                   // 'is'
      break;
    case 57:                        // '<<'
      shift(57);                    // '<<'
      break;
    default:
      shift(63);                    // '>>'
    }
    eventHandler.endNonterminal("NodeComp", e0);
  }

  function try_NodeComp()
  {
    switch (l1)
    {
    case 164:                       // 'is'
      shiftT(164);                  // 'is'
      break;
    case 57:                        // '<<'
      shiftT(57);                   // '<<'
      break;
    default:
      shiftT(63);                   // '>>'
    }
  }

  function parse_ValidateExpr()
  {
    eventHandler.startNonterminal("ValidateExpr", e0);
    shift(260);                     // 'validate'
    lookahead1W(160);               // S^WS | '(:' | 'lax' | 'strict' | 'type' | '{'
    if (l1 != 276)                  // '{'
    {
      switch (l1)
      {
      case 252:                     // 'type'
        shift(252);                 // 'type'
        lookahead1W(253);           // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
        whitespace();
        parse_TypeName();
        break;
      default:
        whitespace();
        parse_ValidationMode();
      }
    }
    lookahead1W(87);                // S^WS | '(:' | '{'
    shift(276);                     // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    whitespace();
    parse_Expr();
    shift(282);                     // '}'
    eventHandler.endNonterminal("ValidateExpr", e0);
  }

  function try_ValidateExpr()
  {
    shiftT(260);                    // 'validate'
    lookahead1W(160);               // S^WS | '(:' | 'lax' | 'strict' | 'type' | '{'
    if (l1 != 276)                  // '{'
    {
      switch (l1)
      {
      case 252:                     // 'type'
        shiftT(252);                // 'type'
        lookahead1W(253);           // EQName^Token | S^WS | '(:' | 'after' | 'allowing' | 'ancestor' |
        try_TypeName();
        break;
      default:
        try_ValidationMode();
      }
    }
    lookahead1W(87);                // S^WS | '(:' | '{'
    shiftT(276);                    // '{'
    lookahead1W(267);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    try_Expr();
    shiftT(282);                    // '}'
  }

  function parse_ValidationMode()
  {
    eventHandler.startNonterminal("ValidationMode", e0);
    switch (l1)
    {
    case 171:                       // 'lax'
      shift(171);                   // 'lax'
      break;
    default:
      shift(240);                   // 'strict'
    }
    eventHandler.endNonterminal("ValidationMode", e0);
  }

  function try_ValidationMode()
  {
    switch (l1)
    {
    case 171:                       // 'lax'
      shiftT(171);                  // 'lax'
      break;
    default:
      shiftT(240);                  // 'strict'
    }
  }

  function parse_ExtensionExpr()
  {
    eventHandler.startNonterminal("ExtensionExpr", e0);
    for (;;)
    {
      whitespace();
      parse_Pragma();
      lookahead1W(100);             // S^WS | '(#' | '(:' | '{'
      if (l1 != 35)                 // '(#'
      {
        break;
      }
    }
    shift(276);                     // '{'
    lookahead1W(273);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    if (l1 != 282)                  // '}'
    {
      whitespace();
      parse_Expr();
    }
    shift(282);                     // '}'
    eventHandler.endNonterminal("ExtensionExpr", e0);
  }

  function try_ExtensionExpr()
  {
    for (;;)
    {
      try_Pragma();
      lookahead1W(100);             // S^WS | '(#' | '(:' | '{'
      if (l1 != 35)                 // '(#'
      {
        break;
      }
    }
    shiftT(276);                    // '{'
    lookahead1W(273);               // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
    if (l1 != 282)                  // '}'
    {
      try_Expr();
    }
    shiftT(282);                    // '}'
  }

  function parse_Pragma()
  {
    eventHandler.startNonterminal("Pragma", e0);
    shift(35);                      // '(#'
    lookahead1(250);                // EQName^Token | S | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    if (l1 == 21)                   // S
    {
      shift(21);                    // S
    }
    parse_EQName();
    lookahead1(10);                 // S | '#)'
    if (l1 == 21)                   // S
    {
      shift(21);                    // S
      lookahead1(0);                // PragmaContents
      shift(1);                     // PragmaContents
    }
    lookahead1(5);                  // '#)'
    shift(30);                      // '#)'
    eventHandler.endNonterminal("Pragma", e0);
  }

  function try_Pragma()
  {
    shiftT(35);                     // '(#'
    lookahead1(250);                // EQName^Token | S | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    if (l1 == 21)                   // S
    {
      shiftT(21);                   // S
    }
    try_EQName();
    lookahead1(10);                 // S | '#)'
    if (l1 == 21)                   // S
    {
      shiftT(21);                   // S
      lookahead1(0);                // PragmaContents
      shiftT(1);                    // PragmaContents
    }
    lookahead1(5);                  // '#)'
    shiftT(30);                     // '#)'
  }

  function parse_PathExpr()
  {
    eventHandler.startNonterminal("PathExpr", e0);
    switch (l1)
    {
    case 46:                        // '/'
      shift(46);                    // '/'
      lookahead1W(283);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      switch (l1)
      {
      case 25:                      // EOF
      case 26:                      // '!'
      case 27:                      // '!='
      case 37:                      // ')'
      case 38:                      // '*'
      case 40:                      // '+'
      case 41:                      // ','
      case 42:                      // '-'
      case 49:                      // ':'
      case 53:                      // ';'
      case 57:                      // '<<'
      case 58:                      // '<='
      case 60:                      // '='
      case 61:                      // '>'
      case 62:                      // '>='
      case 63:                      // '>>'
      case 69:                      // ']'
      case 87:                      // 'by'
      case 99:                      // 'contains'
      case 205:                     // 'paragraphs'
      case 232:                     // 'sentences'
      case 247:                     // 'times'
      case 273:                     // 'words'
      case 279:                     // '|'
      case 280:                     // '||'
      case 281:                     // '|}'
      case 282:                     // '}'
        break;
      default:
        whitespace();
        parse_RelativePathExpr();
      }
      break;
    case 47:                        // '//'
      shift(47);                    // '//'
      lookahead1W(263);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_RelativePathExpr();
      break;
    default:
      parse_RelativePathExpr();
    }
    eventHandler.endNonterminal("PathExpr", e0);
  }

  function try_PathExpr()
  {
    switch (l1)
    {
    case 46:                        // '/'
      shiftT(46);                   // '/'
      lookahead1W(283);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      switch (l1)
      {
      case 25:                      // EOF
      case 26:                      // '!'
      case 27:                      // '!='
      case 37:                      // ')'
      case 38:                      // '*'
      case 40:                      // '+'
      case 41:                      // ','
      case 42:                      // '-'
      case 49:                      // ':'
      case 53:                      // ';'
      case 57:                      // '<<'
      case 58:                      // '<='
      case 60:                      // '='
      case 61:                      // '>'
      case 62:                      // '>='
      case 63:                      // '>>'
      case 69:                      // ']'
      case 87:                      // 'by'
      case 99:                      // 'contains'
      case 205:                     // 'paragraphs'
      case 232:                     // 'sentences'
      case 247:                     // 'times'
      case 273:                     // 'words'
      case 279:                     // '|'
      case 280:                     // '||'
      case 281:                     // '|}'
      case 282:                     // '}'
        break;
      default:
        try_RelativePathExpr();
      }
      break;
    case 47:                        // '//'
      shiftT(47);                   // '//'
      lookahead1W(263);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_RelativePathExpr();
      break;
    default:
      try_RelativePathExpr();
    }
  }

  function parse_RelativePathExpr()
  {
    eventHandler.startNonterminal("RelativePathExpr", e0);
    parse_StepExpr();
    for (;;)
    {
      switch (l1)
      {
      case 26:                      // '!'
        lookahead2W(264);           // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
        break;
      default:
        lk = l1;
      }
      if (lk != 25                  // EOF
       && lk != 27                  // '!='
       && lk != 37                  // ')'
       && lk != 38                  // '*'
       && lk != 40                  // '+'
       && lk != 41                  // ','
       && lk != 42                  // '-'
       && lk != 46                  // '/'
       && lk != 47                  // '//'
       && lk != 49                  // ':'
       && lk != 53                  // ';'
       && lk != 54                  // '<'
       && lk != 57                  // '<<'
       && lk != 58                  // '<='
       && lk != 60                  // '='
       && lk != 61                  // '>'
       && lk != 62                  // '>='
       && lk != 63                  // '>>'
       && lk != 69                  // ']'
       && lk != 70                  // 'after'
       && lk != 75                  // 'and'
       && lk != 79                  // 'as'
       && lk != 80                  // 'ascending'
       && lk != 81                  // 'at'
       && lk != 84                  // 'before'
       && lk != 87                  // 'by'
       && lk != 88                  // 'case'
       && lk != 89                  // 'cast'
       && lk != 90                  // 'castable'
       && lk != 94                  // 'collation'
       && lk != 99                  // 'contains'
       && lk != 105                 // 'count'
       && lk != 109                 // 'default'
       && lk != 113                 // 'descending'
       && lk != 118                 // 'div'
       && lk != 122                 // 'else'
       && lk != 123                 // 'empty'
       && lk != 126                 // 'end'
       && lk != 128                 // 'eq'
       && lk != 131                 // 'except'
       && lk != 137                 // 'for'
       && lk != 146                 // 'ge'
       && lk != 148                 // 'group'
       && lk != 150                 // 'gt'
       && lk != 151                 // 'idiv'
       && lk != 160                 // 'instance'
       && lk != 162                 // 'intersect'
       && lk != 163                 // 'into'
       && lk != 164                 // 'is'
       && lk != 172                 // 'le'
       && lk != 174                 // 'let'
       && lk != 178                 // 'lt'
       && lk != 180                 // 'mod'
       && lk != 181                 // 'modify'
       && lk != 186                 // 'ne'
       && lk != 198                 // 'only'
       && lk != 200                 // 'or'
       && lk != 201                 // 'order'
       && lk != 205                 // 'paragraphs'
       && lk != 220                 // 'return'
       && lk != 224                 // 'satisfies'
       && lk != 232                 // 'sentences'
       && lk != 236                 // 'stable'
       && lk != 237                 // 'start'
       && lk != 247                 // 'times'
       && lk != 248                 // 'to'
       && lk != 249                 // 'treat'
       && lk != 254                 // 'union'
       && lk != 266                 // 'where'
       && lk != 270                 // 'with'
       && lk != 273                 // 'words'
       && lk != 279                 // '|'
       && lk != 280                 // '||'
       && lk != 281                 // '|}'
       && lk != 282                 // '}'
       && lk != 23578               // '!' '/'
       && lk != 24090)              // '!' '//'
      {
        lk = memoized(2, e0);
        if (lk == 0)
        {
          var b0A = b0; var e0A = e0; var l1A = l1;
          var b1A = b1; var e1A = e1; var l2A = l2;
          var b2A = b2; var e2A = e2;
          try
          {
            switch (l1)
            {
            case 46:                // '/'
              shiftT(46);           // '/'
              break;
            case 47:                // '//'
              shiftT(47);           // '//'
              break;
            default:
              shiftT(26);           // '!'
            }
            lookahead1W(263);       // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
            try_StepExpr();
            lk = -1;
          }
          catch (p1A)
          {
            lk = -2;
          }
          b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
          b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
          b2 = b2A; e2 = e2A; end = e2A; }}
          memoize(2, e0, lk);
        }
      }
      if (lk != -1
       && lk != 46                  // '/'
       && lk != 47)                 // '//'
      {
        break;
      }
      switch (l1)
      {
      case 46:                      // '/'
        shift(46);                  // '/'
        break;
      case 47:                      // '//'
        shift(47);                  // '//'
        break;
      default:
        shift(26);                  // '!'
      }
      lookahead1W(263);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      whitespace();
      parse_StepExpr();
    }
    eventHandler.endNonterminal("RelativePathExpr", e0);
  }

  function try_RelativePathExpr()
  {
    try_StepExpr();
    for (;;)
    {
      switch (l1)
      {
      case 26:                      // '!'
        lookahead2W(264);           // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
        break;
      default:
        lk = l1;
      }
      if (lk != 25                  // EOF
       && lk != 27                  // '!='
       && lk != 37                  // ')'
       && lk != 38                  // '*'
       && lk != 40                  // '+'
       && lk != 41                  // ','
       && lk != 42                  // '-'
       && lk != 46                  // '/'
       && lk != 47                  // '//'
       && lk != 49                  // ':'
       && lk != 53                  // ';'
       && lk != 54                  // '<'
       && lk != 57                  // '<<'
       && lk != 58                  // '<='
       && lk != 60                  // '='
       && lk != 61                  // '>'
       && lk != 62                  // '>='
       && lk != 63                  // '>>'
       && lk != 69                  // ']'
       && lk != 70                  // 'after'
       && lk != 75                  // 'and'
       && lk != 79                  // 'as'
       && lk != 80                  // 'ascending'
       && lk != 81                  // 'at'
       && lk != 84                  // 'before'
       && lk != 87                  // 'by'
       && lk != 88                  // 'case'
       && lk != 89                  // 'cast'
       && lk != 90                  // 'castable'
       && lk != 94                  // 'collation'
       && lk != 99                  // 'contains'
       && lk != 105                 // 'count'
       && lk != 109                 // 'default'
       && lk != 113                 // 'descending'
       && lk != 118                 // 'div'
       && lk != 122                 // 'else'
       && lk != 123                 // 'empty'
       && lk != 126                 // 'end'
       && lk != 128                 // 'eq'
       && lk != 131                 // 'except'
       && lk != 137                 // 'for'
       && lk != 146                 // 'ge'
       && lk != 148                 // 'group'
       && lk != 150                 // 'gt'
       && lk != 151                 // 'idiv'
       && lk != 160                 // 'instance'
       && lk != 162                 // 'intersect'
       && lk != 163                 // 'into'
       && lk != 164                 // 'is'
       && lk != 172                 // 'le'
       && lk != 174                 // 'let'
       && lk != 178                 // 'lt'
       && lk != 180                 // 'mod'
       && lk != 181                 // 'modify'
       && lk != 186                 // 'ne'
       && lk != 198                 // 'only'
       && lk != 200                 // 'or'
       && lk != 201                 // 'order'
       && lk != 205                 // 'paragraphs'
       && lk != 220                 // 'return'
       && lk != 224                 // 'satisfies'
       && lk != 232                 // 'sentences'
       && lk != 236                 // 'stable'
       && lk != 237                 // 'start'
       && lk != 247                 // 'times'
       && lk != 248                 // 'to'
       && lk != 249                 // 'treat'
       && lk != 254                 // 'union'
       && lk != 266                 // 'where'
       && lk != 270                 // 'with'
       && lk != 273                 // 'words'
       && lk != 279                 // '|'
       && lk != 280                 // '||'
       && lk != 281                 // '|}'
       && lk != 282                 // '}'
       && lk != 23578               // '!' '/'
       && lk != 24090)              // '!' '//'
      {
        lk = memoized(2, e0);
        if (lk == 0)
        {
          var b0A = b0; var e0A = e0; var l1A = l1;
          var b1A = b1; var e1A = e1; var l2A = l2;
          var b2A = b2; var e2A = e2;
          try
          {
            switch (l1)
            {
            case 46:                // '/'
              shiftT(46);           // '/'
              break;
            case 47:                // '//'
              shiftT(47);           // '//'
              break;
            default:
              shiftT(26);           // '!'
            }
            lookahead1W(263);       // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
            try_StepExpr();
            memoize(2, e0A, -1);
            continue;
          }
          catch (p1A)
          {
            b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
            b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
            b2 = b2A; e2 = e2A; end = e2A; }}
            memoize(2, e0A, -2);
            break;
          }
        }
      }
      if (lk != -1
       && lk != 46                  // '/'
       && lk != 47)                 // '//'
      {
        break;
      }
      switch (l1)
      {
      case 46:                      // '/'
        shiftT(46);                 // '/'
        break;
      case 47:                      // '//'
        shiftT(47);                 // '//'
        break;
      default:
        shiftT(26);                 // '!'
      }
      lookahead1W(263);             // Wildcard | EQName^Token | IntegerLiteral | DecimalLiteral | DoubleLiteral |
      try_StepExpr();
    }
  }

  function parse_StepExpr()
  {
    eventHandler.startNonterminal("StepExpr", e0);
    switch (l1)
    {
    case 82:                        // 'attribute'
      lookahead2W(282);             // EQName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 121:                       // 'element'
      lookahead2W(280);             // EQName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 184:                       // 'namespace'
    case 216:                       // 'processing-instruction'
      lookahead2W(279);             // NCName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 96:                        // 'comment'
    case 119:                       // 'document'
    case 202:                       // 'ordered'
    case 244:                       // 'text'
    case 256:                       // 'unordered'
      lookahead2W(245);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    case 124:                       // 'empty-sequence'
    case 152:                       // 'if'
    case 165:                       // 'item'
    case 243:                       // 'switch'
    case 253:                       // 'typeswitch'
      lookahead2W(238);             // S^WS | EOF | '!' | '!=' | '#' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' | '//' |
      break;
    case 73:                        // 'ancestor'
    case 74:                        // 'ancestor-or-self'
    case 93:                        // 'child'
    case 111:                       // 'descendant'
    case 112:                       // 'descendant-or-self'
    case 135:                       // 'following'
    case 136:                       // 'following-sibling'
    case 206:                       // 'parent'
    case 212:                       // 'preceding'
    case 213:                       // 'preceding-sibling'
    case 229:                       // 'self'
      lookahead2W(244);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    case 6:                         // EQName^Token
    case 70:                        // 'after'
    case 72:                        // 'allowing'
    case 75:                        // 'and'
    case 78:                        // 'array'
    case 79:                        // 'as'
    case 80:                        // 'ascending'
    case 81:                        // 'at'
    case 83:                        // 'base-uri'
    case 84:                        // 'before'
    case 85:                        // 'boundary-space'
    case 86:                        // 'break'
    case 88:                        // 'case'
    case 89:                        // 'cast'
    case 90:                        // 'castable'
    case 91:                        // 'catch'
    case 94:                        // 'collation'
    case 97:                        // 'constraint'
    case 98:                        // 'construction'
    case 101:                       // 'context'
    case 102:                       // 'continue'
    case 103:                       // 'copy'
    case 104:                       // 'copy-namespaces'
    case 105:                       // 'count'
    case 106:                       // 'decimal-format'
    case 108:                       // 'declare'
    case 109:                       // 'default'
    case 110:                       // 'delete'
    case 113:                       // 'descending'
    case 118:                       // 'div'
    case 120:                       // 'document-node'
    case 122:                       // 'else'
    case 123:                       // 'empty'
    case 125:                       // 'encoding'
    case 126:                       // 'end'
    case 128:                       // 'eq'
    case 129:                       // 'every'
    case 131:                       // 'except'
    case 132:                       // 'exit'
    case 133:                       // 'external'
    case 134:                       // 'first'
    case 137:                       // 'for'
    case 141:                       // 'ft-option'
    case 145:                       // 'function'
    case 146:                       // 'ge'
    case 148:                       // 'group'
    case 150:                       // 'gt'
    case 151:                       // 'idiv'
    case 153:                       // 'import'
    case 154:                       // 'in'
    case 155:                       // 'index'
    case 159:                       // 'insert'
    case 160:                       // 'instance'
    case 161:                       // 'integrity'
    case 162:                       // 'intersect'
    case 163:                       // 'into'
    case 164:                       // 'is'
    case 167:                       // 'json-item'
    case 170:                       // 'last'
    case 171:                       // 'lax'
    case 172:                       // 'le'
    case 174:                       // 'let'
    case 176:                       // 'loop'
    case 178:                       // 'lt'
    case 180:                       // 'mod'
    case 181:                       // 'modify'
    case 182:                       // 'module'
    case 185:                       // 'namespace-node'
    case 186:                       // 'ne'
    case 191:                       // 'node'
    case 192:                       // 'nodes'
    case 194:                       // 'object'
    case 198:                       // 'only'
    case 199:                       // 'option'
    case 200:                       // 'or'
    case 201:                       // 'order'
    case 203:                       // 'ordering'
    case 218:                       // 'rename'
    case 219:                       // 'replace'
    case 220:                       // 'return'
    case 221:                       // 'returning'
    case 222:                       // 'revalidation'
    case 224:                       // 'satisfies'
    case 225:                       // 'schema'
    case 226:                       // 'schema-attribute'
    case 227:                       // 'schema-element'
    case 228:                       // 'score'
    case 234:                       // 'sliding'
    case 235:                       // 'some'
    case 236:                       // 'stable'
    case 237:                       // 'start'
    case 240:                       // 'strict'
    case 248:                       // 'to'
    case 249:                       // 'treat'
    case 250:                       // 'try'
    case 251:                       // 'tumbling'
    case 252:                       // 'type'
    case 254:                       // 'union'
    case 257:                       // 'updating'
    case 260:                       // 'validate'
    case 261:                       // 'value'
    case 262:                       // 'variable'
    case 263:                       // 'version'
    case 266:                       // 'where'
    case 267:                       // 'while'
    case 270:                       // 'with'
    case 274:                       // 'xquery'
      lookahead2W(242);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    default:
      lk = l1;
    }
    if (lk == 17486                 // 'array' '('
     || lk == 17575                 // 'json-item' '('
     || lk == 17602                 // 'object' '('
     || lk == 35922                 // 'attribute' 'after'
     || lk == 35961                 // 'element' 'after'
     || lk == 36024                 // 'namespace' 'after'
     || lk == 36056                 // 'processing-instruction' 'after'
     || lk == 38482                 // 'attribute' 'and'
     || lk == 38521                 // 'element' 'and'
     || lk == 38584                 // 'namespace' 'and'
     || lk == 38616                 // 'processing-instruction' 'and'
     || lk == 40530                 // 'attribute' 'as'
     || lk == 40569                 // 'element' 'as'
     || lk == 40632                 // 'namespace' 'as'
     || lk == 40664                 // 'processing-instruction' 'as'
     || lk == 41042                 // 'attribute' 'ascending'
     || lk == 41081                 // 'element' 'ascending'
     || lk == 41144                 // 'namespace' 'ascending'
     || lk == 41176                 // 'processing-instruction' 'ascending'
     || lk == 41554                 // 'attribute' 'at'
     || lk == 41593                 // 'element' 'at'
     || lk == 41656                 // 'namespace' 'at'
     || lk == 41688                 // 'processing-instruction' 'at'
     || lk == 43090                 // 'attribute' 'before'
     || lk == 43129                 // 'element' 'before'
     || lk == 43192                 // 'namespace' 'before'
     || lk == 43224                 // 'processing-instruction' 'before'
     || lk == 45138                 // 'attribute' 'case'
     || lk == 45177                 // 'element' 'case'
     || lk == 45240                 // 'namespace' 'case'
     || lk == 45272                 // 'processing-instruction' 'case'
     || lk == 45650                 // 'attribute' 'cast'
     || lk == 45689                 // 'element' 'cast'
     || lk == 45752                 // 'namespace' 'cast'
     || lk == 45784                 // 'processing-instruction' 'cast'
     || lk == 46162                 // 'attribute' 'castable'
     || lk == 46201                 // 'element' 'castable'
     || lk == 46264                 // 'namespace' 'castable'
     || lk == 46296                 // 'processing-instruction' 'castable'
     || lk == 48210                 // 'attribute' 'collation'
     || lk == 48249                 // 'element' 'collation'
     || lk == 48312                 // 'namespace' 'collation'
     || lk == 48344                 // 'processing-instruction' 'collation'
     || lk == 53842                 // 'attribute' 'count'
     || lk == 53881                 // 'element' 'count'
     || lk == 53944                 // 'namespace' 'count'
     || lk == 53976                 // 'processing-instruction' 'count'
     || lk == 55890                 // 'attribute' 'default'
     || lk == 55929                 // 'element' 'default'
     || lk == 55992                 // 'namespace' 'default'
     || lk == 56024                 // 'processing-instruction' 'default'
     || lk == 57938                 // 'attribute' 'descending'
     || lk == 57977                 // 'element' 'descending'
     || lk == 58040                 // 'namespace' 'descending'
     || lk == 58072                 // 'processing-instruction' 'descending'
     || lk == 60498                 // 'attribute' 'div'
     || lk == 60537                 // 'element' 'div'
     || lk == 60600                 // 'namespace' 'div'
     || lk == 60632                 // 'processing-instruction' 'div'
     || lk == 62546                 // 'attribute' 'else'
     || lk == 62585                 // 'element' 'else'
     || lk == 62648                 // 'namespace' 'else'
     || lk == 62680                 // 'processing-instruction' 'else'
     || lk == 63058                 // 'attribute' 'empty'
     || lk == 63097                 // 'element' 'empty'
     || lk == 63160                 // 'namespace' 'empty'
     || lk == 63192                 // 'processing-instruction' 'empty'
     || lk == 64594                 // 'attribute' 'end'
     || lk == 64633                 // 'element' 'end'
     || lk == 64696                 // 'namespace' 'end'
     || lk == 64728                 // 'processing-instruction' 'end'
     || lk == 65618                 // 'attribute' 'eq'
     || lk == 65657                 // 'element' 'eq'
     || lk == 65720                 // 'namespace' 'eq'
     || lk == 65752                 // 'processing-instruction' 'eq'
     || lk == 67154                 // 'attribute' 'except'
     || lk == 67193                 // 'element' 'except'
     || lk == 67256                 // 'namespace' 'except'
     || lk == 67288                 // 'processing-instruction' 'except'
     || lk == 70226                 // 'attribute' 'for'
     || lk == 70265                 // 'element' 'for'
     || lk == 70328                 // 'namespace' 'for'
     || lk == 70360                 // 'processing-instruction' 'for'
     || lk == 74834                 // 'attribute' 'ge'
     || lk == 74873                 // 'element' 'ge'
     || lk == 74936                 // 'namespace' 'ge'
     || lk == 74968                 // 'processing-instruction' 'ge'
     || lk == 75858                 // 'attribute' 'group'
     || lk == 75897                 // 'element' 'group'
     || lk == 75960                 // 'namespace' 'group'
     || lk == 75992                 // 'processing-instruction' 'group'
     || lk == 76882                 // 'attribute' 'gt'
     || lk == 76921                 // 'element' 'gt'
     || lk == 76984                 // 'namespace' 'gt'
     || lk == 77016                 // 'processing-instruction' 'gt'
     || lk == 77394                 // 'attribute' 'idiv'
     || lk == 77433                 // 'element' 'idiv'
     || lk == 77496                 // 'namespace' 'idiv'
     || lk == 77528                 // 'processing-instruction' 'idiv'
     || lk == 82002                 // 'attribute' 'instance'
     || lk == 82041                 // 'element' 'instance'
     || lk == 82104                 // 'namespace' 'instance'
     || lk == 82136                 // 'processing-instruction' 'instance'
     || lk == 83026                 // 'attribute' 'intersect'
     || lk == 83065                 // 'element' 'intersect'
     || lk == 83128                 // 'namespace' 'intersect'
     || lk == 83160                 // 'processing-instruction' 'intersect'
     || lk == 83538                 // 'attribute' 'into'
     || lk == 83577                 // 'element' 'into'
     || lk == 83640                 // 'namespace' 'into'
     || lk == 83672                 // 'processing-instruction' 'into'
     || lk == 84050                 // 'attribute' 'is'
     || lk == 84089                 // 'element' 'is'
     || lk == 84152                 // 'namespace' 'is'
     || lk == 84184                 // 'processing-instruction' 'is'
     || lk == 88146                 // 'attribute' 'le'
     || lk == 88185                 // 'element' 'le'
     || lk == 88248                 // 'namespace' 'le'
     || lk == 88280                 // 'processing-instruction' 'le'
     || lk == 89170                 // 'attribute' 'let'
     || lk == 89209                 // 'element' 'let'
     || lk == 89272                 // 'namespace' 'let'
     || lk == 89304                 // 'processing-instruction' 'let'
     || lk == 91218                 // 'attribute' 'lt'
     || lk == 91257                 // 'element' 'lt'
     || lk == 91320                 // 'namespace' 'lt'
     || lk == 91352                 // 'processing-instruction' 'lt'
     || lk == 92242                 // 'attribute' 'mod'
     || lk == 92281                 // 'element' 'mod'
     || lk == 92344                 // 'namespace' 'mod'
     || lk == 92376                 // 'processing-instruction' 'mod'
     || lk == 92754                 // 'attribute' 'modify'
     || lk == 92793                 // 'element' 'modify'
     || lk == 92856                 // 'namespace' 'modify'
     || lk == 92888                 // 'processing-instruction' 'modify'
     || lk == 95314                 // 'attribute' 'ne'
     || lk == 95353                 // 'element' 'ne'
     || lk == 95416                 // 'namespace' 'ne'
     || lk == 95448                 // 'processing-instruction' 'ne'
     || lk == 101458                // 'attribute' 'only'
     || lk == 101497                // 'element' 'only'
     || lk == 101560                // 'namespace' 'only'
     || lk == 101592                // 'processing-instruction' 'only'
     || lk == 102482                // 'attribute' 'or'
     || lk == 102521                // 'element' 'or'
     || lk == 102584                // 'namespace' 'or'
     || lk == 102616                // 'processing-instruction' 'or'
     || lk == 102994                // 'attribute' 'order'
     || lk == 103033                // 'element' 'order'
     || lk == 103096                // 'namespace' 'order'
     || lk == 103128                // 'processing-instruction' 'order'
     || lk == 112722                // 'attribute' 'return'
     || lk == 112761                // 'element' 'return'
     || lk == 112824                // 'namespace' 'return'
     || lk == 112856                // 'processing-instruction' 'return'
     || lk == 114770                // 'attribute' 'satisfies'
     || lk == 114809                // 'element' 'satisfies'
     || lk == 114872                // 'namespace' 'satisfies'
     || lk == 114904                // 'processing-instruction' 'satisfies'
     || lk == 120914                // 'attribute' 'stable'
     || lk == 120953                // 'element' 'stable'
     || lk == 121016                // 'namespace' 'stable'
     || lk == 121048                // 'processing-instruction' 'stable'
     || lk == 121426                // 'attribute' 'start'
     || lk == 121465                // 'element' 'start'
     || lk == 121528                // 'namespace' 'start'
     || lk == 121560                // 'processing-instruction' 'start'
     || lk == 127058                // 'attribute' 'to'
     || lk == 127097                // 'element' 'to'
     || lk == 127160                // 'namespace' 'to'
     || lk == 127192                // 'processing-instruction' 'to'
     || lk == 127570                // 'attribute' 'treat'
     || lk == 127609                // 'element' 'treat'
     || lk == 127672                // 'namespace' 'treat'
     || lk == 127704                // 'processing-instruction' 'treat'
     || lk == 130130                // 'attribute' 'union'
     || lk == 130169                // 'element' 'union'
     || lk == 130232                // 'namespace' 'union'
     || lk == 130264                // 'processing-instruction' 'union'
     || lk == 136274                // 'attribute' 'where'
     || lk == 136313                // 'element' 'where'
     || lk == 136376                // 'namespace' 'where'
     || lk == 136408                // 'processing-instruction' 'where'
     || lk == 138322                // 'attribute' 'with'
     || lk == 138361                // 'element' 'with'
     || lk == 138424                // 'namespace' 'with'
     || lk == 138456)               // 'processing-instruction' 'with'
    {
      lk = memoized(3, e0);
      if (lk == 0)
      {
        var b0A = b0; var e0A = e0; var l1A = l1;
        var b1A = b1; var e1A = e1; var l2A = l2;
        var b2A = b2; var e2A = e2;
        try
        {
          try_PostfixExpr();
          lk = -1;
        }
        catch (p1A)
        {
          lk = -2;
        }
        b0 = b0A; e0 = e0A; l1 = l1A; if (l1 == 0) {end = e0A;} else {
        b1 = b1A; e1 = e1A; l2 = l2A; if (l2 == 0) {end = e1A;} else {
        b2 = b2A; e2 = e2A; end = e2A; }}
        memoize(3, e0, lk);
      }
    }
    switch (lk)
    {
    case -1:
    case 8:                         // IntegerLiteral
    case 9:                         // DecimalLiteral
    case 10:                        // DoubleLiteral
    case 11:                        // StringLiteral
    case 31:                        // '$'
    case 32:                        // '%'
    case 34:                        // '('
    case 44:                        // '.'
    case 54:                        // '<'
    case 55:                        // '<!--'
    case 59:                        // '<?'
    case 68:                        // '['
    case 276:                       // '{'
    case 278:                       // '{|'
    case 3154:                      // 'attribute' EQName^Token
    case 3193:                      // 'element' EQName^Token
    case 9912:                      // 'namespace' NCName^Token
    case 9944:                      // 'processing-instruction' NCName^Token
    case 14854:                     // EQName^Token '#'
    case 14918:                     // 'after' '#'
    case 14920:                     // 'allowing' '#'
    case 14921:                     // 'ancestor' '#'
    case 14922:                     // 'ancestor-or-self' '#'
    case 14923:                     // 'and' '#'
    case 14926:                     // 'array' '#'
    case 14927:                     // 'as' '#'
    case 14928:                     // 'ascending' '#'
    case 14929:                     // 'at' '#'
    case 14930:                     // 'attribute' '#'
    case 14931:                     // 'base-uri' '#'
    case 14932:                     // 'before' '#'
    case 14933:                     // 'boundary-space' '#'
    case 14934:                     // 'break' '#'
    case 14936:                     // 'case' '#'
    case 14937:                     // 'cast' '#'
    case 14938:                     // 'castable' '#'
    case 14939:                     // 'catch' '#'
    case 14941:                     // 'child' '#'
    case 14942:                     // 'collation' '#'
    case 14944:                     // 'comment' '#'
    case 14945:                     // 'constraint' '#'
    case 14946:                     // 'construction' '#'
    case 14949:                     // 'context' '#'
    case 14950:                     // 'continue' '#'
    case 14951:                     // 'copy' '#'
    case 14952:                     // 'copy-namespaces' '#'
    case 14953:                     // 'count' '#'
    case 14954:                     // 'decimal-format' '#'
    case 14956:                     // 'declare' '#'
    case 14957:                     // 'default' '#'
    case 14958:                     // 'delete' '#'
    case 14959:                     // 'descendant' '#'
    case 14960:                     // 'descendant-or-self' '#'
    case 14961:                     // 'descending' '#'
    case 14966:                     // 'div' '#'
    case 14967:                     // 'document' '#'
    case 14968:                     // 'document-node' '#'
    case 14969:                     // 'element' '#'
    case 14970:                     // 'else' '#'
    case 14971:                     // 'empty' '#'
    case 14972:                     // 'empty-sequence' '#'
    case 14973:                     // 'encoding' '#'
    case 14974:                     // 'end' '#'
    case 14976:                     // 'eq' '#'
    case 14977:                     // 'every' '#'
    case 14979:                     // 'except' '#'
    case 14980:                     // 'exit' '#'
    case 14981:                     // 'external' '#'
    case 14982:                     // 'first' '#'
    case 14983:                     // 'following' '#'
    case 14984:                     // 'following-sibling' '#'
    case 14985:                     // 'for' '#'
    case 14989:                     // 'ft-option' '#'
    case 14993:                     // 'function' '#'
    case 14994:                     // 'ge' '#'
    case 14996:                     // 'group' '#'
    case 14998:                     // 'gt' '#'
    case 14999:                     // 'idiv' '#'
    case 15000:                     // 'if' '#'
    case 15001:                     // 'import' '#'
    case 15002:                     // 'in' '#'
    case 15003:                     // 'index' '#'
    case 15007:                     // 'insert' '#'
    case 15008:                     // 'instance' '#'
    case 15009:                     // 'integrity' '#'
    case 15010:                     // 'intersect' '#'
    case 15011:                     // 'into' '#'
    case 15012:                     // 'is' '#'
    case 15013:                     // 'item' '#'
    case 15015:                     // 'json-item' '#'
    case 15018:                     // 'last' '#'
    case 15019:                     // 'lax' '#'
    case 15020:                     // 'le' '#'
    case 15022:                     // 'let' '#'
    case 15024:                     // 'loop' '#'
    case 15026:                     // 'lt' '#'
    case 15028:                     // 'mod' '#'
    case 15029:                     // 'modify' '#'
    case 15030:                     // 'module' '#'
    case 15032:                     // 'namespace' '#'
    case 15033:                     // 'namespace-node' '#'
    case 15034:                     // 'ne' '#'
    case 15039:                     // 'node' '#'
    case 15040:                     // 'nodes' '#'
    case 15042:                     // 'object' '#'
    case 15046:                     // 'only' '#'
    case 15047:                     // 'option' '#'
    case 15048:                     // 'or' '#'
    case 15049:                     // 'order' '#'
    case 15050:                     // 'ordered' '#'
    case 15051:                     // 'ordering' '#'
    case 15054:                     // 'parent' '#'
    case 15060:                     // 'preceding' '#'
    case 15061:                     // 'preceding-sibling' '#'
    case 15064:                     // 'processing-instruction' '#'
    case 15066:                     // 'rename' '#'
    case 15067:                     // 'replace' '#'
    case 15068:                     // 'return' '#'
    case 15069:                     // 'returning' '#'
    case 15070:                     // 'revalidation' '#'
    case 15072:                     // 'satisfies' '#'
    case 15073:                     // 'schema' '#'
    case 15074:                     // 'schema-attribute' '#'
    case 15075:                     // 'schema-element' '#'
    case 15076:                     // 'score' '#'
    case 15077:                     // 'self' '#'
    case 15082:                     // 'sliding' '#'
    case 15083:                     // 'some' '#'
    case 15084:                     // 'stable' '#'
    case 15085:                     // 'start' '#'
    case 15088:                     // 'strict' '#'
    case 15091:                     // 'switch' '#'
    case 15092:                     // 'text' '#'
    case 15096:                     // 'to' '#'
    case 15097:                     // 'treat' '#'
    case 15098:                     // 'try' '#'
    case 15099:                     // 'tumbling' '#'
    case 15100:                     // 'type' '#'
    case 15101:                     // 'typeswitch' '#'
    case 15102:                     // 'union' '#'
    case 15104:                     // 'unordered' '#'
    case 15105:                     // 'updating' '#'
    case 15108:                     // 'validate' '#'
    case 15109:                     // 'value' '#'
    case 15110:                     // 'variable' '#'
    case 15111:                     // 'version' '#'
    case 15114:                     // 'where' '#'
    case 15115:                     // 'while' '#'
    case 15118:                     // 'with' '#'
    case 15122:                     // 'xquery' '#'
    case 17414:                     // EQName^Token '('
    case 17478:                     // 'after' '('
    case 17480:                     // 'allowing' '('
    case 17481:                     // 'ancestor' '('
    case 17482:                     // 'ancestor-or-self' '('
    case 17483:                     // 'and' '('
    case 17487:                     // 'as' '('
    case 17488:                     // 'ascending' '('
    case 17489:                     // 'at' '('
    case 17491:                     // 'base-uri' '('
    case 17492:                     // 'before' '('
    case 17493:                     // 'boundary-space' '('
    case 17494:                     // 'break' '('
    case 17496:                     // 'case' '('
    case 17497:                     // 'cast' '('
    case 17498:                     // 'castable' '('
    case 17499:                     // 'catch' '('
    case 17501:                     // 'child' '('
    case 17502:                     // 'collation' '('
    case 17505:                     // 'constraint' '('
    case 17506:                     // 'construction' '('
    case 17509:                     // 'context' '('
    case 17510:                     // 'continue' '('
    case 17511:                     // 'copy' '('
    case 17512:                     // 'copy-namespaces' '('
    case 17513:                     // 'count' '('
    case 17514:                     // 'decimal-format' '('
    case 17516:                     // 'declare' '('
    case 17517:                     // 'default' '('
    case 17518:                     // 'delete' '('
    case 17519:                     // 'descendant' '('
    case 17520:                     // 'descendant-or-self' '('
    case 17521:                     // 'descending' '('
    case 17526:                     // 'div' '('
    case 17527:                     // 'document' '('
    case 17530:                     // 'else' '('
    case 17531:                     // 'empty' '('
    case 17533:                     // 'encoding' '('
    case 17534:                     // 'end' '('
    case 17536:                     // 'eq' '('
    case 17537:                     // 'every' '('
    case 17539:                     // 'except' '('
    case 17540:                     // 'exit' '('
    case 17541:                     // 'external' '('
    case 17542:                     // 'first' '('
    case 17543:                     // 'following' '('
    case 17544:                     // 'following-sibling' '('
    case 17545:                     // 'for' '('
    case 17549:                     // 'ft-option' '('
    case 17553:                     // 'function' '('
    case 17554:                     // 'ge' '('
    case 17556:                     // 'group' '('
    case 17558:                     // 'gt' '('
    case 17559:                     // 'idiv' '('
    case 17561:                     // 'import' '('
    case 17562:                     // 'in' '('
    case 17563:                     // 'index' '('
    case 17567:                     // 'insert' '('
    case 17568:                     // 'instance' '('
    case 17569:                     // 'integrity' '('
    case 17570:                     // 'intersect' '('
    case 17571:                     // 'into' '('
    case 17572:                     // 'is' '('
    case 17578:                     // 'last' '('
    case 17579:                     // 'lax' '('
    case 17580:                     // 'le' '('
    case 17582:                     // 'let' '('
    case 17584:                     // 'loop' '('
    case 17586:                     // 'lt' '('
    case 17588:                     // 'mod' '('
    case 17589:                     // 'modify' '('
    case 17590:                     // 'module' '('
    case 17592:                     // 'namespace' '('
    case 17594:                     // 'ne' '('
    case 17600:                     // 'nodes' '('
    case 17606:                     // 'only' '('
    case 17607:                     // 'option' '('
    case 17608:                     // 'or' '('
    case 17609:                     // 'order' '('
    case 17610:                     // 'ordered' '('
    case 17611:                     // 'ordering' '('
    case 17614:                     // 'parent' '('
    case 17620:                     // 'preceding' '('
    case 17621:                     // 'preceding-sibling' '('
    case 17626:                     // 'rename' '('
    case 17627:                     // 'replace' '('
    case 17628:                     // 'return' '('
    case 17629:                     // 'returning' '('
    case 17630:                     // 'revalidation' '('
    case 17632:                     // 'satisfies' '('
    case 17633:                     // 'schema' '('
    case 17636:                     // 'score' '('
    case 17637:                     // 'self' '('
    case 17642:                     // 'sliding' '('
    case 17643:                     // 'some' '('
    case 17644:                     // 'stable' '('
    case 17645:                     // 'start' '('
    case 17648:                     // 'strict' '('
    case 17656:                     // 'to' '('
    case 17657:                     // 'treat' '('
    case 17658:                     // 'try' '('
    case 17659:                     // 'tumbling' '('
    case 17660:                     // 'type' '('
    case 17662:                     // 'union' '('
    case 17664:                     // 'unordered' '('
    case 17665:                     // 'updating' '('
    case 17668:                     // 'validate' '('
    case 17669:                     // 'value' '('
    case 17670:                     // 'variable' '('
    case 17671:                     // 'version' '('
    case 17674:                     // 'where' '('
    case 17675:                     // 'while' '('
    case 17678:                     // 'with' '('
    case 17682:                     // 'xquery' '('
    case 36946:                     // 'attribute' 'allowing'
    case 36985:                     // 'element' 'allowing'
    case 37048:                     // 'namespace' 'allowing'
    case 37080:                     // 'processing-instruction' 'allowing'
    case 37458:                     // 'attribute' 'ancestor'
    case 37497:                     // 'element' 'ancestor'
    case 37560:                     // 'namespace' 'ancestor'
    case 37592:                     // 'processing-instruction' 'ancestor'
    case 37970:                     // 'attribute' 'ancestor-or-self'
    case 38009:                     // 'element' 'ancestor-or-self'
    case 38072:                     // 'namespace' 'ancestor-or-self'
    case 38104:                     // 'processing-instruction' 'ancestor-or-self'
    case 40018:                     // 'attribute' 'array'
    case 40057:                     // 'element' 'array'
    case 42066:                     // 'attribute' 'attribute'
    case 42105:                     // 'element' 'attribute'
    case 42168:                     // 'namespace' 'attribute'
    case 42200:                     // 'processing-instruction' 'attribute'
    case 42578:                     // 'attribute' 'base-uri'
    case 42617:                     // 'element' 'base-uri'
    case 42680:                     // 'namespace' 'base-uri'
    case 42712:                     // 'processing-instruction' 'base-uri'
    case 43602:                     // 'attribute' 'boundary-space'
    case 43641:                     // 'element' 'boundary-space'
    case 43704:                     // 'namespace' 'boundary-space'
    case 43736:                     // 'processing-instruction' 'boundary-space'
    case 44114:                     // 'attribute' 'break'
    case 44153:                     // 'element' 'break'
    case 44216:                     // 'namespace' 'break'
    case 44248:                     // 'processing-instruction' 'break'
    case 46674:                     // 'attribute' 'catch'
    case 46713:                     // 'element' 'catch'
    case 46776:                     // 'namespace' 'catch'
    case 46808:                     // 'processing-instruction' 'catch'
    case 47698:                     // 'attribute' 'child'
    case 47737:                     // 'element' 'child'
    case 47800:                     // 'namespace' 'child'
    case 47832:                     // 'processing-instruction' 'child'
    case 49234:                     // 'attribute' 'comment'
    case 49273:                     // 'element' 'comment'
    case 49336:                     // 'namespace' 'comment'
    case 49368:                     // 'processing-instruction' 'comment'
    case 49746:                     // 'attribute' 'constraint'
    case 49785:                     // 'element' 'constraint'
    case 49848:                     // 'namespace' 'constraint'
    case 49880:                     // 'processing-instruction' 'constraint'
    case 50258:                     // 'attribute' 'construction'
    case 50297:                     // 'element' 'construction'
    case 50360:                     // 'namespace' 'construction'
    case 50392:                     // 'processing-instruction' 'construction'
    case 51794:                     // 'attribute' 'context'
    case 51833:                     // 'element' 'context'
    case 51896:                     // 'namespace' 'context'
    case 51928:                     // 'processing-instruction' 'context'
    case 52306:                     // 'attribute' 'continue'
    case 52345:                     // 'element' 'continue'
    case 52408:                     // 'namespace' 'continue'
    case 52440:                     // 'processing-instruction' 'continue'
    case 52818:                     // 'attribute' 'copy'
    case 52857:                     // 'element' 'copy'
    case 52920:                     // 'namespace' 'copy'
    case 52952:                     // 'processing-instruction' 'copy'
    case 53330:                     // 'attribute' 'copy-namespaces'
    case 53369:                     // 'element' 'copy-namespaces'
    case 53432:                     // 'namespace' 'copy-namespaces'
    case 53464:                     // 'processing-instruction' 'copy-namespaces'
    case 54354:                     // 'attribute' 'decimal-format'
    case 54393:                     // 'element' 'decimal-format'
    case 54456:                     // 'namespace' 'decimal-format'
    case 54488:                     // 'processing-instruction' 'decimal-format'
    case 55378:                     // 'attribute' 'declare'
    case 55417:                     // 'element' 'declare'
    case 55480:                     // 'namespace' 'declare'
    case 55512:                     // 'processing-instruction' 'declare'
    case 56402:                     // 'attribute' 'delete'
    case 56441:                     // 'element' 'delete'
    case 56504:                     // 'namespace' 'delete'
    case 56536:                     // 'processing-instruction' 'delete'
    case 56914:                     // 'attribute' 'descendant'
    case 56953:                     // 'element' 'descendant'
    case 57016:                     // 'namespace' 'descendant'
    case 57048:                     // 'processing-instruction' 'descendant'
    case 57426:                     // 'attribute' 'descendant-or-self'
    case 57465:                     // 'element' 'descendant-or-self'
    case 57528:                     // 'namespace' 'descendant-or-self'
    case 57560:                     // 'processing-instruction' 'descendant-or-self'
    case 61010:                     // 'attribute' 'document'
    case 61049:                     // 'element' 'document'
    case 61112:                     // 'namespace' 'document'
    case 61144:                     // 'processing-instruction' 'document'
    case 61522:                     // 'attribute' 'document-node'
    case 61561:                     // 'element' 'document-node'
    case 61624:                     // 'namespace' 'document-node'
    case 61656:                     // 'processing-instruction' 'document-node'
    case 62034:                     // 'attribute' 'element'
    case 62073:                     // 'element' 'element'
    case 62136:                     // 'namespace' 'element'
    case 62168:                     // 'processing-instruction' 'element'
    case 63570:                     // 'attribute' 'empty-sequence'
    case 63609:                     // 'element' 'empty-sequence'
    case 63672:                     // 'namespace' 'empty-sequence'
    case 63704:                     // 'processing-instruction' 'empty-sequence'
    case 64082:                     // 'attribute' 'encoding'
    case 64121:                     // 'element' 'encoding'
    case 64184:                     // 'namespace' 'encoding'
    case 64216:                     // 'processing-instruction' 'encoding'
    case 66130:                     // 'attribute' 'every'
    case 66169:                     // 'element' 'every'
    case 66232:                     // 'namespace' 'every'
    case 66264:                     // 'processing-instruction' 'every'
    case 67666:                     // 'attribute' 'exit'
    case 67705:                     // 'element' 'exit'
    case 67768:                     // 'namespace' 'exit'
    case 67800:                     // 'processing-instruction' 'exit'
    case 68178:                     // 'attribute' 'external'
    case 68217:                     // 'element' 'external'
    case 68280:                     // 'namespace' 'external'
    case 68312:                     // 'processing-instruction' 'external'
    case 68690:                     // 'attribute' 'first'
    case 68729:                     // 'element' 'first'
    case 68792:                     // 'namespace' 'first'
    case 68824:                     // 'processing-instruction' 'first'
    case 69202:                     // 'attribute' 'following'
    case 69241:                     // 'element' 'following'
    case 69304:                     // 'namespace' 'following'
    case 69336:                     // 'processing-instruction' 'following'
    case 69714:                     // 'attribute' 'following-sibling'
    case 69753:                     // 'element' 'following-sibling'
    case 69816:                     // 'namespace' 'following-sibling'
    case 69848:                     // 'processing-instruction' 'following-sibling'
    case 72274:                     // 'attribute' 'ft-option'
    case 72313:                     // 'element' 'ft-option'
    case 72376:                     // 'namespace' 'ft-option'
    case 72408:                     // 'processing-instruction' 'ft-option'
    case 74322:                     // 'attribute' 'function'
    case 74361:                     // 'element' 'function'
    case 74424:                     // 'namespace' 'function'
    case 74456:                     // 'processing-instruction' 'function'
    case 77906:                     // 'attribute' 'if'
    case 77945:                     // 'element' 'if'
    case 78008:                     // 'namespace' 'if'
    case 78040:                     // 'processing-instruction' 'if'
    case 78418:                     // 'attribute' 'import'
    case 78457:                     // 'element' 'import'
    case 78520:                     // 'namespace' 'import'
    case 78552:                     // 'processing-instruction' 'import'
    case 78930:                     // 'attribute' 'in'
    case 78969:                     // 'element' 'in'
    case 79032:                     // 'namespace' 'in'
    case 79064:                     // 'processing-instruction' 'in'
    case 79442:                     // 'attribute' 'index'
    case 79481:                     // 'element' 'index'
    case 79544:                     // 'namespace' 'index'
    case 79576:                     // 'processing-instruction' 'index'
    case 81490:                     // 'attribute' 'insert'
    case 81529:                     // 'element' 'insert'
    case 81592:                     // 'namespace' 'insert'
    case 81624:                     // 'processing-instruction' 'insert'
    case 82514:                     // 'attribute' 'integrity'
    case 82553:                     // 'element' 'integrity'
    case 82616:                     // 'namespace' 'integrity'
    case 82648:                     // 'processing-instruction' 'integrity'
    case 84562:                     // 'attribute' 'item'
    case 84601:                     // 'element' 'item'
    case 84664:                     // 'namespace' 'item'
    case 84696:                     // 'processing-instruction' 'item'
    case 85586:                     // 'attribute' 'json-item'
    case 85625:                     // 'element' 'json-item'
    case 87122:                     // 'attribute' 'last'
    case 87161:                     // 'element' 'last'
    case 87224:                     // 'namespace' 'last'
    case 87256:                     // 'processing-instruction' 'last'
    case 87634:                     // 'attribute' 'lax'
    case 87673:                     // 'element' 'lax'
    case 87736:                     // 'namespace' 'lax'
    case 87768:                     // 'processing-instruction' 'lax'
    case 90194:                     // 'attribute' 'loop'
    case 90233:                     // 'element' 'loop'
    case 90296:                     // 'namespace' 'loop'
    case 90328:                     // 'processing-instruction' 'loop'
    case 93266:                     // 'attribute' 'module'
    case 93305:                     // 'element' 'module'
    case 93368:                     // 'namespace' 'module'
    case 93400:                     // 'processing-instruction' 'module'
    case 94290:                     // 'attribute' 'namespace'
    case 94329:                     // 'element' 'namespace'
    case 94392:                     // 'namespace' 'namespace'
    case 94424:                     // 'processing-instruction' 'namespace'
    case 94802:                     // 'attribute' 'namespace-node'
    case 94841:                     // 'element' 'namespace-node'
    case 94904:                     // 'namespace' 'namespace-node'
    case 94936:                     // 'processing-instruction' 'namespace-node'
    case 97874:                     // 'attribute' 'node'
    case 97913:                     // 'element' 'node'
    case 97976:                     // 'namespace' 'node'
    case 98008:                     // 'processing-instruction' 'node'
    case 98386:                     // 'attribute' 'nodes'
    case 98425:                     // 'element' 'nodes'
    case 98488:                     // 'namespace' 'nodes'
    case 98520:                     // 'processing-instruction' 'nodes'
    case 99410:                     // 'attribute' 'object'
    case 99449:                     // 'element' 'object'
    case 101970:                    // 'attribute' 'option'
    case 102009:                    // 'element' 'option'
    case 102072:                    // 'namespace' 'option'
    case 102104:                    // 'processing-instruction' 'option'
    case 103506:                    // 'attribute' 'ordered'
    case 103545:                    // 'element' 'ordered'
    case 103608:                    // 'namespace' 'ordered'
    case 103640:                    // 'processing-instruction' 'ordered'
    case 104018:                    // 'attribute' 'ordering'
    case 104057:                    // 'element' 'ordering'
    case 104120:                    // 'namespace' 'ordering'
    case 104152:                    // 'processing-instruction' 'ordering'
    case 105554:                    // 'attribute' 'parent'
    case 105593:                    // 'element' 'parent'
    case 105656:                    // 'namespace' 'parent'
    case 105688:                    // 'processing-instruction' 'parent'
    case 108626:                    // 'attribute' 'preceding'
    case 108665:                    // 'element' 'preceding'
    case 108728:                    // 'namespace' 'preceding'
    case 108760:                    // 'processing-instruction' 'preceding'
    case 109138:                    // 'attribute' 'preceding-sibling'
    case 109177:                    // 'element' 'preceding-sibling'
    case 109240:                    // 'namespace' 'preceding-sibling'
    case 109272:                    // 'processing-instruction' 'preceding-sibling'
    case 110674:                    // 'attribute' 'processing-instruction'
    case 110713:                    // 'element' 'processing-instruction'
    case 110776:                    // 'namespace' 'processing-instruction'
    case 110808:                    // 'processing-instruction' 'processing-instruction'
    case 111698:                    // 'attribute' 'rename'
    case 111737:                    // 'element' 'rename'
    case 111800:                    // 'namespace' 'rename'
    case 111832:                    // 'processing-instruction' 'rename'
    case 112210:                    // 'attribute' 'replace'
    case 112249:                    // 'element' 'replace'
    case 112312:                    // 'namespace' 'replace'
    case 112344:                    // 'processing-instruction' 'replace'
    case 113234:                    // 'attribute' 'returning'
    case 113273:                    // 'element' 'returning'
    case 113336:                    // 'namespace' 'returning'
    case 113368:                    // 'processing-instruction' 'returning'
    case 113746:                    // 'attribute' 'revalidation'
    case 113785:                    // 'element' 'revalidation'
    case 113848:                    // 'namespace' 'revalidation'
    case 113880:                    // 'processing-instruction' 'revalidation'
    case 115282:                    // 'attribute' 'schema'
    case 115321:                    // 'element' 'schema'
    case 115384:                    // 'namespace' 'schema'
    case 115416:                    // 'processing-instruction' 'schema'
    case 115794:                    // 'attribute' 'schema-attribute'
    case 115833:                    // 'element' 'schema-attribute'
    case 115896:                    // 'namespace' 'schema-attribute'
    case 115928:                    // 'processing-instruction' 'schema-attribute'
    case 116306:                    // 'attribute' 'schema-element'
    case 116345:                    // 'element' 'schema-element'
    case 116408:                    // 'namespace' 'schema-element'
    case 116440:                    // 'processing-instruction' 'schema-element'
    case 116818:                    // 'attribute' 'score'
    case 116857:                    // 'element' 'score'
    case 116920:                    // 'namespace' 'score'
    case 116952:                    // 'processing-instruction' 'score'
    case 117330:                    // 'attribute' 'self'
    case 117369:                    // 'element' 'self'
    case 117432:                    // 'namespace' 'self'
    case 117464:                    // 'processing-instruction' 'self'
    case 119890:                    // 'attribute' 'sliding'
    case 119929:                    // 'element' 'sliding'
    case 119992:                    // 'namespace' 'sliding'
    case 120024:                    // 'processing-instruction' 'sliding'
    case 120402:                    // 'attribute' 'some'
    case 120441:                    // 'element' 'some'
    case 120504:                    // 'namespace' 'some'
    case 120536:                    // 'processing-instruction' 'some'
    case 122962:                    // 'attribute' 'strict'
    case 123001:                    // 'element' 'strict'
    case 123064:                    // 'namespace' 'strict'
    case 123096:                    // 'processing-instruction' 'strict'
    case 124498:                    // 'attribute' 'switch'
    case 124537:                    // 'element' 'switch'
    case 124600:                    // 'namespace' 'switch'
    case 124632:                    // 'processing-instruction' 'switch'
    case 125010:                    // 'attribute' 'text'
    case 125049:                    // 'element' 'text'
    case 125112:                    // 'namespace' 'text'
    case 125144:                    // 'processing-instruction' 'text'
    case 128082:                    // 'attribute' 'try'
    case 128121:                    // 'element' 'try'
    case 128184:                    // 'namespace' 'try'
    case 128216:                    // 'processing-instruction' 'try'
    case 128594:                    // 'attribute' 'tumbling'
    case 128633:                    // 'element' 'tumbling'
    case 128696:                    // 'namespace' 'tumbling'
    case 128728:                    // 'processing-instruction' 'tumbling'
    case 129106:                    // 'attribute' 'type'
    case 129145:                    // 'element' 'type'
    case 129208:                    // 'namespace' 'type'
    case 129240:                    // 'processing-instruction' 'type'
    case 129618:                    // 'attribute' 'typeswitch'
    case 129657:                    // 'element' 'typeswitch'
    case 129720:                    // 'namespace' 'typeswitch'
    case 129752:                    // 'processing-instruction' 'typeswitch'
    case 131154:                    // 'attribute' 'unordered'
    case 131193:                    // 'element' 'unordered'
    case 131256:                    // 'namespace' 'unordered'
    case 131288:                    // 'processing-instruction' 'unordered'
    case 131666:                    // 'attribute' 'updating'
    case 131705:                    // 'element' 'updating'
    case 131768:                    // 'namespace' 'updating'
    case 131800:                    // 'processing-instruction' 'updating'
    case 133202:                    // 'attribute' 'validate'
    case 133241:                    // 'element' 'validate'
    case 133304:                    // 'namespace' 'validate'
    case 133336:                    // 'processing-instruction' 'validate'
    case 133714:                    // 'attribute' 'value'
    case 133753:                    // 'element' 'value'
    case 133816:                    // 'namespace' 'value'
    case 133848:                    // 'processing-instruction' 'value'
    case 134226:                    // 'attribute' 'variable'
    case 134265:                    // 'element' 'variable'
    case 134328:                    // 'namespace' 'variable'
    case 134360:                    // 'processing-instruction' 'variable'
    case 134738:                    // 'attribute' 'version'
    case 134777:                    // 'element' 'version'
    case 134840:                    // 'namespace' 'version'
    case 134872:                    // 'processing-instruction' 'version'
    case 136786:                    // 'attribute' 'while'
    case 136825:                    // 'element' 'while'
    case 136888:                    // 'namespace' 'while'
    case 136920:                    // 'processing-instruction' 'while'
    case 140370:                    // 'attribute' 'xquery'
    case 140409:                    // 'element' 'xquery'
    case 140472:                    // 'namespace' 'xquery'
    case 140504:                    // 'processing-instruction' 'xquery'
    case 141394:                    // 'attribute' '{'
    case 141408:                    // 'comment' '{'
    case 141431:                    // 'document' '{'
    case 141433:                    // 'element' '{'
    case 141496:                    // 'namespace' '{'
    case 141514:                    // 'ordered' '{'
    case 141528:                    // 'processing-instruction' '{'
    case 141556:                    // 'text' '{'
    case 141568:                    // 'unordered' '{'
      parse_PostfixExpr();
      break;
    default:
      parse_AxisStep();
    }
    eventHandler.endNonterminal("StepExpr", e0);
  }

  function try_StepExpr()
  {
    switch (l1)
    {
    case 82:                        // 'attribute'
      lookahead2W(282);             // EQName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 121:                       // 'element'
      lookahead2W(280);             // EQName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 184:                       // 'namespace'
    case 216:                       // 'processing-instruction'
      lookahead2W(279);             // NCName^Token | S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' |
      break;
    case 96:                        // 'comment'
    case 119:                       // 'document'
    case 202:                       // 'ordered'
    case 244:                       // 'text'
    case 256:                       // 'unordered'
      lookahead2W(245);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    case 124:                       // 'empty-sequence'
    case 152:                       // 'if'
    case 165:                       // 'item'
    case 243:                       // 'switch'
    case 253:                       // 'typeswitch'
      lookahead2W(238);             // S^WS | EOF | '!' | '!=' | '#' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' | '//' |
      break;
    case 73:                        // 'ancestor'
    case 74:                        // 'ancestor-or-self'
    case 93:                        // 'child'
    case 111:                       // 'descendant'
    case 112:                       // 'descendant-or-self'
    case 135:                       // 'following'
    case 136:                       // 'following-sibling'
    case 206:                       // 'parent'
    case 212:                       // 'preceding'
    case 213:                       // 'preceding-sibling'
    case 229:                       // 'self'
      lookahead2W(244);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    case 6:                         // EQName^Token
    case 70:                        // 'after'
    case 72:                        // 'allowing'
    case 75:                        // 'and'
    case 78:                        // 'array'
    case 79:                        // 'as'
    case 80:                        // 'ascending'
    case 81:                        // 'at'
    case 83:                        // 'base-uri'
    case 84:                        // 'before'
    case 85:                        // 'boundary-space'
    case 86:                        // 'break'
    case 88:                        // 'case'
    case 89:                        // 'cast'
    case 90:                        // 'castable'
    case 91:                        // 'catch'
    case 94:                        // 'collation'
    case 97:                        // 'constraint'
    case 98:                        // 'construction'
    case 101:                       // 'context'
    case 102:                       // 'continue'
    case 103:                       // 'copy'
    case 104:                       // 'copy-namespaces'
    case 105:                       // 'count'
    case 106:                       // 'decimal-format'
    case 108:                       // 'declare'
    case 109:                       // 'default'
    case 110:                       // 'delete'
    case 113:                       // 'descending'
    case 118:                       // 'div'
    case 120:                       // 'document-node'
    case 122:                       // 'else'
    case 123:                       // 'empty'
    case 125:                       // 'encoding'
    case 126:                       // 'end'
    case 128:                       // 'eq'
    case 129:                       // 'every'
    case 131:                       // 'except'
    case 132:                       // 'exit'
    case 133:                       // 'external'
    case 134:                       // 'first'
    case 137:                       // 'for'
    case 141:                       // 'ft-option'
    case 145:                       // 'function'
    case 146:                       // 'ge'
    case 148:                       // 'group'
    case 150:                       // 'gt'
    case 151:                       // 'idiv'
    case 153:                       // 'import'
    case 154:                       // 'in'
    case 155:                       // 'index'
    case 159:                       // 'insert'
    case 160:                       // 'instance'
    case 161:                       // 'integrity'
    case 162:                       // 'intersect'
    case 163:                       // 'into'
    case 164:                       // 'is'
    case 167:                       // 'json-item'
    case 170:                       // 'last'
    case 171:                       // 'lax'
    case 172:                       // 'le'
    case 174:                       // 'let'
    case 176:                       // 'loop'
    case 178:                       // 'lt'
    case 180:                       // 'mod'
    case 181:                       // 'modify'
    case 182:                       // 'module'
    case 185:                       // 'namespace-node'
    case 186:                       // 'ne'
    case 191:                       // 'node'
    case 192:                       // 'nodes'
    case 194:                       // 'object'
    case 198:                       // 'only'
    case 199:                       // 'option'
    case 200:                       // 'or'
    case 201:                       // 'order'
    case 203:                       // 'ordering'
    case 218:                       // 'rename'
    case 219:                       // 'replace'
    case 220:                       // 'return'
    case 221:                       // 'returning'
    case 222:                       // 'revalidation'
    case 224:                       // 'satisfies'
    case 225:                       // 'schema'
    case 226:                       // 'schema-attribute'
    case 227:                       // 'schema-element'
    case 228:                       // 'score'
    case 234:                       // 'sliding'
    case 235:                       // 'some'
    case 236:                       // 'stable'
    case 237:                       // 'start'
    case 240:                       // 'strict'
    case 248:                       // 'to'
    case 249:                       // 'treat'
    case 250:                       // 'try'
    case 251:                       // 'tumbling'
    case 252:                       // 'type'
    case 254:                       // 'union'
    case 257:                       // 'updating'
    case 260:                       // 'validate'
    case 261:                       // 'value'
    case 262:                       // 'variable'
    case 263:                       // 'version'
    case 266:                       // 'where'
    case 267:                       // 'while'
    case 270:                       // 'with'
    case 274:                       // 'xquery'
      lookahead2W(242);             // S^WS | EOF | '!' | '!=' | '#' | '(' | '(:' | ')' | '*' | '+' | ',' | '-' | '/' |
      break;
    default:
      lk = l1;
    }
    if (lk == 17486                 // 'array' '('
     || lk == 17575                 // 'json-item' '('
     || lk == 17602                 // 'object' '('
     || lk == 35922                 // 'attribute' 'after'
     || lk == 35961                 // 'element' 'after'
     || lk == 36024                 // 'namespace' 'after'
     || lk == 36056                 // 'processing-instruction' 'after'
     || lk == 38482                 // 'attribute' 'and'
     || lk == 38521                 // 'element' 'and'
     || lk == 38584                 // 'namespace' 'and'
     || lk == 38616                 // 'processing-instruction' 'and'
     || lk == 40530                 // 'attribute' 'as'
     || lk == 40569                 // 'element' 'as'
     || lk == 40632                 // 'namespace' 'as'
     || lk == 40664                 // 'processing-instruction' 'as'
     || lk == 41042                 // 'attribute' 'ascending'
     || lk == 41081                 // 'element' 'ascending'
     || lk == 41144                 // 'namespace' 'ascending'
     || lk == 41176                 // 'processing-instruction' 'ascending'
     || lk == 41554                 // 'attribute' 'at'
     || lk == 41593                 // 'element' 'at'
     || lk == 41656                 // 'namespace' 'at'
     || lk == 41688                 // 'processing-instruction' 'at'
     || lk == 43090                 // 'attribute' 'before'
     || lk == 43129                 // 'element' 'before'
     || lk == 43192                 // 'namespace' 'before'
     || lk == 43224                 // 'processing-instruction' 'before'
     || lk == 45138                 // 'attribute' 'case'
     || lk == 45177                 // 'element' 'case'
     || lk == 45240                 // 'namespace' 'case'
     || lk == 45272                 // 'processing-instruction' 'case'
     || lk == 45650                 // 'attribute' 'cast'
     || lk == 45689                 // 'element' 'cast'
     || lk == 45752                 // 'namespace' 'cast'
     || lk == 45784                 // 'processing-instruction' 'cast'
     || lk == 46162                 // 'attribute' 'castable'
     || lk == 46201                 // 'element' 'castable'
     || lk == 46264                 // 'namespace' 'castable'
     || lk == 46296                 // 'processing-instruction' 'castable'
     || lk == 48210                 // 'attribute' 'collation'
     || lk == 48249                 // 'element' 'collation'
     || lk == 48312                 // 'namespace' 'collation'
     || lk == 48344                 // 'processing-instruction' 'collation'
     || lk == 53842                 // 'attribute' 'count'
     || lk == 53881                 // 'element' 'count'
     || lk == 53944                 // 'namespace' 'count'
     || lk == 53976                 // 'processing-instruction' 'count'
     || lk == 55890                 // 'attribute' 'default'
     || lk == 55929                 // 'element' 'default'
     || lk == 55992                 // 'namespace' 'default'
     || lk == 56024                 // 'processing-instruction' 'default'
     || lk == 57938                 // 'attribute' 'descending'
     || lk == 57977                 // 'element' 'descending'
     || lk == 58040                 // 'namespace' 'descending'
     || lk == 58072                 // 'processing-instruction' 'descending'
     || lk == 60498                 // 'attribute' 'div'
     || lk == 60537                 // 'element' 'div'
     || lk == 60600                 // 'namespace' 'div'
     || lk == 60632                 // 'processing-instruction' 'div'
     || lk == 62546                 // 'attribute' 'else'
     || lk == 62585                 // 'element' 'else'
     || lk == 62648                 // 'namespace' 'else'
     || lk == 62680                 // 'processing-instruction' 'else'
     || lk == 63058                 // 'attribute' 'empty'
     || lk == 63097                 // 'element' 'empty'
     || lk == 63160                 // 'namespace' 'empty'
     || lk == 63192                 // 'processing-instruction' 'empty'
     || lk == 64594                 // 'attribute' 'end'
     || lk == 64633                 // 'element' 'end'
     || lk == 64696                 // 'namespace' 'end'
     || lk == 64728                 // 'processing-instruction' 'end'
     || lk == 65618                 // 'attribute' 'eq'
     || lk == 65657                 // 'element' 'eq'
     || lk == 65720                 // 'namespace' 'eq'
     || lk == 65752                 // 'processing-instruction' 'eq'
     || lk == 67154                 // 'attribute' 'except'
     || lk == 67193                 // 'element' 'except'
     || lk == 67256                 // 'namespace' '