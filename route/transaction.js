const joi = require('joi')
const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const responder = require('middleware/responder')
const transactionRepo = require('repo/transaction')
const validate = require('middleware/validate')

router.use(responder)

router.get('/wallet/:walletId/transaction', auth.jwt, validate('param', {
  walletId: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await transactionRepo.getByWalletId(ctx.v.param.walletId) || []
})

router.post('/wallet/:walletId/transaction', auth.jwt, validate('param', {
  walletId: joi.number().integer().positive().required(),
}), validate('body', {
  amount: joi.number().integer().positive().required(),
  categoryId: joi.number().integer().positive().required(),
  comment: joi.string().trim().optional(),
  date: joi.string().trim().isoDate().required(),
  place: joi.string().trim().optional(),
}), async function (ctx) {
  const {id} = await transactionRepo.create({
    ...ctx.v.body,
    walletId: ctx.v.param.walletId,
  })
  ctx.state.r = await transactionRepo.getById(id)
})

router.get('/wallet/:walletId/transaction/:transactionId', auth.jwt, validate('param', {
  transactionId: joi.number().integer().positive().required(),
  walletId: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await transactionRepo.getById(ctx.v.param.transactionId)
})

router.put('/wallet/:walletId/transaction/:transactionId', auth.jwt, validate('param', {
  transactionId: joi.number().integer().positive().required(),
  walletId: joi.number().integer().positive().required(),
}), validate('body', {
  amount: joi.number().integer().positive().required(),
  categoryId: joi.number().integer().positive().required(),
  comment: joi.string().trim().allow(null).required(),
  date: joi.string().trim().isoDate().required(),
  place: joi.string().trim().required(),
}), async function (ctx) {
  await transactionRepo.updateById(ctx.v.param.transactionId, ctx.v.body)
  ctx.state.r = await transactionRepo.getById(ctx.v.param.transactionId)
})

router.delete('/wallet/:walletId/transaction/:transactionId', auth.jwt, validate('param', {
  transactionId: joi.number().integer().positive().required(),
  walletId: joi.number().integer().positive().required(),
}), async function (ctx) {
  await transactionRepo.removeById(ctx.v.param.transactionId)
  ctx.state.r = {}
})

module.exports = router