var startWorker = require('./worker.js');
//process.env.NODE_ENV = 'local';
console.log('process.env.NODE_ENV = ', process.env.NODE_ENV);


if (process.env.NODE_ENV == 'local') { //taf环境默认会开启多进程，这里保证本地和taf环境一致
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    // if (cluster.isMaster) {
        // Fork workers.
        // for (var i = 0; i < numCPUs; i++) {
        //     cluster.fork();
        // }
        //
        // cluster.on('exit', function(worker, code, signal) {
        //     console.error('worker ' + worker.process.pid + ' died');
        // });
    // } else {
        startWorker();
    // }
} else {
    startWorker();
}
