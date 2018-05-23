const {db} = require('db')
const error = require('error')
const {mapper} = require('repo/base')

const map = mapper({
  amount: 'amount',
  currency: 'currency',
  id: 'id',
  paycheckDay: 'paycheck_day',
  userId: 'user_id',
})

async function create (data) {
  return db.one(`
    INSERT INTO
      wallet (currency, paycheck_day, amount, user_id)
      VALUES ($[currency], $[paycheckDay], $[amount], $[userId])
    RETURNING id
  `, data)
  .catch({constraint: 'wallet_user_fk'}, error('user.not_found'))
  .catch(error.db('db.write'))
}

async function get () {
  return db.any(`
    SELECT * FROM wallet
  `)
  .map(map)
  .catch(error.db('db.read'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM wallet
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.read'))
}

async function getByUserId (userId) {
  return db.any(`
    SELECT *
    FROM wallet
    WHERE user_id = $[userId]
  `, {userId})
  .map(map)
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.read'))
}

async function removeById (id) {
  return db.one(`
    DELETE FROM wallet WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.delete'))
}

async function updateById (id, data) {
  return db.one(`
    UPDATE wallet
    SET amount = $[amount],
      currency = $[currency],
      paycheck_day = $[paycheckDay]
    WHERE id = $[id]
    RETURNING id
  `, {id, ...data})
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  get,
  getById,
  getByUserId,
  removeById,
  updateById,
}
