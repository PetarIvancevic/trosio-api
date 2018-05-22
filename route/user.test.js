const _ = require('lodash')

const test = require('test')

test.api('user post', async function (t, request) {
  const r = await request.post('/user').send({
    id: 'fakeid123456',
    email: 'new@mail.com',
    name: 'user user',
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(r.body.data, 'user posted')
})

test.api('user put by id', async function (t, request) {
  const id = 'fakeid123456'
  const r = await request.put(`/user/${id}`).send({
    email: 'newer@mail.com',
    name: 'edited user',
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id'), 'user edited by id')
})

test.api('get user list', async function (t, request) {
  const r = await request.get('/user')
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, {email: 'newer@mail.com'}), 'user')
})

test.api('get user by id', async function (t, request) {
  const id = 'fakeid123456'
  const r = await request.get(`/user/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'email') === 'newer@mail.com', 'user')
})

test.api('delete user by id', async function (t, request) {
  const id = 'fakeid123456'
  const r = await request.delete(`/user/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id') === id, 'user deleted')
})
