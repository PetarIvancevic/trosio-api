const {db} = require('db')
const error = require('error')
const {mapper} = require('repo/base')

const map = mapper({
  amount: 'amount',
  category: 'category',
  date: 'date',
  id: 'id',
  place: 'place',
  walletId: 'wallet_id',
})

async function create (data) {
  return db.one(`
    INSERT INTO
      expense (amount, category, date, place, wallet_id)
      VALUES ($[amount], $[category], $[date], $[place], $[walletId])
    RETURNING id
  `, data)
  .catch({constraint: 'expense_wallet_fk'}, error('wallet.not_found'))
  .catch(error.db('db.write'))
}

async function get () {
  return db.any(`
    SELECT * FROM expense
  `)
  .map(map)
  .catch(error.db('db.read'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM expense
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('expense.not_found'))
  .catch(error.db('db.read'))
}

async function getByWalletId (walletId) {
  return db.any(`
    SELECT *
    FROM expense
    WHERE wallet_id = $[walletId]
  `, {walletId})
  .map(map)
  .catch(error.QueryResultError, error('expense.not_found'))
  .catch(error.db('db.read'))
}

async function removeById (id) {
  return db.one(`
    DELETE FROM expense WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('expense.not_found'))
  .catch(error.db('db.delete'))
}

async function updateById (id, data) {
  return db.one(`
    UPDATE expense
    SET amount = $[amount],
      category = $[category],
      date = $[date],
      place = $[place]
    WHERE id = $[id]
    RETURNING id
  `, {id, ...data})
  .catch(error.QueryResultError, error('expense.not_found'))
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  get,
  getById,
  getByWalletId,
  removeById,
  updateById,
}
