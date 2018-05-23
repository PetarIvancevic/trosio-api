const _ = require('lodash')

const test = require('test')

test.api('expense post', async function (t, request, store) {
  const expense = {
    amount: 2000,
    category: 10,
    date: '2017-12-12T22:00:00.000Z',
    place: 'Kaufland',
    walletId: 1,
  }
  const r = await request.post('/expense').send(expense)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(r.body.data, 'expense posted')
  store.set('expense', {
    ...r.body.data,
    ...expense,
  })
})

test.api('expense put by id', async function (t, request, store) {
  const id = store.get('expense').id
  const walletId = store.get('expense').walletId
  const data = {
    amount: 1000,
    category: 20,
    date: '2018-04-21T22:00:00.000Z',
    place: 'Tommy',
  }
  const r = await request.put(`/expense/${id}`).send(data)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id'), 'expense edited by id')
  store.set('expense', {
    id,
    walletId,
    ...data,
  })
})

test.api('get expense list', async function (t, request, store) {
  const r = await request.get('/expense')
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, store.get('expense')), 'expense')
})

test.api('get expense by id', async function (t, request, store) {
  const r = await request.get(`/expense/${store.get('expense').id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.isEqual(r.body.data, store.get('expense')), 'expense')
})

test.api('get expense by walletId', async function (t, request, store) {
  const r = await request.get(`/expense/wallet/${store.get('expense').walletId}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, store.get('expense')), 'expense')
})

test.api('delete expense by id', async function (t, request, store) {
  const id = store.get('expense').id
  const r = await request.delete(`/expense/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id') === id, 'expense deleted')
})
