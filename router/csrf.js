'use strict';
/**
 * CSRF 的测试用例
 *      formPage_form 会通过模版下发 token
 *      formPage_process 会对传上来的token做校验
 *  
 *      这里记得，组件，是不对cookie做检查的，开发者需要在接口中对cookie做校验，识别用户身份的。
 * 
 *    这里有个疑问，就是服务必须是，单进程，否则，多线程的时候，就没办法了。token就可能下发错误。
 * 所以，管理token的一定是一个落了存储的服务才行，或者一个单进程的服务。
 */
module.exports = CSRF;
var csrf = require('csurf');

// setup route middlewares 
var csrfProtection = csrf({ cookie: true });

function CSRF() {}

/**
 * 使用 token 的方式 进行csrf的防伪
 */
CSRF.formPage_form = function(req, res) {
    // pass the csrfToken to the view 
    console.log('from');
    res.render('send', { csrfToken: req.csrfToken() })
}

CSRF.formPage_process = function(req, res) {
    // pass the csrfToken to the view
    console.log('process');
    console.log('cookie = ', req.headers.cookie);
    res.send('data is being processed');
}



/**
 * 使用 g_tk 的方式，进行防卫。
 * 客户端和前端都采用一种伪随机的方式，进行 cookie 转 token，
 * csrf 的前提是没有xss，http劫持。如果有了xss和http劫持，那csrf就没有意义了。
 * 复合上面的需求，就保证了cookie是安全的，那么，既然不知道cookie的具体值，
 * 也就无法知道 g_tk 的值了。因此，就可以作为 csrf 的防护。
 */
CSRF.g_tk_demo = function(req, res) {
    console.log("g_tk  cookies = ", req.headers.cookie);
    let cookie = req.cookies['hg'];
    let g_tk = "";
    for (let i = 0; i < cookie.length; i++) {
        g_tk += cookie.charAt(i).charCodeAt();
    }

    res.render('g_tk', { g_tk: g_tk })


    // res.json({
    //     g_tk: g_tk,
    //     status: 'ok'
    // });
}

/**
 *  存在 g_tk
 */
CSRF.g_tk_have = function(req, res) {
    let cookie = req.cookies['hg'];
    let g_tk = "";
    for (let i = 0; i < cookie.length; i++) {
        g_tk += cookie.charAt(i).charCodeAt();
    }

    let user_g_tk = req.query['g_tk'] || "";

    console.log("user_g_tk = ", user_g_tk, "cookie = ", cookie, ' g_tk = ', g_tk);

    if (g_tk == "" || user_g_tk != g_tk) {
        res.json({
            msg: "error",
            status: '-200'
        });
    } else {
        res.json({
            msg: "ok",
            status: '200'
        });
    }
}

/**
 * 不存在 g_tk的 情况，认为就有问题啊，不是该用户过滤请求的数据。
 */
CSRF.ng_tk_have = function(req, res) {
    let cookie = req.cookies['hg'];
    let g_tk = "";
    for (let i = 0; i < cookie.length; i++) {
        g_tk += cookie.charAt(i).charCodeAt();
    }

    let user_g_tk = req.body['g_tk'] || "";
    if (g_tk == "" || user_g_tk != g_tk) {
        res.json({
            msg: "error",
            status: '-200'
        });
    } else {
        res.json({
            msg: "ok",
            status: '200'
        });
    }
}