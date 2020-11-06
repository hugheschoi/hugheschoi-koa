const querystring = require('querystring');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path')
module.exports = function bodyParser(uploadDir) {
    return async (ctx, next) => {
        ctx.request.body = await body(ctx, uploadDir);
        return next()
    }
}
async function body(ctx, uploadDir) {
    return new Promise((resolve, reject) => {
        let arr = []
        ctx.req.on('data', function(chunk) {
            arr.push(chunk);
        });
        ctx.req.on('end', function() {
            // username=1234234535&password=32124353
            // 请求体
            // 1.表单格式 a=1&b=2
            // 2.json格式 {a:1,b:2}
            // 3.文件格式

            // Content-Type: application/x-www-form-urlencoded

            let type = ctx.get('content-type'); // req.headers
            let data = Buffer.concat(arr); // 用户传递的数据 
            if (type == 'application/x-www-form-urlencoded') { // a=1&b=2;
                resolve(querystring.parse(data.toString())); // 将字符串格式转换成对象
            } else if (type == 'application/json') {
                resolve(JSON.parse(data.toString()));
            } else if (type === 'text/plain') {
                resolve(data.toString())
            } else if (type.startsWith('multipart/form-data')) { // 二进制类型
                // 给我当前客户端提交的数据 和 一个分隔符multipart/form-data 后面会给个bondary
                let bondary = '--' + type.split('=')[1]
                let lines = data.split(bondary);
                lines = lines.slice(1, -1); // 需要的三行数据
                console.log(lines)
                // 二进制数据 分割成 多个行
                let resultObj = {};
                lines.forEach(line => {
                    let [head, body] = line.split('\r\n\r\n');
                    if (head) {
                        let key = head.toString().match(/name="(.+?)"/)[1];
                        if (!head.includes('filename')) {
                            // 如果没有filename
                            resultObj[key] = body.slice(0, -2).toString();
                        } else {
                            let originalName = head.toString().match(/filename="(.+?)"/)[1]
                            // 是文件 文件上传 
                            let filename = uuid.v4(); // 产生一个唯一的文件名
                            // 获取文件内容
                            let content = line.slice(head.length + 4, -2); // 获取中间的内容部分
                            fs.writeFileSync(path.join(uploadDir, filename), content);
                            resultObj[key] = (resultObj[key] || [])
                            resultObj[key].push({
                                size: content.length,
                                name: originalName,
                                filename
                            })

                            // 都可以体现出来
                        }
                    }
                })
                resolve(resultObj);
            } else {
                resolve();
            }
        })
    })
}
// 111111&11111&111&111   buffer.indexOf('字符串')
Buffer.prototype.split = function(bondary) { // 分割二进制
    let arr = [];
    let offset = 0;
    let currentPosition = 0;
    // 找到当前分隔符的位置 只要能找到就一直查找
    while (-1 != (currentPosition = this.indexOf(bondary, offset))) {
        arr.push(this.slice(offset, currentPosition));
        offset = currentPosition + bondary.length
    }
    arr.push(this.slice(offset));
    return arr;
}