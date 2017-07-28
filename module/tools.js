'use strict';


module.exports = Tools;

function Tools() {}


// 代理的方案，防止 this.XXX 找不到 XXX 方法
Tools.selfish = function (target) {
    const cache = new WeakMap();
    const handler = {
        get (target, key) {
            const value = Reflect.get(target, key);
            if (typeof value !== 'function') {
                return value;
            }
            if (!cache.has(value)) {
                cache.set(value, value.bind(target));
            }
            return cache.get(value);
        }
    };
    const proxy = new Proxy(target, handler);
    return proxy;
};
