const _ = require('lodash')

const error = require('error')
const genericServices = require('services/generic')
const walletRepo = require('repo/wallet')
const {db, helper: dbHelper} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  amount: 'amount',
  categoryId: 'category_id',
  comment: 'comment',
  date: 'date',
  id: 'id',
  place: 'place',
  type: 'type',
  walletId: 'wallet_id',
})

async function create (data) {
  return db.tx(async function (transaction) {
    const createdTransaction = await transaction.one(dbHelper.insert({
      amount: data.amount,
      category_id: data.categoryId,
      comment: data.comment,
      date: data.date,
      place: data.place,
      type: data.type,
      wallet_id: data.walletId,
    }, null, 'transaction') + ' RETURNING id')

    await walletRepo.updateWalletBalanceWithTransaction(transaction, _.pick(data, ['amount', 'type', 'walletId']))

    return createdTransaction
  })
  .catch({constraint: 'transaction_category_id_fkey'}, error('category.does_not_exist'))
  .catch({constraint: 'transaction_wallet_id_fkey'}, error('wallet.does_not_exist'))
  .catch(error.db('db.write'))
}

async function getByCategoryId (categoryId) {
  return db.any(`
    SELECT *
    FROM transaction
    WHERE category_id = $[categoryId]
    ORDER BY created_at DESC
  `, {categoryId})
}

async function getByWalletId (queryParams, walletId) {
  return db.any(`
    SELECT * FROM "transaction"
    WHERE wallet_id = $[walletId]
    ORDER BY "date" $[order:raw], created_at DESC
    ${queryParams.limit ? `LIMIT $[limit]` : ''}
  `, {
    limit: queryParams.limit,
    order: _.toUpper(queryParams.order),
    walletId,
  })
  .tapCatch(console.error)
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

async function removeById (transactionId) {
  return db.tx(async function (transaction) {
    const transactionData = await getById(transactionId)

    await transaction.none(`
      DELETE FROM "transaction"
      WHERE id = $[transactionId]
    `, {transactionId})

    await walletRepo.updateWalletBalanceWithTransaction(transaction, {
      ..._.pick(transactionData, ['amount', 'walletId']),
      type: genericServices.getOpositeTransactionType(transactionData.type),
    })
  })
  .catch(error.QueryResultError, error('transaction.not_found'))
  .catch(error.db('db.delete'))
}

async function updateById (transactionId, walletId, data) {
  return db.tx(async function (transaction) {
    const previousTransactionData = await transaction.one(`
      SELECT amount, type
      FROM transaction
      WHERE id = $[transactionId]
    `, {transactionId})

    await walletRepo.updateWalletBalanceWithTransaction(transaction, {
      amount: previousTransactionData.amount,
      type: genericServices.getOpositeTransactionType(previousTransactionData.type),
      walletId,
    })

    await transaction.none(dbHelper.update(_.omitBy({
      amount: data.amount,
      category_id: data.categoryId,
      comment: data.comment,
      date: data.date,
      place: data.place,
      type: data.type,
    }, _.overSome([_.isUndefined, _.isNaN])
    ), null, 'transaction') + ' WHERE id = $[transactionId]', {transactionId})

    await walletRepo.updateWalletBalanceWithTransaction(transaction, {
      ..._.pick(data, ['amount', 'type']),
      walletId,
    })
  })
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
