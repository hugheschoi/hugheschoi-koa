const http = require('http')
const request = require('./request')
const response = require('./response')
const context = require('./context');
const Stream = require('stream')

class Application {
  constructor() {
    // 不能直接把request直接赋值给context（引用类型） 如果其中一个应用改变了request，会影响别的
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }
  use (fn) {
    this.fn = fn
  }

  createContext(req, res) {
    // 每次都创建一个全新的上下文 保证每次请求之间不干扰
    let ctx = Object.create(this.context);
    let request = Object.create(this.request);
    let response = Object.create(this.response);
    // request和response就是我们koa自己的对象
    // req，res就是原生的对象
    ctx.request = request;
    ctx.response = response;
    ctx.request.req = ctx.req = req
    ctx.response.res = ctx.res = res
    return ctx
  }

  handleRequest (req, res) {
    let ctx = this.createContext(req, res)
    res.statusCode = 404
    this.fn(ctx)
    let body = ctx.body
    if (typeof body == 'string' || Buffer.isBuffer(body)) {
      res.end(ctx.body)
    } else if (body instanceof Stream) {
      // 设置请求头可以下载，但在这里使用不合理
      // res.setHeader(`Content-Disposition`,`attachement;filename=${encodeURIComponent('下载')}`);
      body.pipe(res)
    } else if (typeof body === 'object') {
      res.end(JSON.stringify(body))
    } else {
      res.end('not found')
    }

    // res.end(ctx.body) // 用户多次设置采用最后一次，没有写要写not found 默认应该是写没找到
  }
  listen (...args) {
    let server = http.createServer(this.handleRequest.bind(this))
    server.listen(...args)
  }
}
module.exports = Application


// const a = {
//   name: 'a'
// }
// const c = Object.create(a)
// console.log(c)
