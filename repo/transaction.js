const _ = require('lodash')

const {db, helper: dbHelper} = require('db')
const error = require('error')
const {mapper} = require('repo/base')

const map = mapper({
  amount: 'amount',
  categoryId: 'category_id',
  comment: 'comment',
  date: 'date',
  id: 'id',
  place: 'place',
  walletId: 'wallet_id',
})

async function create (data) {
  return db.one(dbHelper.insert({
    amount: data.amount,
    category_id: data.categoryId,
    comment: data.comment,
    date: data.date,
    place: data.place,
    wallet_id: data.walletId,
  }, null, 'transaction') + ' RETURNING id')
  .catch({constraint: 'transaction_category_id_fkey'}, error('category.does_not_exist'))
  .catch({constraint: 'transaction_wallet_id_fkey'}, error('wallet.does_not_exist'))
  .catch(error.db('db.write'))
}

async function getByCategoryId (categoryId) {
  return db.any(`
    SELECT *
    FROM transaction
    WHERE category_id = $[categoryId]
  `, {categoryId})
}

async function getByWalletId (walletId) {
  return db.any(`
    SELECT * FROM "transaction"
    WHERE wallet_id = $[walletId]
  `, {walletId})
  .catch(error.db('db.read'))
  .map(map)
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM "transaction"
    WHERE id = $[id]
  `, {id})
  .catch(error.QueryResultError, error('transaction.not_found'))
  .catch(error.db('db.read'))
  .then(map)
}

async function removeById (id) {
  return db.none(`
    DELETE FROM "transaction"
    WHERE id = $[id]
  `, {id})
  .catch(error.db('db.delete'))
}

async function updateById (id, data) {
  return db.none(dbHelper.update(_.omitBy({
    amount: data.amount,
    category_id: data.categoryId,
    comment: data.comment,
    date: data.date,
    place: data.place,
  }, _.overSome([_.isUndefined, _.isNaN])
  ), null, 'transaction') + ' WHERE id = $[id]', {id})
  .catch({constraint: 'transaction_category_id_fkey'}, error('category.does_not_exist'))
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  getByCategoryId,
  getById,
  getByWalletId,
  removeById,
  updateById,
}
