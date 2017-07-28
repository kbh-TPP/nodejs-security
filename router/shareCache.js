/*
 XSS test 文件
 */


module.exports = Cache;
var cache = require('@tencent/node-shared-cache');



function Cache() {
    // 创建 共享内存
    this.obj =  new cache.Cache("hg", 1024 * 1024);

    // this.init = function() {
    //     this.obj = new binding.Cache("hg", '1048576');
    // };

    this.setItem = function(value) {
        this.obj.hg = value;
    };

    this.getItem = function(value) {
        return this.obj.hg
    };
}

var cacheObj = new Cache();



// 休眠
function sleep(n) {
    var start = new Date().getTime();
    while (true) {
        if (new Date().getTime() - start > n) {
            break;
        }
    }
}

// 1 —— 设定 共享 内存
Cache.set = function (req, res) {
    console.log("set ....... ");
    sleep(2000);

    var num = parseInt(Math.random() * 10000);
    cacheObj.setItem(num);
    console.log('当前的 set process.pid = ', process.pid, ' num = ', num);
    res.json({
        status: "ok",
        pid : process.pid
    });
};

// 1 —— 获取 共享 内存
Cache.get = function (req, res) {
    console.log("get ......... ");
    sleep(2000);

    var num = cacheObj.getItem();
    console.log('当前的 get process.pid = ', process.pid, ' num = ', num);

    res.json({
        status: "get",
        num :num,
        pid : process.pid
    });
};