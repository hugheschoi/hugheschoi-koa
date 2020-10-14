const Koa = require('./koa')
const fs = require('fs')
const path = require('path')

const app = new Koa()
// 实例上比较核心的有三个 listen,use,on('error')
// use 注册函数
// ctx 上下文 这里对原生的req和res进行了封装 封装出了一个新的对象 request,response
app.use(function(ctx) {
  console.log(ctx.req.url);
  console.log(ctx.request.req.url); //原生的req对象
  console.log(ctx.request.path); // 自己封装的
  console.log(ctx.path); // 自己封装的
  // body 可以返回流
  // ctx.set('Content-Type','text/html'); // 设置响应头，不设置的话，因为是文件会默认下载
  // ctx.body = fs.createReadStream(path.resolve(__dirname, 'a.html'))
  ctx.body = { a: '11' }
  ctx.body = { a: '12' }
  // console.log(ctx.response.body)
  // ctx.body = 'world'; // body并不是res.end方法 ,如果多次就会用最后的返回到页面上
})

app.listen(3000, () => {
  console.log('ok')
})
