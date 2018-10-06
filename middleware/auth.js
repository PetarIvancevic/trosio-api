const _ = require('lodash')
const auth = require('basic-auth')
const jwt = require('koa-jwt')

const error = require('error')
const {db} = require('db')

function basic (ctx, next) {
  const user = auth(ctx.req)

  if (process.env.BASIC_AUTH_CREDS !== `${user.name}:${user.pass}`) {
    throw error.auth('http.unauthorized')()
  }

  return next()
}

function checkIfBelongsToUser (tableName) {
  return function (ctx) {
    return db.one(`
      SELECT user_id
      FROM ($[tableName]~)
      WHERE id = $[id] AND user_id = $[userId]
    `, {
      tableName,
      id: _.get(ctx, 'v.param.id'),
      userId: _.get(ctx, 'state.user.id'),
    })
    .catch(error.QueryResulstsError, error(`${tableName}.not_found`))
    .catch(error.db('db.read'))
  }
}

module.exports = {
  basic,
  category: checkIfBelongsToUser('category'),
  jwt: jwt({secret: process.env.JWT_SECRET}),
  transaction: checkIfBelongsToUser('transaction'),
  wallet: checkIfBelongsToUser('wallet'),
}
