const joi = require('joi')
const router = new (require('koa-router'))()
const jwt = require('jsonwebtoken')

const auth = require('middleware/auth')
const googleService = require('services/google')
const responder = require('middleware/responder')
const userRepo = require('repo/user')
const validate = require('middleware/validate')

router.use(responder)

router.post('/user', validate('body', {
  idToken: joi.string().trim().required(),
}), async function (ctx) {
  const userGoogleData = await googleService.verify(ctx.v.body.idToken)
  await userRepo.create({
    email: userGoogleData.email,
    id: userGoogleData.sub,
    name: userGoogleData.name,
  })
  ctx.state.r = {
    token: jwt.sign({id: userGoogleData.sub}, process.env.JWT_SECRET),
    ...(await userRepo.getById(userGoogleData.sub)),
  }
})

router.delete('/user/:id', auth.jwt, validate('param', {
  id: joi.string().required(),
}), async function (ctx) {
  await userRepo.removeById(ctx.v.param.id)
  ctx.state.r = {}
})

module.exports = router
