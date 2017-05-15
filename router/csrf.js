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

CSRF.formPage_form = function(req, res) {

    // pass the csrfToken to the view 
    console.log('from');
    res.render('send', { csrfToken: req.csrfToken() })

}

CSRF.formPage_process = function(req, res) {

    // pass the csrfToken to the view
    console.log('process');
    res.send('data is being processed');
}