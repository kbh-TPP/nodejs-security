## 感谢 brain
## 感谢 youkun

### 本文通过阅读 Node.js安全清单 ，进行的nodejs 安全处理，
### 目前存在的问题，csrf需要构建redis 服务，进行多进程，多服务的cookie，以及token的管理。
### 使用g_tk的方式，进行csrf的防御。cookie 进行 token 的转换，每次请求，都发送g_tk。


### 20170517  白天加一层db的初始化，把初始化和路由完成。 
#### 目前有个问题，需要解决日子的问题，如何进行日志初始化，在什么时机。是个问题。


### test url
```js

    http://127.0.0.1:8888/g_tk_demo
    http://127.0.0.1:8888/xss-1/reflected/wrong
    http://127.0.0.1:8888/xss-1/reflected/right

``` 