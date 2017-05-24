'use strict';
const express = require('express');
const Config = require('./conf/config.js'); // get config
/**
 * 数据库相关操作
 */
const mysql = require("mysql");
let util = require("./lib/util");
const Router = require("./router/index.js");


function init() {
    console.log('init begin.');
    console.log('process.env.NODE_ENV = ', process.env.NODE_ENV);

    process.on('uncaughtException', function(ex) {
        var msgType = "Server uncaughtException: ";
        console.error(msgType, ex);
    });

    process.on('exit', function() {
        console.log('SYSTEM -- [' + (new Date).toUTCString() + ' ] system exit, Good bye!');
    });

    process.on('SIGINT', function() {
        console.log('SYSTEM -- [' + (new Date).toUTCString() + ' ] system is killed, and now exit !');
        process.exit();
    });

    if (Config.isLocal) { //本地
        return Config.getLocalParam();

    } else if (Config.isTest) { //测试
        return Config.getTestTafConfig();

    } else if (Config.isReal) { //正式 production
        return Config.getTafConfig();

    } else { // 这里，本应该是正式环境的，默认是，没有的时候，使用正式环境，但是，由于服务没有正式环境，就写成测试环境。
        return Config.getLocalParam();
    }
}




init().then(function(data) {
    // console.log(data);

    if (!data) {
        throw new Error('config data is empty');
    }
    // 使用连接池，提升性能
    let db_pool = mysql.createPool(util.extend({}, data.mysql_db));
    var app = express();
    app.disable('x-powered-by'); // 关闭 错误码，堆栈信息 返回信息
    app.set("view engine", "ejs"); // ejs 模版引擎

    Router.init(app, db_pool); // 初始化路由，静态页面，中间件，动态路由

    // 处理 404 的问题
    app.use('*', function(req, res, next) {
        console.log("enter url * ", req.url, ' 验证 cookie ， 目前现有的cookie值： ', req.cookies, "\n");

        if (req.cookies == undefined || req.cookies['hg'] == undefined) { // 获取cookie
            res.cookie('hg', 'tencent-' + parseInt(Math.random() * 10000)); // 如果cookie不存在，就设定cookie值
        }

        res.json({
            code: "error",
            msg: '404'
        });
    });

    // Config.init(app, dbObj);
    // 共享内存初始化
    // Cache.init(dbObj);

    // app.set('NODE_ENV', process.env.NODE_ENV);
    // app.set('HTTP_PORT', data.monitorPort);
    // app.set('HTTPS_PORT', data.httpsPort);

    let server = app.listen(data.monitorPort, data.IP, function() {
        console.log('Express server listening on port', server.address().port);
    });

    console.log('init success');
});