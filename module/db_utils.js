module.exports = DbUtils;

var Promise = require('promise');
var DB = require('./db.js');

/*
 业务向进一步db封装
 */
function DbUtils() {
    this.db = null;
}

DbUtils.prototype.init = function(cfg) {
    var self = this;
    this.db = new DB(cfg);
    var promise = new Promise(function(resolve, reject) {
        try {
            self.db.init();
        } catch (e) {
            reject(e);
            return false;
        }
        resolve(self);
    });

    return promise;
};

DbUtils.prototype.getDbInstance = function() {
    return this.db.getInstance();
};

DbUtils.prototype.run = function(sql) {
    return this.db.query(sql);
};

DbUtils.prototype.transaction = function(sql) {
    var self = this;
    return self.db.beginTransaction().then(function(instance) {
        if (sql) {
            return self.transactionQuery(instance, sql);
        } else {
            return instance;
        }
    });
};

DbUtils.prototype.transactionQuery = function(instance, sql) {
    return this.db.transactionQuery(instance, sql);
};

DbUtils.prototype.commit = function(instance) {
    var self = this;
    return self.db.commit(instance).then(function(instance) {
        return instance;
    }, function(err) {
        return Promise.reject(err);
    });
};

DbUtils.prototype.rollback = function(instance) {
    var self = this;
    return self.db.rollback(instance);
};