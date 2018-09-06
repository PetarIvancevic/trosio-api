const _ = require('lodash')
const moment = require('moment')

const error = require('error')
const walletRepo = require('repo/wallet')
const {db} = require('db')

async function getTodaysExecutedCronTasks (beginingOfDay, endOfDay) {
  return db.any(`
    SELECT *
    FROM cron_log
    WHERE date BETWEEN $[beginingOfDay] AND $[endOfDay]
  `, {beginingOfDay, endOfDay})
  .catch(error.db('db.read'))
}

async function createCronLog (transaction, todaysDate) {
  return transaction.one(`
    INSERT INTO cron_log ("date")
    VALUES($[todaysDate])
    RETURNING id
  `, {todaysDate})
  .catch(error.db('db.write'))
}

/*
  - check to see if a cron task has been executed today
    - run cron task if it hasn't been executed
      - check to see which users have set paydays on the current day
      - increase wallet balance by monthly amount
*/

async function payday () {
  const beginingOfDay = moment().startOf('day').format()
  const endOfDay = moment().endOf('day').format()
  const dayOfMonth = moment().get('date')

  const todaysCronTasks = await getTodaysExecutedCronTasks(beginingOfDay, endOfDay)

  if (_.size(todaysCronTasks)) {
    return {message: 'Wallets already updated today!'}
  }

  return db.tx(async function (transaction) {
    await walletRepo.updateWalletsForPaydayWithTransaction(transaction, dayOfMonth)
    await createCronLog(transaction, beginingOfDay)
    return {message: 'Successfully updated wallets!'}
  })
  .catch(error.db('db.write'))
}

module.exports = {
  payday,
}
