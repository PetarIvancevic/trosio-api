const moment = require('moment')

const consts = require('const')
const testHelper = require('test')

async function createPrerequisites (request) {
  const wallet01Data = {
    balance: 250,
    currency: consts.currency.kuna,
    name: 'test wallet 01',
    paycheckAmount: 1250,
    paycheckDay: moment().get('date'),
  }

  const wallet02Data = {
    balance: 800,
    currency: consts.currency.kuna,
    name: 'test wallet 02',
    paycheckAmount: 2200,
    paycheckDay: moment().get('date'),
  }

  const wallet03Data = {
    balance: 500,
    currency: consts.currency.kuna,
    name: 'test wallet 03',
    paycheckAmount: 1500,
    paycheckDay: moment().add(1, 'day').get('date'),
  }

  const user = await testHelper.createUser()

  const {body: {data: wallet01}} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(wallet01Data)

  const {body: {data: wallet02}} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(wallet02Data)

  const {body: {data: wallet03}} = await request.post('/wallet')
  .set(testHelper.auth(user.id))
  .send(wallet03Data)

  return {
    user,
    wallets: {
      wallet01,
      wallet02,
      wallet03,
    },
  }
}

testHelper.api('should run the cron task', async function (test, request) {
  const {user, wallets} = await createPrerequisites(request)

  await request.post('/cron/monthly-salary').auth('croniMcCron', 'alfstonk4r70qu33j9').send({})

  const {body: {data: wallet01Data}} = await request.get(`/wallet/${wallets.wallet01.id}`)
  .set(testHelper.auth(user.id))

  const {body: {data: wallet02Data}} = await request.get(`/wallet/${wallets.wallet02.id}`)
  .set(testHelper.auth(user.id))

  const {body: {data: wallet03Data}} = await request.get(`/wallet/${wallets.wallet03.id}`)
  .set(testHelper.auth(user.id))

  test.ok(wallet01Data.balance === 1500, 'balance should be updated')
  test.ok(wallet02Data.balance === 3000, 'balance should be updated')
  test.ok(wallet03Data.balance === 500, 'balance should be the same')
})
