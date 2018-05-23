const _ = require('lodash')
const joi = require('joi')
const router = new (require('koa-router'))()

const responder = require('middleware/responder')
const expenseRepo = require('repo/expense')
const validate = require('middleware/validate')
const konst = require('const')

router.use(responder)

router.get('/expense', async function (ctx) {
  ctx.state.r = await expenseRepo.get()
})

router.get('/expense/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await expenseRepo.getById(ctx.v.param.id)
})

router.get('/expense/wallet/:walletId', validate('param', {
  walletId: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await expenseRepo.getByWalletId(ctx.v.param.walletId)
})

router.post('/expense', validate('body', {
  amount: joi.number().integer().positive().required(),
  category: joi.any().valid(_.values(konst.category)).required(),
  date: joi.date().required(),
  place: joi.string().trim().max(60).required(),
  walletId: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = await expenseRepo.create(ctx.v.body)
  ctx.state.r = await expenseRepo.getById(id)
})

router.put('/expense/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), validate('body', {
  amount: joi.number().integer().positive().required(),
  category: joi.any().valid(_.values(konst.category)).required(),
  date: joi.date().required(),
  place: joi.string().trim().max(60).required(),
}), async function (ctx) {
  ctx.state.r = await expenseRepo.updateById(ctx.v.param.id, ctx.v.body)
})

router.delete('/expense/:id', validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await expenseRepo.removeById(ctx.v.param.id)
})

module.exports = router
