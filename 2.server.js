const Koa = require('koa');
const app = new Koa()

// app.use(function(ctx, next) {
//   ctx.a = 1
//   next()
// })

// app.use(function(ctx, next) {
//   console.log(ctx.a)
//   next()
// })

// app.use(function(ctx, next) {
//   console.log(ctx.a)
//   next()
// })
const sleep = function(){
  return new Promise((resolve,reject)=>{
      setTimeout(() => {
          resolve();
          console.log('sleep');
      }, 1000);
  })
}
// 如果加了await next()  上一个人会等待下一个人的执行完毕
// 没有加await 第二个人中有异步逻辑 （不用等待第二个人的异步逻辑）
app.use(async function(ctx, next) { // 专门处理 /getUser
  ctx.body = '1' 
  console.log(1)
  // 开始执行~~~~
  next(); // ctx.body = '3'
  // await next();
  ctx.body = '2'
  console.log(2)
  // 结束执行~~~~
})
// 1 3  2  sleep  5 6 4
app.use(async function(ctx, next) { // 专门处理 /getUser
  ctx.body = '3'
  console.log(3)
  await sleep();
  next();
   ctx.body = '4'
   console.log(4)
})
app.use(async function(ctx, next) { // 专门处理 /getUser
  ctx.body = '5'
  ctx.body = '6'
  console.log(5,6)
})
app.listen(3000)

// 1 3 2 sleep 5 6 4
// 因为第一个没有await next，不等下面的异步方法，直接返回了ctx.body = '2'
// 如果加上了await next() 那就会等下面的异步方法，再返回
// 所以为了保证顺序不出错，必须在next前面加上await