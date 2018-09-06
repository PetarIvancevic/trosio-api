const _ = require('lodash')

const consts = require('const')
const error = require('error')
const {db, helper: dbHelper} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  balance: 'balance',
  currency: 'currency',
  id: 'id',
  name: 'name',
  paycheckAmount: 'paycheck_amount',
  paycheckDay: 'paycheck_day',
  userId: 'user_id',
})

async function create (data) {
  return db.one(dbHelper.insert({
    balance: data.balance,
    currency: data.currency,
    name: data.name,
    paycheck_amount: data.paycheckAmount,
    paycheck_day: data.paycheckDay,
    user_id: data.userId,
  }, null, 'wallet') + ' RETURNING id')
  .catch({constraint: 'wallet_user_id_name_key'}, error('wallet.duplicate'))
  .catch({constraint: 'wallet_user_id_fkey'}, error('user.does_not_exist'))
  .catch(error.db('db.write'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM wallet
    WHERE id = $[id]
  `, {id})
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.read'))
  .then(map)
}

async function getByUserId (userId) {
  return db.any(`
    SELECT *
    FROM wallet
    WHERE user_id = $[userId]
  `, {userId})
  .catch(error.db('db.read'))
  .map(map)
}

async function removeById (id) {
  return db.none(`
    DELETE FROM wallet
    WHERE id = $[id]
  `, {id})
  .catch(error.db('db.delete'))
}

async function updateById (id, data) {
  return db.none(dbHelper.update(_.omitBy({
    currency: data.currency,
    paycheck_amount: data.paycheckAmount,
    paycheck_day: data.paycheckDay,
    name: data.name,
  }, _.overSome([_.isUndefined, _.isNaN])
  ), null, 'wallet') + ' WHERE id = $[id]', {id})
  .catch(error.db('db.write'))
}

async function updateWalletBalanceWithTransaction (transaction, {amount, type, walletId}) {
  const operator = type === consts.transactionTypes.withdrawal ? '-' : '+'
  return transaction.one(`
    UPDATE wallet
    SET balance = balance ${operator} $[amount]
    WHERE id = $[walletId]
    RETURNING id
  `, {amount, walletId})
  .catch(error.QueryResultError, error('wallet.not_found'))
  .catch(error.db('db.write'))
}

async function updateWalletsForPaydayWithTransaction (transaction, dayOfMonth) {
  return transaction.none(`
    UPDATE wallet
    SET balance = balance + paycheck_amount
    WHERE paycheck_day = $[dayOfMonth]
  `, {dayOfMonth})
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  getById,
  getByUserId,
  removeById,
  updateById,
  updateWalletBalanceWithTransaction,
  updateWalletsForPaydayWithTransaction,
}
