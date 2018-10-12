const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const cronRepo = require('repo/cron')
const responder = require('middleware/responder')

router.use(responder)

router.post('/cron/monthly-salary', auth.basic, async function (ctx) {
  ctx.state.r = await cronRepo.payday()
})

module.exports = router
