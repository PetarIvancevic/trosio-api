const _ = require('lodash')
const joi = require('joi')
const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const responder = require('middleware/responder')
const walletRepo = require('repo/wallet')
const validate = require('middleware/validate')
const konst = require('const')

router.use(responder)

router.get('/wallet', auth.jwt, async function (ctx) {
  ctx.state.r = await walletRepo.getByUserId(_.get(ctx, 'state.user.id')) || []
})

router.post('/wallet', auth.jwt, validate('body', {
  balance: joi.number().integer().positive().allow(0).optional(),
  currency: joi.any().valid(_.values(konst.currency)).required(),
  name: joi.string().trim().required(),
  paycheckAmount: joi.number().integer().positive().allow(0)
  .when('paycheckDay', {
    is: joi.exist(),
    then: joi.required(),
    otherwise: joi.optional(),
  }),
  paycheckDay: joi.number().integer().positive().min(1).max(31).optional(),
}), async function (ctx) {
  const {id} = await walletRepo.create({
    userId: _.get(ctx, 'state.user.id'),
    ...ctx.v.body,
  })
  ctx.state.r = await walletRepo.getById(id)
})

router.get('/wallet/:id', auth.jwt, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  ctx.state.r = await walletRepo.getById(ctx.v.param.id)
})

router.put('/wallet/:id', auth.jwt, validate('param', {
  id: joi.number().integer().positive().required(),
}), validate('body', {
  currency: joi.any().valid(_.values(konst.currency)).required(),
  name: joi.string().trim().required(),
  paycheckAmount: joi.number().integer().positive().allow(0).required(),
  paycheckDay: joi.number().integer().positive().min(1).max(31).allow(null).required(),
}), async function (ctx) {
  await walletRepo.updateById(ctx.v.param.id, ctx.v.body)
  ctx.state.r = await walletRepo.getById(ctx.v.param.id)
})

router.delete('/wallet/:id', auth.jwt, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  await walletRepo.removeById(ctx.v.param.id)
  ctx.state.r = {}
})

module.exports = router
