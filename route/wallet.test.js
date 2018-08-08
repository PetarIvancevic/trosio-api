const _ = require('lodash')

const konst = require('const')
const testHelper = require('test')

testHelper.api('should get all user wallets', async function (test, request) {
  const wallet01 = {
    balance: 1000,
    currency: konst.currency.kuna,
    name: 'Test wallet 01',
    paycheckAmount: 3000,
    paycheckDay: 3,
  }
  const wallet02 = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet 02',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const user01 = await testHelper.createUser({
    id: 'user01',
    email: 'user01@mail.com',
  })
  const user02 = await testHelper.createUser({
    id: 'user02',
    email: 'user02@mail.com',
  })

  await request.post('/wallet')
  .set(testHelper.auth(user01.id))
  .send(wallet01)

  await request.post('/wallet')
  .set(testHelper.auth(user01.id))
  .send(wallet02)

  await request.post('/wallet')
  .set(testHelper.auth(user02.id))
  .send(wallet01)

  const {body} = await request.get('/wallet').set(testHelper.auth(user01.id))

  test.ok(_.size(body.data) === 2, 'should have two rows')
})

testHelper.api('should get an empty array', async function (test, request) {
  const user = await testHelper.createUser()
  const {body} = await request.get('/wallet').set(testHelper.auth(user.id))

  test.ok(_.size(body.data) === 0, 'no wallets')
  test.notOk(body.error, 'no errors')
})

testHelper.api('should create new wallet', async function (test, request) {
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const user = await testHelper.createUser()

  const {body} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)

  test.same(body.data, {
    ...walletData,
    id: 1,
    userId: user.id,
  }, 'wallet created')
})

testHelper.api('should fail to create wallet because name is taken', async function (test, request) {
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const user = await testHelper.createUser()

  await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)

  const {body} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)

  test.ok(body.error === 'wallet.duplicate', 'wallet duplicate')
})

testHelper.api('should fail to create wallet because user does not exist', async function (test, request) {
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const {body} = await request.post('/wallet')
  .set(testHelper.auth('wronguser'))
  .send(walletData)

  test.ok(body.error === 'user.does_not_exist', 'user does not exist')
})

testHelper.api('should get the newly created wallet', async function (test, request) {
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const user = await testHelper.createUser()
  const {body: newWalletBody} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)

  const {body} = await request.get(`/wallet/${newWalletBody.data.id}`)
  .set(testHelper.auth(user.id))

  test.same(newWalletBody.data, body.data, 'successfully got the new wallet')
})

testHelper.api('should throw an error for getting the wallet', async function (test, request) {
  const user = await testHelper.createUser()
  const {body} = await request.get('/wallet/9999')
  .set(testHelper.auth(user.id))

  test.ok(body.error === 'wallet.not_found', 'wallet not found')
})

testHelper.api('should update the wallet data', async function (test, request) {
  const user = await testHelper.createUser()
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const updateData = {
    currency: konst.currency.euro,
    name: 'updated name',
    paycheckAmount: 1000,
    paycheckDay: 25,
  }

  const {body: newWalletBody} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)
  const {body} = await request.put(`/wallet/${newWalletBody.data.id}`)
  .set(testHelper.auth(user.id))
  .send(updateData)

  test.same(_.pick(body.data, ['currency', 'name', 'paycheckAmount', 'paycheckDay']), updateData, 'should update the data')
})

testHelper.api('should update the wallet paycheckDay to null', async function (test, request) {
  const user = await testHelper.createUser()
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }
  const updateData = {
    name: 'test wallet',
    paycheckAmount: 0,
    currency: konst.currency.kuna,
    paycheckDay: null,
  }

  const {body: newWalletBody} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)
  const {body} = await request.put(`/wallet/${newWalletBody.data.id}`)
  .set(testHelper.auth(user.id))
  .send(updateData)

  test.same(_.pick(body.data, ['currency', 'name', 'paycheckAmount', 'paycheckDay']), updateData, 'should update the data')
})

testHelper.api('should delete a wallet', async function (test, request) {
  const user = await testHelper.createUser()
  const walletData = {
    balance: 5000,
    currency: konst.currency.kuna,
    name: 'Test wallet',
    paycheckAmount: 2000,
    paycheckDay: 1,
  }

  const {body: newWalletBody} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(walletData)
  const {body} = await request.delete(`/wallet/${newWalletBody.data.id}`)
  .set(testHelper.auth(user.id))

  test.notOk(body.error, 'no errors')
})
