'use strict';
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cookieParser = require('cookie-parser'); // 解析cookie参数，绑定到req.header.cookies 上
const csrf = require('csurf');
const bodyParser = require('body-parser');
const logger = require('morgan'); // 日志组件，重定向console
const fs = require('fs');

// setup router and callback
const router = require('./router/index.js');
const XSS = require("./router/xss.js");
const CSRF = require('./router/csrf.js');


// setup route middlewares 
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });
const app = express();

app.use(compress()); // 压缩

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico')); // 设定icon

app.disable('x-powered-by'); // 关闭 错误码，堆栈信息 返回信息

app.use(bodyParser.json()); // json
app.use(bodyParser.urlencoded({ extended: false })); // 处理 特定Content-Type 文件头
app.use(cookieParser()); // 解析cookie
app.use(express.static(path.join(__dirname, 'public'))); // 静态路由
app.set('views', path.join(__dirname, 'views')); //  设定动态模版
app.set("view engine", "ejs"); // ejs 模版引擎

app.use(helmet()); // http 头设定


var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }); // 日志组件
app.use(logger('dev', { stream: accessLogStream })); // 日志


/**
 * 数据库相关操作
 */
const mysql = require("mysql");
let dbConfig = require("./model/db_config");
// let util = require("./lib/util")


// 请求入口
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "POST,GET");

    console.log("enter url * ", req.url, ' 验证 cookie ， 目前现有的cookie值： ', req.cookies, "\n");

    if (req.cookies['hg'] == undefined) { // 获取cookie
        res.cookie('hg', 'tencent-' + parseInt(Math.random() * 10000)); // 如果cookie不存在，就设定cookie值
    }

    next();
});


// 动态接口
var dynamicConfig = {
    '/xss-1/reflected/wrong': XSS.Reflected_wrong,
    '/xss-1/reflected/right': XSS.Reflected_right,
    'csrf-form': {
        '/formPage/form': CSRF.formPage_form,
        '/formData/process': CSRF.formPage_process,
    },

    '/g_tk_demo': CSRF.g_tk_demo,

    "g-tk": {
        "/g_tk_have": CSRF.g_tk_have,
        "/ng_tk_have": CSRF.ng_tk_have,
    }

    // 'sql': {
    //     'query': ""
    // }
};

router.init(app, dynamicConfig);

// 处理 404 的问题
app.use('*', function(req, res, next) {
    res.json({
        code: "error",
        msg: '404'
    });
});


// 开启服务
var server = app.listen(8888, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});