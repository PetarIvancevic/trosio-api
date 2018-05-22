const _ = require('lodash')
const assert = require('assert')
const supertest = require('supertest')
const tape = require('tape')

const {pgp} = require('db')
const request = supertest(require('server').callback())

const cache = new Map()
const store = new Map()

tape.onFinish(async function () {
  await pgp.end()
})

process.on('unhandledRejection', function (reason) {
  console.error('unhandled rejection', reason)
  process.exit(1)
})

function test () {
  const cb = _.last(arguments)
  tape(..._.initial(arguments), async function (t) {
    await cb(t)
    t.end()
  })
}

function testOnly () {
  const cb = _.last(arguments)
  tape.only(..._.initial(arguments), async function (t) {
    await cb(t, store)
    t.end()
  })
}

function api () {
  const cb = _.last(arguments)
  tape(..._.initial(arguments), async function (t) {
    await cb(t, request, store)
    t.end()
  })
}

function apiOnly () {
  const cb = _.last(arguments)
  tape.only(..._.initial(arguments), async function (t) {
    await cb(t, request, store)
    t.end()
  })
}

async function auth (email) {
  if (!cache.has(email)) {
    const r = await request.post('/auth').send({email})
    const token = _.get(r, 'body.data.token')
    assert(token, 'error getting token in test auth helper')
    cache.set(email, token)
  }
  return {
    'Authorization': `Bearer ${cache.get(email)}`,
  }
}

test.auth = auth
test.api = api
test.api.skip = tape.skip
test.skip = tape.skip
test.skip.api = tape.skip
test.only = testOnly
test.only.api = apiOnly

module.exports = test
