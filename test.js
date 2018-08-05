const _ = require('lodash')
const assert = require('assert')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const tape = require('tape')

const {db, pgp} = require('db')
const request = supertest(require('server').callback())

tape.onFinish(function () {
  pgp.end()
  process.exit(0)
})

process.on('unhandledRejection', function (reason) {
  console.error('unhandled rejection', reason)
  process.exit(1)
})

function truncateTable (table) {
  return db.none(`TRUNCATE $[table~] RESTART IDENTITY CASCADE`, {table})
}

async function truncateDatabase () {
  const tables = _(await db.many(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $[tableSchema]
  `, {tableSchema: 'public'}))
  .filter(function (table) {
    return table.table_name !== 'SequelizeMeta'
  })
  .map('table_name')
  .value()

  return Promise.map(tables, truncateTable)
}

function test () {
  const cb = _.last(arguments)
  tape(..._.initial(arguments), async function (t) {
    await truncateDatabase()
    await cb(t)
    t.end()
  })
}

function testOnly () {
  const cb = _.last(arguments)
  tape.only(..._.initial(arguments), async function (t) {
    await truncateDatabase()
    await cb(t)
    t.end()
  })
}

function api () {
  const cb = _.last(arguments)
  tape(..._.initial(arguments), async function (t) {
    await truncateDatabase()
    await cb(t, request)
    t.end()
  })
}

function apiOnly () {
  const cb = _.last(arguments)
  tape.only(..._.initial(arguments), async function (t) {
    await truncateDatabase()
    await cb(t, request)
    t.end()
  })
}

const testUser = {
  id: 'testuserid',
  email: 'testuseremail@mail.com',
  name: 'test user',
}

async function createUser (email = testUser.email) {
  return db.one(`
    INSERT INTO "user" (id, email, name)
    VALUES ($[id], $[email], $[name])
    RETURNING id
  `, {...testUser, email})
}

function auth (id) {
  const token = jwt.sign({id}, process.env.JWT_SECRET)
  return {
    'Authorization': `Bearer ${token}`
  }
}

test.auth = auth
test.api = api
test.api.skip = tape.skip
test.createUser = createUser
test.user = testUser
test.skip = tape.skip
test.skip.api = tape.skip
test.only = testOnly
test.only.api = apiOnly

module.exports = test
