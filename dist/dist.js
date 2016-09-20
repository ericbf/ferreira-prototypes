(function () {
    Object.defineProperties(Array.prototype, {
        remove: {
            value: function remove(comp, thisArg) {
                var index = this.findIndex(comp, thisArg);
                if (index >= 0) {
                    return this.splice(index, 1)[0];
                }
                return undefined;
            }
        },
        removeItem: {
            value: function removeItem(item, fromIndex) {
                if (fromIndex === void 0) { fromIndex = 0; }
                var index = this.indexOf(item, fromIndex);
                if (index >= 0) {
                    return this.splice(index, 1)[0];
                }
                return undefined;
            }
        },
        first: {
            get: function first() {
                return this[0];
            },
            set: function first(value) {
                if (this.length) {
                    this[0] = value;
                }
            }
        },
        last: {
            get: function last() {
                return this[this.length - 1];
            },
            set: function last(value) {
                if (this.length) {
                    this[this.length - 1] = value;
                }
            }
        },
        sortBy: {
            value: function sortBy() {
                var propsOrOptionses = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    propsOrOptionses[_i - 0] = arguments[_i];
                }
                var sorters = [];
                var index = 0;
                if (!propsOrOptionses.length) {
                    return this;
                }
                var _loop_1 = function (propOrOptions) {
                    var descending = false, sorter = undefined, accessor = void 0;
                    if (typeof propOrOptions === "string") {
                        accessor = function (item) { return item[propOrOptions]; };
                    }
                    else {
                        var options_1 = propOrOptions;
                        descending = options_1.descending;
                        if (typeof options_1.sorter === "function") {
                            sorter = options_1.sorter;
                        }
                        if (typeof options_1.property === "string") {
                            accessor = function (item) { return item[options_1.property]; };
                        }
                        else if (typeof options_1.accessor === "function") {
                            accessor = options_1.accessor;
                        }
                        else {
                            return "continue";
                        }
                    }
                    if (!sorter) {
                        sorter = defaultSorter(accessor, descending);
                    }
                    sorters.push(sorter);
                };
                for (var _a = 0, propsOrOptionses_1 = propsOrOptionses; _a < propsOrOptionses_1.length; _a++) {
                    var propOrOptions = propsOrOptionses_1[_a];
                    _loop_1(propOrOptions);
                }
                function defaultSorter(accessor, descending) {
                    return function (lhs, rhs) {
                        var lhv = accessor(lhs), rhv = accessor(rhs);
                        if (lhv === rhv) {
                            return 0;
                        }
                        if (descending ? lhv < rhv : lhv > rhv) {
                            return 1;
                        }
                        return -1;
                    };
                }
                this.sort(recursiveSorter);
                function recursiveSorter(lhs, rhs) {
                    var order = 0;
                    if (sorters.length > index) {
                        order = sorters[index](lhs, rhs);
                        if (!order) {
                            index++;
                            order = recursiveSorter(lhs, rhs);
                            index--;
                        }
                    }
                    return order;
                }
                return this;
            }
        },
        contains: {
            value: function contains(comp, thisArg) {
                return this.findIndex(comp, thisArg) >= 0;
            }
        },
        containsItem: {
            value: function containsItem(item, thisArg) {
                return this.indexOf(item, thisArg) >= 0;
            }
        }
    });
})();
(function () {
    var $$memoizeUniqueId = 0;
    Object.defineProperties(Function.prototype, {
        curry: {
            value: function curry() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var that = this;
                return function curried() {
                    return that.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
                };
            }
        },
        memoize: {
            value: function memoize(options) {
                if (options === void 0) { options = {}; }
                var defaults = {
                    excludedArguments: [],
                    argumentsCount: undefined,
                    asynchronous: false
                };
                for (var key in defaults) {
                    if (!(key in options)) {
                        options[key] = defaults[key];
                    }
                }
                var that = this, cache = {};
                return function memoized() {
                    var keys = Array.prototype.filter.call(arguments, function removeFromKeys(obj, index) {
                        return options.excludedArguments.indexOf(index) < 0;
                    });
                    if (typeof options.argumentsCount === "number" && isFinite(options.argumentsCount)) {
                        keys.length = options.argumentsCount;
                    }
                    else if (keys.length !== options.argumentsCount) {
                        options.argumentsCount = keys.length;
                    }
                    var subcache = cache;
                    while (keys.length) {
                        var argument = keys.shift();
                        if (typeof argument !== "string") {
                            try {
                                if (!("$$memoizeUniqueId" in argument)) {
                                    Object.defineProperty(argument, "$$memoizeUniqueId", {
                                        value: String($$memoizeUniqueId++)
                                    });
                                }
                                argument = argument.$$memoizeUniqueId;
                            }
                            catch (e) {
                                try {
                                    argument = JSON.stringify(argument);
                                }
                                catch (e) {
                                    argument = String(argument);
                                }
                            }
                        }
                        if (!(argument in subcache)) {
                            subcache = subcache[argument] = {};
                        }
                        else {
                            subcache = subcache[argument];
                        }
                    }
                    if (!("value" in subcache)) {
                        subcache.value = that.apply(this, arguments);
                        if (options.asynchronous) {
                            subcache.value.catch(function unsave() {
                                delete subcache.value;
                            });
                        }
                    }
                    return subcache.value;
                };
            }
        },
        throttle: {
            value: function throttle(wait, immediate) {
                if (wait === void 0) { wait = 0; }
                if (immediate === void 0) { immediate = true; }
                var func = this;
                var timeout;
                return function throttled() {
                    var context = this, args = arguments;
                    if (immediate && !timeout) {
                        func.apply(context, arguments);
                    }
                    if (!timeout) {
                        timeout = setTimeout(function () {
                            timeout = undefined;
                            if (!immediate) {
                                func.apply(context, args);
                            }
                        }, wait);
                    }
                };
            }
        },
        debounce: {
            value: function debounce(wait, immediate) {
                if (wait === void 0) { wait = 0; }
                if (immediate === void 0) { immediate = false; }
                var func = this;
                var timeout;
                return function debounced() {
                    var context = this, args = arguments;
                    if (immediate && !timeout) {
                        func.apply(context, args);
                    }
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        timeout = undefined;
                        if (!immediate) {
                            func.apply(context, args);
                        }
                    }, wait);
                };
            }
        }
    });
})();
(function () {
    var animators = [], fps = 60, speed = 1000 / fps;
    var isRunning = false;
    var animateCycle = throttle(function () {
        var now = new Date().getTime();
        for (var i = animators.length - 1; i >= 0; i--) {
            if (!animators[i](now)) {
                animators.splice(i, 1);
            }
        }
        if (animators.length) {
            isRunning = true;
            setTimeout(animateCycle, speed);
        }
        else {
            isRunning = false;
        }
    });
    function throttle(func) {
        var timeout;
        return function throttled() {
            var context = this, args = arguments;
            if (!timeout) {
                timeout = setTimeout(function () {
                    timeout = undefined;
                    func.apply(context, args);
                });
            }
        };
    }
    function addAnimator(animator) {
        if (animators.indexOf(animator) < 0) {
            animators.push(animator);
        }
        if (!isRunning) {
            animateCycle();
        }
    }
    Object.defineProperties(HTMLElement.prototype, {
        inDOM: {
            get: function inDOM() {
                return document.body.contains(this);
            }
        },
        highestParent: {
            get: function highestParent() {
                var parent = this;
                while (parent.parentElement) {
                    parent = parent.parentElement;
                }
                return parent;
            }
        },
        isScrollable: {
            get: function () {
                var style = window.getComputedStyle(this);
                return style.overflowY === "auto" || style.overflowY === "scroll";
            }
        },
        scrollableParent: {
            get: function () {
                var parent = this.parentElement;
                while (parent && !parent.isScrollable) {
                    parent = parent.parentElement;
                }
                return parent;
            }
        },
        parentTop: {
            get: function () {
                if (!this.parentElement) {
                    return;
                }
                return this.totalOffsetTop - this.parentElement.totalOffsetTop;
            }
        },
        absoluteTop: {
            get: function () {
                var offset = 0, element = this;
                while (element.parentElement) {
                    offset += element.parentTop;
                    offset -= element.parentElement.scrollTop;
                    element = element.parentElement;
                }
                return offset;
            }
        },
        totalOffsetTop: {
            get: function () {
                var offset = 0, element = this;
                while (element.offsetParent) {
                    offset += element.offsetTop;
                    element = element.offsetParent;
                }
                return offset;
            }
        },
        parentLeft: {
            get: function () {
                if (!this.parentElement) {
                    return;
                }
                return this.totalOffsetLeft - this.parentElement.totalOffsetLeft;
            }
        },
        absoluteLeft: {
            get: function () {
                var offset = 0, element = this;
                while (element.parentElement) {
                    offset += element.parentLeft;
                    offset -= element.parentElement.scrollLeft;
                    element = element.parentElement;
                }
                return offset;
            }
        },
        totalOffsetLeft: {
            get: function () {
                var offset = 0, element = this;
                while (element.offsetParent) {
                    offset += element.offsetLeft;
                    element = element.offsetParent;
                }
                return offset;
            }
        },
        scrollTo: {
            value: function (topOrOptions, duration, timing) {
                if (duration === void 0) { duration = 250; }
                if (timing === void 0) { timing = "ease-out"; }
                var that = this, startTime = new Date().getTime();
                var targetTop, targetLeft;
                if (typeof topOrOptions === "number") {
                    targetTop = topOrOptions;
                }
                else {
                    targetTop = topOrOptions.top;
                    targetLeft = topOrOptions.left;
                }
                if (typeof targetTop === "number") {
                    var start = this.scrollTop, down_1 = targetTop > start, tween_1 = makeTween(start, targetTop, duration, timing);
                    var expected_1 = start;
                    addAnimator(function (time) {
                        var current = that.scrollTop, newScroll = tween_1(time - startTime);
                        if (time > startTime + duration || (down_1 ? newScroll >= targetTop : newScroll <= targetTop)) {
                            that.scrollTop = targetTop;
                        }
                        else if (current === expected_1) {
                            that.scrollTop = newScroll;
                            expected_1 = that.scrollTop;
                            return true;
                        }
                    });
                }
                if (typeof targetLeft === "number") {
                    var start = this.scrollLeft, right_1 = targetLeft > start, tween_2 = makeTween(start, targetLeft, duration, timing);
                    var expected_2 = start;
                    addAnimator(function (time) {
                        var current = that.scrollLeft, newScroll = tween_2(time - startTime);
                        if (time > startTime + duration || (right_1 ? newScroll >= targetLeft : newScroll <= targetLeft)) {
                            that.scrollLeft = targetLeft;
                        }
                        else if (current === expected_2) {
                            that.scrollLeft = newScroll;
                            expected_2 = that.scrollLeft;
                            return true;
                        }
                    });
                }
                function makeTween(start, end, duration, timing) {
                    var valueMaker;
                    switch (timing) {
                        case "linear":
                            valueMaker = function valueMaker(x) {
                                return x;
                            };
                            break;
                        case "ease-out":
                        default:
                            valueMaker = function valueMaker(x) {
                                return -Math.pow(x - 1, 2) + 1;
                            };
                            break;
                    }
                    return function tween(time) {
                        return (end - start) * valueMaker(duration > 0 ? time / duration : 1) + start;
                    };
                }
            }
        },
        scrollIntoViewIfNeeded: {
            value: function (duration, padding, timing) {
                if (padding === void 0) { padding = 0; }
                var scrollers = [];
                for (var curr = this, child = this, offsetTop = 0, offsetLeft = 0; curr.parentElement; curr = curr.parentElement) {
                    offsetTop += curr.parentTop;
                    offsetLeft += curr.parentLeft;
                    if (curr.parentElement.isScrollable) {
                        scrollers.push({
                            element: curr.parentElement,
                            viewport: {
                                width: curr.parentElement.clientWidth,
                                height: curr.parentElement.clientHeight
                            },
                            scrollLeft: curr.parentElement.scrollLeft,
                            offsetLeft: offsetLeft,
                            width: child.offsetWidth,
                            scrollTop: curr.parentElement.scrollTop,
                            offsetTop: offsetTop,
                            height: child.offsetHeight
                        });
                        offsetTop = 0;
                        child = curr.parentElement;
                    }
                }
                scrollers.forEach(function doScroll(options) {
                    var scrollTop = options.scrollTop, scrollLeft = options.scrollLeft;
                    if (options.offsetTop + options.height > options.viewport.height + options.scrollTop + padding) {
                        scrollTop = options.offsetTop + options.height - options.viewport.height + padding;
                    }
                    else if (options.offsetTop < options.scrollTop - padding) {
                        scrollTop = options.offsetTop - padding;
                    }
                    if (options.offsetLeft + options.width > options.viewport.width + options.scrollLeft + padding) {
                        scrollLeft = options.offsetLeft + options.width - options.viewport.width + padding;
                    }
                    else if (options.offsetLeft < options.scrollLeft - padding) {
                        scrollLeft = options.offsetLeft - padding;
                    }
                    options.element.scrollTo({
                        top: scrollTop,
                        left: scrollLeft
                    }, duration, timing);
                });
            }
        }
    });
})();
(function () {
    Object.defineProperties(Object.prototype, {
        merge: {
            value: function override() {
                var _this = this;
                var others = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    others[_i - 0] = arguments[_i];
                }
                others.forEach(function (one) {
                    if (one) {
                        for (var key in one) {
                            if (one.hasOwnProperty(key)) {
                                var desc = Object.getOwnPropertyDescriptor(one, key);
                                try {
                                    Object.defineProperty(_this, key, desc);
                                }
                                catch (e) {
                                }
                            }
                        }
                    }
                });
                return this;
            }
        },
        override: {
            value: function override(func, newFunc) {
                if (!this._super) {
                    this._super = {};
                }
                if (!this._super[func]) {
                    this._super[func] = this[func];
                }
                this[func] = newFunc;
                return this;
            }
        },
        setWatcher: {
            value: function setWatcher(property, didSet, willSet) {
                this.removeWatcher(property);
                return this.addWatcher(property, didSet, willSet);
            }
        },
        addWatcher: {
            value: function addWatcher(property, didSet, willSet) {
                if (!this._values) {
                    Object.defineProperty(this, "_values", {
                        value: {}
                    });
                }
                if (!this._willSets) {
                    Object.defineProperty(this, "_willSets", {
                        value: {}
                    });
                }
                if (!this._didSets) {
                    Object.defineProperty(this, "_didSets", {
                        value: {}
                    });
                }
                if (typeof willSet === "function") {
                    if (!this._willSets[property]) {
                        this._willSets[property] = [];
                    }
                    if (this._willSets[property].indexOf(willSet) < 0) {
                        this._willSets[property].push(willSet);
                    }
                }
                if (typeof didSet === "function") {
                    if (!this._didSets[property]) {
                        this._didSets[property] = [];
                    }
                    if (this._didSets[property].indexOf(didSet) < 0) {
                        this._didSets[property].push(didSet);
                    }
                }
                var makeApplyer = function (context, newValue, oldValue, property) {
                    return function (callback) { return callback.call(context, newValue, oldValue, property); };
                };
                this._values[property] = this[property];
                delete this[property];
                Object.defineProperty(this, property, {
                    get: function getProperty() {
                        return this._values[property];
                    },
                    set: function setProperty(newValue) {
                        var oldValue = this._values[property];
                        if (this._willSets[property]) {
                            this._willSets[property].forEach(makeApplyer(this, newValue, oldValue, property));
                        }
                        this._values[property] = newValue;
                        if (this._didSets[property]) {
                            this._didSets[property].forEach(makeApplyer(this, newValue, oldValue, property));
                        }
                        return newValue;
                    },
                    enumerable: true,
                    configurable: true
                });
                return this;
            }
        },
        removeWatcher: {
            value: function removeWatcher(property, didSet, willSet) {
                if (typeof didSet !== "function" && typeof willSet !== "function") {
                    if (this._willSets && this._willSets[property]) {
                        this._willSets[property].length = 0;
                    }
                    if (this._didSets && this._didSets[property]) {
                        this._didSets[property].length = 0;
                    }
                }
                else {
                    if (this._willSets && this._willSets[property] && typeof willSet === "function") {
                        removeFromArray(this._willSets[property], willSet);
                    }
                    if (this._didSets && this._didSets[property] && typeof didSet === "function") {
                        removeFromArray(this._didSets[property], didSet);
                    }
                }
                function removeFromArray(arr, item) {
                    var i = arr.indexOf(item);
                    if (i >= 0) {
                        arr.splice(i, 1);
                    }
                }
            }
        },
        getNestedProperty: {
            value: function getNestedProperty() {
                var properties = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    properties[_i - 0] = arguments[_i];
                }
                var value = this;
                for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
                    var property = properties_1[_a];
                    try {
                        value = value[property];
                    }
                    catch (e) {
                        return undefined;
                    }
                }
                return value;
            }
        },
        valuesArray: {
            get: function valuesArray() {
                var values = [];
                for (var key in this) {
                    values.push(this[key]);
                }
                return values;
            }
        }
    });
})();
(function () {
    var lowers = [
        "A", "An", "The", "And", "But", "Or", "For", "Nor", "As", "At",
        "By", "For", "From", "In", "Into", "Near", "Of", "On", "Onto", "To", "With"
    ], specials = [{
            expect: "Ios",
            desire: "iOS"
        }, {
            expect: "Iphone",
            desire: "iPhone"
        }, {
            expect: "Ipad",
            desire: "iPad"
        }, {
            expect: "Ipod",
            desire: "iPod"
        }, {
            expect: "Watchos",
            desire: "watchOS"
        }, {
            expect: "Macos",
            desire: "macOS"
        }, {
            expect: "Os",
            desire: "OS"
        }, {
            expect: "Htc",
            desire: "HTC"
        }, {
            expect: "Zte",
            desire: "ZTE"
        }], ignores = [
        "US",
        "RIM"
    ];
    Object.defineProperties(String.prototype, {
        contains: {
            value: function contains(str, caseInsensitve) {
                if (caseInsensitve === void 0) { caseInsensitve = false; }
                return new RegExp(str.toRegExpEscaped(), caseInsensitve ? "i" : "").test(this);
            }
        },
        toTitleCase: {
            value: function toTitleCase() {
                var str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                    if (ignores.indexOf(txt) >= 0) {
                        return txt;
                    }
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                for (var _i = 0, lowers_1 = lowers; _i < lowers_1.length; _i++) {
                    var lower = lowers_1[_i];
                    str = str.replace(new RegExp("[\\s\\-]" + lower + "[\\s\\-]", "g"), function (txt) { return txt.toLowerCase(); });
                }
                for (var _a = 0, specials_1 = specials; _a < specials_1.length; _a++) {
                    var special = specials_1[_a];
                    str = str.replace(new RegExp("[\\s\\-]" + special.expect + "[\\s\\-]", "g"), special.desire);
                }
                return str;
            }
        },
        toSnakeCase: {
            value: function toSnakeCase() {
                if (/^[A-Z_0-9]+$/.test(this)) {
                    return this.toLowerCase().replace(/_/g, "-");
                }
                return this.replace(/(?!^)([A-Z])/g, "-$1").toLowerCase();
            }
        },
        toCamelCase: {
            value: function toSnakeCase() {
                return this.toLowerCase().replace(/(?!^)[_-]([a-z])/g, function (_, match) { return match.toUpperCase(); });
            }
        },
        toRegExpEscaped: {
            value: function toRegExpEscaped() {
                return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }
        }
    });
})();
//# sourceMappingURL=dist.js.map