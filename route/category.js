const _ = require('lodash')
const joi = require('joi')
const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const responder = require('middleware/responder')
const categoryRepo = require('repo/category')
const validate = require('middleware/validate')

router.use(responder)

router.get('/category', auth.jwt, async function (ctx) {
  const userId = _.get(ctx, 'state.user.id')
  ctx.state.r = await categoryRepo.getUserCategories(userId)
})

router.post('/category', auth.jwt, validate('body', {
  name: joi.string().trim().min(2).required(),
}), async function (ctx) {
  const userId = _.get(ctx, 'state.user.id')
  const categoryId = _.get(await categoryRepo.create(ctx.v.body.name, userId), 'id')
  ctx.state.r = await categoryRepo.getById(categoryId) || []
})

router.get('/category/:id', auth.jwt, validate('param', {
  id: joi.number().positive().required(),
}), async function (ctx) {
  const categoryId = _.get(ctx, 'v.param.id')
  ctx.state.r = await categoryRepo.getById(categoryId)
})

router.put('/category/:id', auth.jwt, validate('param', {
  id: joi.number().positive().required(),
}), validate('body', {
  name: joi.string().trim().min(2).required(),
}), async function (ctx) {
  const categoryId = _.get(ctx, 'v.param.id')
  await categoryRepo.updateById(categoryId, _.get(ctx, 'v.body'))
  ctx.state.r = await categoryRepo.getById(categoryId)
})

router.delete('/category/:id', auth.jwt, validate('param', {
  id: joi.number().positive().required(),
}), async function (ctx) {
  const categoryId = _.get(ctx, 'v.param.id')
  await categoryRepo.deleteById(categoryId)
  ctx.state.r = {}
})

module.exports = router
