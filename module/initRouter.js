/**
 * 服务配置信息，
 *      包含数据库，缓存，接口等。
 */

module.exports = Config;

// 路由类
function Router() {}


// 初始化
Router.init = function(app, dbObj) {
    Router.registerCommonFuncs(app, dbObj);
    Router.initMiddleware(app);
    Router.registerLogFuncs(app); // 先后顺序不同，打印日志条数也会不同
    Router.mountStaticRes(app); // 服务端，不需要静态资源
    Router.registerDynamicPage(app);
};

/**
 * 注册 初始化 函数，比如header，access-control
 */
Router.registerCommonFuncs = function(app, dbObj) {
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

Router.initMiddleware = function(app) {
    var config = Config.getMiddlewareList();
    for (var i in config) {
        //console.info("initMiddleware key = " + i + ", value = " + config[i]);
        try {
            app.use(config[i]);
        } catch (e) {
            log.error("initMiddleware error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};

/**
 * 全局日志打印
 * @param app
 * @param cfg
 */
Router.registerLogFuncs = function(app) {
    var config = Config.getLogFuncs();
    for (var i in config) {
        //console.info("registerLogFuncs key = " + i + ", value = " + config[i]);
        try {
            app.use(i, config[i]);
        } catch (e) {
            log.error("registerLogFuncs error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};

/**
 * 注册静态资源文件 static
 */
Router.mountStaticRes = function(app, cfg) {
    var config = Config.getMountConfig(cfg);
    for (var i in config) {
        //console.info("mountStaticRes key = " + i + ", value = " + config[i]);
        try {
            app.use(i, express.static(config[i]));
        } catch (e) {
            log.error("mount static resouce error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};



/**
 * 注册动态请求的路由
 */
Router.registerDynamicPage = function(app) {
    var config = Config.getDynamicConfig();
    for (var i in config) {
        //console.info("registerDynamicPage key = " + i + ", value = " + config[i]);
        try {
            app.use(i, config[i]);
        } catch (e) {
            log.error("register dynamic page error, key = " + i + ", value = " + config[i] + ", e = " + e.message);
        }
    }
};