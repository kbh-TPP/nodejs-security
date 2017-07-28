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

var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

// 创建 csrf 类
class Csrf {
    constructor() {}

    g_tk_demo(req, res) {
        try {
            // console.log("g_tk  cookies = ", req.headers.cookie);
            let cookie = req.cookies['hg'] || "";

            if (cookie == "") {
                // console.log('cookie is null\n');
                return res.render('g_tk', {g_tk: 'none'});

            } else {
                let g_tk = "";

                for (let i = 0; i < cookie.length; i++) {
                    g_tk += cookie.charAt(i).charCodeAt();
                }
                // console.log('hg =', cookie, ' g_tk = ', g_tk);

                return res.render('g_tk', {g_tk: g_tk});
            }


        } catch (error) {

            return res.json({
                status: 'ok'
            });
        }

    }

    /**
     * 使用 token 的方式 进行csrf的防伪
     */
    formPage_form(req, res) {
        // pass the csrfToken to the view
        console.log('from');
        return res.render('send', {csrfToken: req.csrfToken()})
    }

    formPage_process(req, res) {
        // pass the csrfToken to the view
        try {
            // console.log('cookie = ', req.headers.cookie);
            return res.send('data is being processed');

        } catch (error) {
            return res.end('error');
        }

    }

    g_tk_have(req, res) {
        let cookie = req.cookies['hg'];
        let g_tk = "";
        for (let i = 0; i < cookie.length; i++) {
            g_tk += cookie.charAt(i).charCodeAt();
        }
        let user_g_tk = req.query['g_tk'] || "";

        // console.log("user_g_tk = ", user_g_tk, "cookie = ", cookie, ' g_tk = ', g_tk);

        if (g_tk == "" || user_g_tk != g_tk) {
            return res.json({
                msg: "error",
                status: '-200'
            });
        } else {
            return res.json({
                msg: "ok",
                status: '200'
            });
        }
    }

    ng_tk_have(req, res) {
        let cookie = req.cookies['hg'];
        let g_tk = "";
        for (let i = 0; i < cookie.length; i++) {
            g_tk += cookie.charAt(i).charCodeAt();
        }

        // console.log('g_tk = ', g_tk);

        let user_g_tk = req.body['g_tk'] || "";
        if (g_tk == "" || user_g_tk != g_tk) {
            return res.json({
                msg: "error",
                status: '-200'
            });
        } else {
            return res.json({
                msg: "ok",
                status: '200'
            });
        }
    }
}

module.exports = Csrf;