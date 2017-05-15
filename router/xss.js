/*
	XSS test 文件
*/


module.exports = XSS;
var xssFilters = require('xss-filters');


function XSS() {}



// 1 —— 反射 错误 实例
XSS.Reflected_wrong = function(req, res, next) {

	console.log("Reflected_wrong");	
 	res.send('<h1> Hello, ' + req.query.xss1 + '!</h1>');
}

// 1 —— 反射 正确 实例
XSS.Reflected_right = function(req, res, next) {

	console.log("Reflected_right");


	var xss1 = req.query.xss1; //an untrusted input collected from user
 	res.send('<h1> Hello, ' + xssFilters.inHTMLData(xss1) + '!</h1>');

}