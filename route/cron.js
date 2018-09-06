const router = new (require('koa-router'))()
const joi = require('joi')

const auth = require('middleware/auth')
const cronRepo = require('repo/cron')
const responder = require('middleware/responder')
const validate = require('middleware/validate')

router.use(responder)

router.post('/cron/monthly-salary', validate('query', {
  token: joi.string().trim().required(),
}), async function (ctx) {
  ctx.state.r = await cronRepo.payday()
})

module.exports = router
