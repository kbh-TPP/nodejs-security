module.exports = DB;
/*
 db封装，多个db操作就是多个实例
 */
var Mysql = require('mysql');
var Promise = require('promise');
var log = require('./log.js').Log;

function DB(options) {
    this.options = options;
    this.instance = null;
}

DB.prototype.init = function() {
    this.instance = Mysql.createPool(this.options);
    this.registerlistener();
    return this.instance;
};

DB.prototype.getInstance = function() {
    return this.instance;
};

DB.prototype.query = function(sql) {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
        self.instance.query(sql, function(err, rst) {
            console.log('sql = ', sql);
            console.log('rst = ', rst);
            if (err) {
                reject(err);
            } else {
                resolve(rst);
            }
        });
    });
    return promise;
};

DB.prototype.beginTransaction = function() {
    var instance = Mysql.createConnection(this.options);
    var promise = new Promise(function(resolve, reject) {
        instance.beginTransaction(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(instance);
            }
        });
    });

    return promise;
};

DB.prototype.commit = function(instance) {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
        instance.commit(function(err) {
            if (err) {
                reject(err);
                self.rollback(instance);
            } else {
                resolve(instance);
                instance.end();
            }
        });
    });

    return promise;
};

DB.prototype.rollback = function(instance) {
    var promise = new Promise(function(resolve, reject) {
        instance.rollback(function(err) {
            if (err) {
                reject(err);
                instance.end();
            } else {
                resolve(instance);
                instance.end();
            }
        });
    });

    return promise;
};

DB.prototype.transactionQuery = function(instance, sql) {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
        instance.query(sql, function(err, rst) {
            console.log('sql = ', sql);
            console.log('rst = ', rst);
            if (err) {
                self.rollback(instance);
                reject(err);
            } else {
                resolve({
                    instance: instance,
                    rst: rst
                });
            }
        });
    });
    return promise;
};

DB.prototype.saveBigFile = function(path, name, callback) {

};

DB.prototype.saveBigData = function(buffer, name, callback) {

};

DB.prototype.getBigFile = function(name, callback) {

};

DB.prototype.removeBigFile = function(name, callback) {

};

DB.prototype.registerlistener = function() {
    var self = this;
    /*
     this.instance.on('connection', function(connection) {

     });
     */
    this.instance.on('enqueue', function() {
        log.warn('Waiting for available connection slot');
    });
    this.instance.on('error', function(err) {
        log.error('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            this.init(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
};