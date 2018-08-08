const _ = require('lodash')
const jwt = require('koa-jwt')

const error = require('error')
const {db} = require('db')

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
  category: checkIfBelongsToUser('category'),
  jwt: jwt({secret: process.env.JWT_SECRET}),
  transaction: checkIfBelongsToUser('transaction'),
  wallet: checkIfBelongsToUser('wallet'),
}
