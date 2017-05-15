module.exports = Router;
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

function Router() {

}

Router.init = function(app, cfg) {
    Router.registerDynamicPage(app, cfg);
};

// 注册动态路由
Router.registerDynamicPage = function(app, cfg) {
    var config = cfg;

    for (var i in config) {
        if (i == 'csrf-form') { // 注册 csrf 的表单
            for (var k in config['csrf-form']) {
                try {
                    app.use(k, csrfProtection, config['csrf-form'][k]);
                } catch (e) {
                    console.error("register dynamic page error, key = " + k + ", value = " + config['csrf-form'][k] + ", e = " + e.message);
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