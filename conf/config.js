'use strict';


module.exports = Config;

// 中间件
const favicon = require('serve-favicon');
const compress = require('compression');
const cookieParser = require('cookie-parser'); // 解析cookie参数，绑定到req.header.cookies 上
const csrf = require('csurf');
const bodyParser = require('body-parser');
const logger = require('morgan'); // 日志组件，重定向console
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }); // 日志组件


// setup router and callback
// const Router = require('./router/index.js');
const XSS = require("./../router/xss.js");
// const CSRF = require('./../router/csrf.js');

const CSRF = require('./../router/csrfClass');

const SQL = require('./../router/sql.js');
const Cache = require('./../router/shareCache');    // 共享缓存


function Config() {}

// 如果不存在 process.env.NODE_ENV 这个环境变量，就默认是本地环境
process.env.NODE_ENV = (process.env.NODE_ENV == undefined ? 'local' : process.env.NODE_ENV);
Config.isLocal = process.env.NODE_ENV == 'local';
Config.isTest = process.env.NODE_ENV == 'test';
Config.isReal = process.env.NODE_ENV == 'production';


var csrfobj = new CSRF();

// ----------------------------------------------------------------------------------------------------------------------------

// router 初始化

/**
 * 1 —— 通用设置, 
 *      需要初始化 —— DB，
 *      初始化 —— 屏蔽 安全扫描，在上线之前，测试阶段，打开安全扫描
 * @param dbObj 是初始化之后DB实例。
 */
Config.getCommonFuncs = function(dbObj) {
    return {
        '/': function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "POST,GET");

            // 过滤安全扫描，有时候调试的时候，很烦。
            // 这里假设 —— 安全扫描具有如下头：[header-safe-scan]，这样，遇到如下的情况的时候，就获取IP。
            // X-Forwarded-For(XFF)是用来识别通过HTTP代理或负载均衡方式连接到Web服务器的客户端最原始的IP地址的HTTP请求头字段。
            // 以下2个字段，都是搞这个的。记忆一下。 下面的字段都是为了获取IP的。
            if (req.headers && req.headers['header-safe-scan']) {
                var reqIp = req.headers['x-forwarded-for-pound'] ||
                    req.headers['x-forwarded-for'] ||
                    (req.connection && req.connection.remoteAddress) ||
                    (req.socket && req.socket.remoteAddress) ||
                    (req.connection && req.connection.socket && req.connection.socket.remoteAddress);

                console.log('ScanFilter  reqIp : [' + reqIp + '] | url : [' + req.url + '] | header-safe-scan : [' +
                    req.headers['header-safe-scan'] + ']');

                res.json();
                return;
            }
            req.db = dbObj;

            next();
        }
    };
};

/**
 * 2 —— 中间件 列表 
 */
Config.getMiddlewareList = function() {
    return {
        bodyParser_json: bodyParser.json(), //json 解析
        bodyParser_raw: bodyParser.raw(),
        bodyParser_urlencoded: bodyParser.urlencoded({ extended: false }), // 处理 特定Content-Type 文件头
        compress: compress(), //压缩
        favicon: favicon(__dirname + '/../public/favicon.ico'), //图标
        cookieParser: cookieParser(), // 解析cookie
        helmet: helmet(), // 头盔
        logger: logger('dev', { stream: accessLogStream }) // 日志
    };
};

/**
 * 3 —— 静态文件路由
 */
Config.getStaticConfig = function() {
    // app.use(express.static(); // 静态路由
    return {
        'public': path.join(__dirname, 'public'),
        'static': path.join(__dirname, 'static')
    };
}


/**
 * 4 —— 获取动态路由
 */
Config.getDynamicConfig = function() {
    return {
        '/xss-1/reflected/wrong': XSS.Reflected_wrong,
        '/xss-1/reflected/right': XSS.Reflected_right,

        // 'csrf-form': {
        //     '/formPage/form': CSRF.formPage_form,
        //     '/formData/process': CSRF.formPage_process,
        // },
        // '/g_tk_demo': CSRF.g_tk_demo,
        //
        // "g-tk": {
        //     "/g_tk_have": CSRF.g_tk_have,
        //     "/ng_tk_have": CSRF.ng_tk_have,
        // },

        //
        // 'csrf-form': {
        //     '/formPage/form': csrfobj.formPage_form,
        //     '/formData/process': csrfobj.formPage_process,
        // },

        '/g_tk_demo': csrfobj.g_tk_demo,

        "g-tk": {
            "/g_tk_have": csrfobj.g_tk_have,
            "/ng_tk_have": csrfobj.ng_tk_have,
        },

        // 'sql': {
        //     'add':
        // }
        'cache' : {
            "/cacheget": Cache.get,
            "/cacheset": Cache.set
        }

    };
};


// 服务初始化参数的设计

// TAF配置文件变量
Config.tafCfg = {};

// TAF配置文件变量
Config.prxCfg = {}; // 如果是taf 服务，就遵循出事花   

Config.getLocalParam = function() {
    Object.assign(Config.tafCfg, {
        mysql_db: { // 这里可以添加多个DB，这里只是举个例子。
            host: '127.0.0.1',
            user: 'root',
            password: 'haigecao',
            database: 'nodejs_safe_info',
            port: 3306,
            charset: 'utf8_bin',
            supportBigNumbers: true,
            bigNumberStrings: true,
            multipleStatements: true,
            dateStrings: true,
            debug: false,
            insecureAuth: true
        },
        monitorPort: 8888,
        IP: '127.0.0.1',
        gray_machine: {}, //  这里可以初始化多种参数，以下只是举例了3个
        arguments1: "one",
        arguments2: "two",
    });

    return Promise.resolve(Config.tafCfg);
}

Config.getTestTafConfig = function() {}

Config.getTafConfig = function() {}



// 这里是判断是否是本地环境，如果不是本地环境，就进行初始化。调用平台的配置参数。
// 通过配置平台进行获取。
if (!Config.isLocal) {
    tafConfig = new TafConfigHelper(); // 这个理解为一个组件就好，获取平台配置信息

    // 配置数据推送接收
    tafConfig.on("configPushed", function(file, content) {
        console.log("configPushed:", file, content);

        if (Config.isTest) { //测试
            Config.getTestTafConfig();
        } else if (Config.isReal) { //正式 production
            Config.getTafConfig();
        } else {
            Config.getTafConfig();
        }
    });
}