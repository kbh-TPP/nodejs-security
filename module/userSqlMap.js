/**
 * 使用占位符的形式进行 sql 语句的使用，
 * 并且防止了SQL 注入的方式
 */

var user = {
    insert: 'INSERT INTO users (id, name, age) VALUES(0, ?, ?)',
    update: 'update users set name = ?, age = ? where id = ?',
    delete: 'delete from users where id = ?',
    queryById: 'select * from users where id = ?',
    queryAll: 'select * from users'
};

module.exports = user;