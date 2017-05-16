'use strict';

module.exports = Router;
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

function Router() {

}

Router.init = function(app, cfg) {
    Router.registerDynamicPage(app, cfg);
};

// 注册动态路由
Router.registerDynamicPage = function(app, cfg) {
    let config = cfg;

    for (let i in config) {
        if (i === 'csrf-form') { // 注册 csrf 的表单
            for (let k in config['csrf-form']) {
                try {
                    app.use(k, csrfProtection, config['csrf-form'][k]);
                } catch (e) {
                    console.error("register dynamic page error, key = " + k + ", value = " + config['csrf-form'][k] + ", e = " + e.message);
                }
            }
        } else if (i === "g-tk") {
            try {
                for (let k in config['g-tk']) {
                    try {
                        app.use(k, config["g-tk"][k]);
                    } catch (e) {
                        console.error("register dynamic page error, key = " + k + ", value = " + config['csrf-form'][k] + ", e = " + e.message);
                    }
                }
            } catch (e) {
                console.error("register dynamic page error, key = " + k + ", value = " + config['csrf-form'][k] + ", e = " + e.message);
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