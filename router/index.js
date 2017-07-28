'use strict';

module.exports = Router;
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const Config = require('../conf/config.js');
const express = require('express');

function Router() {
}

/**
 *  这里有个疑虑，LOG注册的地点，怎么解决。思考一下。
 */
Router.init = function (app, dbObj) {
    Router.registerCommonFuncs(app, dbObj); // 初始化服务通用参数
    Router.initMiddleware(app); // 初始化服务中间件
    // Router.registerLogFuncs(app);           // 先后顺序不同，打印日志条数也会不同, 日志和染色的结合体
    Router.initStaticRes(app); // 初始化静态资源请求
    Router.registerDynamicPage(app); // 初始化动态接口 
};


/**
 *      注册头部函数，设定http头，讲DBA的实例，挂载到req上
 *
 * @param app express启动的实例
 * @param dbObj DBA的实例， 如果是有多个DB，dbObj就是一个对象，对应了多个实例
 */
Router.registerCommonFuncs = function (app, dbObj) {
    var config = Config.getCommonFuncs(dbObj);
    for (var i in config) {
        //console.info("registerCommonFuncs key = " + i + ", value = " + config[i]);
        try {
            app.use(i, config[i]);
        } catch (e) {
            log.error("initMiddleware error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};


/**
 * 注册中间件
 *    包含，cookie，json，压缩，g_tk,
 */
Router.initMiddleware = function (app) {
    var config = Config.getMiddlewareList();

    for (var i in config) {
        // console.info("initMiddleware key = " + i);
        try {
            app.use(config[i]);
        } catch (e) {
            console.error("init Middleware error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
}

/**
 * 注册静态文件路由
 *
 */
Router.initStaticRes = function (app) {
    var config = Config.getStaticConfig();
    for (var i in config) {
        //console.info("mountStaticRes key = " + i + ", value = " + config[i]);
        try {
            app.use(i, express.static(config[i]));
        } catch (e) {
            console.error("init static resouce error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};

// 注册动态路由
Router.registerDynamicPage = function (app) {
    let config = Config.getDynamicConfig();
    for (let i in config) {
        if (i === 'csrf-form') { // 注册 csrf token 解决方式
            for (let k in config['csrf-form']) {
                try {
                    app.use(k, csrfProtection, config['csrf-form'][k]);
                } catch (e) {
                    console.error("register dynamic csrf-form error, key = " + k + ", value = " + config['csrf-form'][k] + ", e = " + e.message);
                }
            }
        } else if (i === "g-tk") { // 构造 csrf g_tk 解决方式

            for (let j in config['g-tk']) {
                try {
                    app.use(j, config["g-tk"][j]);
                } catch (e) {
                    console.error("register dynamic page error, key = " + j + ", value = " + config['g-tk'][j] + ", e = " + e.message);
                }
            }

        } else if (i == 'cache') {  // 构造 共享缓存

            for (let m in config['cache']) {
                try {
                    app.use(m, config["cache"][m]);
                } catch (e) {
                    console.error("register dynamic cache error, key = " + m + ", value = " + config['g-tk'][m] + ", e = " + e.message);
                }
            }

        } else {
            try {
                app.use(i, config[i]);
            } catch (e) {
                console.error("register dynamic page error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
            }
        }

    }
};