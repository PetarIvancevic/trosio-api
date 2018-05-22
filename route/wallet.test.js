const _ = require('lodash')

const test = require('test')

test.api('wallet post', async function (t, request, store) {
  const wallet = {
    amount: 2000,
    currency: 10,
    paycheckDay: 2,
    userId: store.get('user').id,
  }
  const r = await request.post('/wallet').send(wallet)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(r.body.data, 'wallet posted')
  store.set('wallet', {
    ...r.body.data,
    ...wallet,
  })
})

test.api('wallet put by id', async function (t, request, store) {
  const id = store.get('wallet').id
  const userId = store.get('wallet').userId
  const data = {
    amount: 1000,
    currency: 20,
    paycheckDay: 15,
  }
  const r = await request.put(`/wallet/${id}`).send(data)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id'), 'wallet edited by id')
  store.set('wallet', {
    id,
    userId,
    ...data,
  })
})

test.api('get wallet list', async function (t, request, store) {
  const r = await request.get('/wallet')
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, store.get('wallet')), 'wallet')
})

test.api('get wallet by id', async function (t, request, store) {
  const r = await request.get(`/wallet/${store.get('wallet').id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.isEqual(r.body.data, store.get('wallet')), 'wallet')
})

test.api('get wallet by userId', async function (t, request, store) {
  const r = await request.get(`/wallet/user/${store.get('wallet').userId}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, store.get('wallet')), 'wallet')
})

test.api('delete wallet by id', async function (t, request, store) {
  const id = store.get('wallet').id
  const r = await request.delete(`/wallet/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id') === id, 'wallet deleted')
})
