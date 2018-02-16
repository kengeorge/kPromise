"use strict";

const format = require('util').format;
const P = Promise;

module.exports = {
    log: log,
    pretty: pretty,
    tap: tap,
    print: print,
    peek: peek,

    startWith: startWith,
    get: get,
    forEach: forEach,
    decorate: decorate,
    passBefore: passBefore,
};

function log() {
    let formatted = format.apply(this, Array.from(arguments).map(pretty));
    console.log(formatted);
}

function pretty(data) {
    if(typeof data === 'object') return JSON.stringify(data, null, 2);
    return data;
}

function tap(tapFunc) {
    return function(input) {
        tapFunc(input);
        return input;
    }
}

function print(message) {
    return function(input) {
        log(message);
        return input;
    };
}

function peek(input) {
    return tap(log)(input);
}

function startWith(value) {
    return P.resolve(value);
}

function get(field) {
    return (input) => P.resolve(input[field]);
}

function forEach(func) {
    return function(input) {
        if(Array.isArray(input)) return forEachItem(func)(input);
        return forEachField(func)(input);
    };
}


function forEachItem(func) {
    return function(items) {
        return P.all(items.map((item) => P.resolve(func(item))));
    };
}

function forEachField(callFunc) {
    return function(input) {
        let calls = [];
        for(let kv in Object.entries(input)) {
            let key = kv[0];
            let val = kv[1];
            calls.push(wrap(callFunc, key, val));
        }
        return P.all(calls);
    };
}

function wrap(func, k, v) {
    return new P(() => func(k, v));
}

/**
 * Assigns the result of the handler ot the given field of the input.
 * Even when called via then (without 'tap' or similar), this will not change the original input.
 * i.e. {one: 1, two: 2} -> decorate('three', function(){return 3;} -> {one: 1, two: 2:, three: 3}
 */
function decorate(fieldName, promiseFunc) {
    return function(input) {
        log("Decorating %s", input);
        return startWith(promiseFunc(input))
            .then(print("HAVE FIELD"))
            .then(peek)
            .then((results) => {
                log("Setting %s on %s to %s", fieldName, input, results);
                input[fieldName] = results;
                return input;
            });
    };
}


/**
 * Takes the input and calls the given function (passed as the first argument)
 * with any additional arguments also passed to the function AFTER the input argument.
 * i.e. {one: 1, two: 2} -> .then(passBefore(func, 'three')) -> calls func({one: 1, two: 2}, 'three')
 */
function passBefore() {
    let varArgs = Array.from(arguments);
    let callFunc = varArgs.shift();
    return function(input) {
        varArgs.unshift(input);
        return callFunc.apply(undefined, varArgs);
    };
}
