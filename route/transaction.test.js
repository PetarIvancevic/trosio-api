const _ = require('lodash')

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

  return {
    user,
    category,
    wallet,
  }
}

testHelper.api('should create a transaction', async function (test, request) {
  const {user, category, wallet} = await createPrerequisites(request)

  const transactionData = {
    amount: 2000,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  test.same(_.omit(body.data, 'date'), {
    ..._.omit(transactionData, 'date'),
    id: 1,
    walletId: wallet.id,
  })
})

testHelper.api('should throw an error for transaction creation, because category does not exist', async function (test, request) {
  const {user, wallet} = await createPrerequisites(request)

  const transactionData = {
    amount: 2000,
    categoryId: 9999,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  test.ok(body.error === 'category.does_not_exist', 'category does not exist')
})

testHelper.api('should throw an error for transaction creation, because category does not exist', async function (test, request) {
  const {user, category} = await createPrerequisites(request)

  const transactionData = {
    amount: 2000,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body} = await request.post('/wallet/9999/transaction')
  .set(testHelper.auth(user.id))
  .send(transactionData)

  test.ok(body.error === 'wallet.does_not_exist', 'wallet does not exist')
})

testHelper.api('should get wallet transactions', async function (test, request) {
  const {user, category, wallet} = await createPrerequisites(request)

  const transaction01Data = {
    amount: 10,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const transaction02Data = {
    amount: 13,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-13T22:00:00.000Z',
    place: 'Kaufland',
  }

  await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transaction01Data)

  await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transaction02Data)

  const {body} = await request.get(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))

  test.ok(_.size(body.data) === 2, 'there should be two transactions')
  test.ok(_(body.data).filter(function (transaction) {
    return transaction.walletId === wallet.id
  }).size() === 2, 'all transactions belong to wallet')
})

testHelper.api('should get the transaction', async function (test, request) {
  const {category, user, wallet} = await createPrerequisites(request)
  const transactionData = {
    amount: 10,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body: {data: transaction}} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  const {body} = await request.get(`/wallet/${wallet.id}/transaction/${transaction.id}`)
  .set(testHelper.auth(user.id))

  test.same(
    _.omit(body.data, ['date', 'id']),
    _.omit({
      ...transactionData,
      walletId: wallet.id,
    }, 'date'),
    'got the transaction')
})

testHelper.api('should throw an error because transaction does not exist', async function (test, request) {
  const {user, wallet} = await createPrerequisites(request)
  const {body} = await request.get(`/wallet/${wallet.id}/transaction/9999`)
  .set(testHelper.auth(user.id))

  test.ok(body.error === 'transaction.not_found', 'transaction not found')
})

testHelper.api('should update the transaction', async function (test, request) {
  const {category, user, wallet} = await createPrerequisites(request)
  const transactionData = {
    amount: 10,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body: {data: transaction}} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  const updateTransactionData = {
    amount: 12,
    categoryId: category.id,
    comment: 'some comment 123',
    date: '2017-12-10T22:00:00.000Z',
    place: 'koko',
  }
  const {body} = await request.put(`/wallet/${wallet.id}/transaction/${transaction.id}`)
  .set(testHelper.auth(user.id))
  .send(updateTransactionData)

  test.same(_.omit(body.data, 'date'), {
    ..._.omit(updateTransactionData, 'date'),
    id: transaction.id,
    walletId: wallet.id,
  })
})

testHelper.api('should update the transaction comment to null', async function (test, request) {
  const {category, user, wallet} = await createPrerequisites(request)
  const transactionData = {
    amount: 10,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body: {data: transaction}} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  const updateTransactionData = {
    amount: 12,
    categoryId: category.id,
    comment: null,
    date: '2017-12-10T22:00:00.000Z',
    place: 'koko',
  }
  const {body} = await request.put(`/wallet/${wallet.id}/transaction/${transaction.id}`)
  .set(testHelper.auth(user.id))
  .send(updateTransactionData)

  test.same(_.omit(body.data, 'date'), {
    ..._.omit(updateTransactionData, 'date'),
    id: transaction.id,
    walletId: wallet.id,
  })
})

testHelper.api('should delete the transaction', async function (test, request) {
  const {category, user, wallet} = await createPrerequisites(request)
  const transactionData = {
    amount: 10,
    categoryId: category.id,
    comment: 'some comment',
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
  }
  const {body: {data: transaction}} = await request.post(`/wallet/${wallet.id}/transaction`)
  .set(testHelper.auth(user.id))
  .send(transactionData)

  const {body} = await request.delete(`/wallet/${wallet.id}/transaction/${transaction.id}`)
  .set(testHelper.auth(user.id))

  test.notOk(body.error, 'there should be no errors')
})