'use strict';
/**
 * SQL 注入
 *  测试用例
 */
module.exports = dbUser;
const mysql = require("mysql");
const querystring = require('querystring');
const express = require('express');


let router = express.Router();
let sql = require('./../module/userSqlMap.js');

// 向前台返回JSON方法的简单封装
function jsonWrite(res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
}

// // DB 的操作类
// function dbUser() {};



// // 公用方法
// dbUser.add = function() {

// };



/**
 * 功能：sql使用占位符防注入
 */
function dbUser(db) {
    return router.get('/', function(req, res) {
        /**
         * 示例：
         * urlObj = {
         *     protocol: null,
         *     ...
         *     query: 'flag=1'
         * }
         */
        let urlObj = url.parse(req.url);
        let query = urlObj.query;
        /**
         * 示例：
         * queryObj = {
         *     flag: '1'
         * }
         */
        let queryObj = querystring.parse(query);
        let flag = queryObj.flag;
        if (_.isEmpty(flag)) {
            res.json('flag不能为空');
            return;
        }

        switch (flag) {
            case 'add':
                let name = queryObj.name;
                let age = queryObj.age;

                if (_.isEmpty(name)) {
                    res.json('name不能为空');
                    return;
                }
                if (_.isEmpty(age)) {
                    res.json('age不能为空');
                    return;
                }
                db.getConnection(function(err, connection) {
                    // 建立连接，向表中插入值
                    // 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
                    connection.query(sql.insert, [name, age], function(err, result) {
                        console.log(err);
                        if (result) {
                            result = {
                                code: 200,
                                msg: "增加成功"
                            };
                        }
                        // 以json形式，把操作结果返回给前台页面
                        jsonWrite(res, result);
                        // 释放连接
                        connection.release();
                    });
                });
                break;
            case 'query':
                // var id = parseInt(mysql.escape(req.query.id));
                let id = req.query.id;
                console.log('id', id, sql.queryById);

                db.getConnection(function(err, connection) {
                    connection.query(sql.queryById, [id], function(err, result) {
                        jsonWrite(res, result);
                        connection.release();
                    });
                });
                break;
        }
    });
}

module.exports = dbUser;