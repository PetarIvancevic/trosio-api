const _ = require('lodash')
const sinon = require('sinon')

const error = require('error')
const googleService = require('services/google')
const konst = require('const')
const testHelper = require('test')

async function createPrerequisites (request) {
  const categoryData = {name: 'test category'}
  const walletData = {
    balance: 1000,
    currency: konst.currency.kuna,
    name: 'test wallet',
    paycheckAmount: 3000,
    paycheckDay: 3,
  }

  const user = await testHelper.createUser()
  const {body: {data: category}} = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send(categoryData)

  const {body: {data: wallet}} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)

  const transactionData = {
    amount: 2000,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  return user
}

testHelper.api('should create a new user', async function (test, request) {
  const userData = {
    email: 'test@mail.com',
    sub: 'testuserid',
    name: 'test test',
  }
  const stub = sinon.stub(googleService, 'verify').returns(userData)
  const {body} = await request.post('/user').send({idToken: 'thisistheidtoken'})

  test.same({
    ...body.data,
    token: !!body.data.token,
  }, {
    email: userData.email,
    id: userData.sub,
    name: userData.name,
    token: true,
  }, 'a new user should be created')
  stub.restore()
})

testHelper.api('should throw and error when creating a new user', async function (test, request) {
  const stub = sinon.stub(googleService, 'verify').throws(error('google.invalid_token'))
  const {body} = await request.post('/user').send({idToken: 'thisistheidtoken'})

  test.ok(body.error === 'google.invalid_token', 'invalid token error has been thrown')
  stub.restore()
})

testHelper.api('should delete the user', async function (test, request) {
  const user = await createPrerequisites(request)
  const {body} = await request.delete(`/user/${user.id}`).set(testHelper.auth(user.id))

  test.ok(_.isEmpty(body.data), 'user deleted')
})
