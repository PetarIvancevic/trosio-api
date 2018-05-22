const joi = require('joi')
const router = new (require('koa-router'))()

const responder = require('middleware/responder')
const userRepo = require('repo/user')
const validate = require('middleware/validate')

router.use(responder)

router.get('/user', async function (ctx) {
  ctx.state.r = await userRepo.get()
})

router.get('/user/:id', validate('param', {
  id: joi.string().required(),
}), async function (ctx) {
  ctx.state.r = await userRepo.getById(ctx.v.param.id)
})

router.post('/user', validate('body', {
  email: joi.string().email().required(),
  id: joi.string().required(),
  name: joi.string().trim().min(4).max(200).required(),
}), async function (ctx) {
  await userRepo.create(ctx.v.body)
  ctx.state.r = await userRepo.getById(ctx.v.body.id)
})

router.put('/user/:id', validate('param', {
  id: joi.string().required(),
}), validate('body', {
  email: joi.string().email().required(),
  name: joi.string().trim().min(4).max(200).required(),
}), async function (ctx) {
  ctx.state.r = await userRepo.updateById(ctx.v.param.id, ctx.v.body)
})

router.delete('/user/:id', validate('param', {
  id: joi.string().required(),
}), async function (ctx) {
  ctx.state.r = await userRepo.removeById(ctx.v.param.id)
})

module.exports = router
