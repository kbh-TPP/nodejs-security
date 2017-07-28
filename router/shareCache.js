/*
 XSS test 文件
 */

'use strict';

var cache = require('node-shared-cache');
var tool = require('./../module/tools');

class Cache {

    constructor() {
        // 创建 共享内存
        this.obj =  new cache.Cache("hg", 1024 * 1024);
    }

    _setItem (value) {
        this.obj.num = value;
    }

    _getItem () {
        return this.obj.num;
    }

    set (req, res) {
        console.log("set ....... ");
        sleep(2000);

        var num = parseInt(Math.random() * 10000);
        this._setItem(num);

        console.log('当前的 set process.pid = ', process.pid, ' num = ', num);
        res.json({
            status: "ok",
            pid : process.pid
        });
    }

    get (req, res) {
        console.log("get ......... ");
        sleep(2000);

        var num = this._getItem();
        console.log('当前的 get process.pid = ', process.pid, ' num = ', num);

        res.json({
            status: "get",
            num :num,
            pid : process.pid
        });
    }
}


// 休眠
function sleep(n) {
    var start = new Date().getTime();
    while (true) {
        if (new Date().getTime() - start > n) {
            break;
        }
    }
}


var cacheObj = tool.selfish(new Cache());

module.exports = cacheObj;