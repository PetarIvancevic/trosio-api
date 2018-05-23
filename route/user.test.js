const _ = require('lodash')

const test = require('test')

test.api('user post 1', async function (t, request, store) {
  const user = {
    id: 'fakeid123456',
    email: 'new@mail.com',
    name: 'user user',
  }
  const r = await request.post('/user').send(user)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(r.body.data, 'user posted')
  store.set('user', user)
})

test.api('user post 2', async function (t, request, store) {
  const user = {
    id: 'usertodelete',
    email: 'delete@user.com',
    name: 'i0ahsdbh -238h mgh1g19h 1g9tm84thm1t',
  }
  const r = await request.post('/user').send(user)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(r.body.data, 'user posted')
})

test.api('user put by id', async function (t, request, store) {
  const id = store.get('user').id
  const r = await request.put(`/user/${id}`).send({
    email: 'newer@mail.com',
    name: 'edited user',
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id'), 'user edited by id')
})

test.api('get user list', async function (t, request, store) {
  const r = await request.get('/user')
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.find(r.body.data, {id: store.get('user').id}), 'user')
})

test.api('get user by id', async function (t, request, store) {
  const id = store.get('user').id
  const r = await request.get(`/user/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'email') === 'newer@mail.com', 'user')
  store.set('user', r.body.data)
})

test.api('delete user by id', async function (t, request, store) {
  const id = 'usertodelete'
  const r = await request.delete(`/user/${id}`)
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body.data, 'id') === id, 'user deleted')
})
