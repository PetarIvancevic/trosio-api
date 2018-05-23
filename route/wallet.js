const _ = require('lodash')
const joi = require('joi')
const router = new (require('koa-router'))()

const responder = require('middleware/responder')
const walletRepo = require('repo/wallet')
const validate = require('middleware/validate')
const konst = require('const')

router.use(responder)

router.get('/wallet', async function (ctx) {
  ctx.state.r = await walletRepo.get()
})

router.get('/wallet/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await walletRepo.getById(ctx.v.param.id)
})

router.get('/wallet/user/:userId', validate('param', {
  userId: joi.string().required(),
}), async function (ctx) {
  ctx.state.r = await walletRepo.getByUserId(ctx.v.param.userId)
})

router.post('/wallet', validate('body', {
  amount: joi.number().integer().positive().required(),
  currency: joi.any().valid(_.values(konst.currency)).required(),
  paycheckDay: joi.number().integer().positive().min(1).max(30).required(),
  userId: joi.string().required(),
}), async function (ctx) {
  const {id} = await walletRepo.create(ctx.v.body)
  ctx.state.r = await walletRepo.getById(id)
})

router.put('/wallet/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), validate('body', {
  amount: joi.number().integer().positive().required(),
  currency: joi.any().valid(_.values(konst.currency)).required(),
  paycheckDay: joi.number().integer().positive().min(1).max(30).required(),
}), async function (ctx) {
  await walletRepo.updateById(ctx.v.param.id, ctx.v.body)
  ctx.state.r = await walletRepo.getById(ctx.v.param.id)
})

router.delete('/wallet/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await walletRepo.removeById(ctx.v.param.id)
})

module.exports = router
