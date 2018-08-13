require('env')

const app = new (require('koa'))()
const mount = require('koa-mount')

app.silent = process.env.LOG_LEVEL < 3

app.use(require('koa-response-time')())
app.use(require('koa-helmet')())
app.use(require('kcors')())
app.use(require('koa-bodyparser')())
app.use(require('middleware/error'))

app.use(mount('/', require('route/category').routes()))
app.use(mount('/', require('route/transaction').routes()))
app.use(mount('/', require('route/user').routes()))
app.use(mount('/', require('route/wallet').routes()))

app.use(async function (ctx, next) {
  ctx.throw(404)
  await next()
})

app.listen(process.env.PORT, function () {
  console.log(`STARTED ENV=${process.env.NODE_ENV} PORT=${process.env.PORT}`)
})

module.exports = app
