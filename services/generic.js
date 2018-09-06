const consts = require('const')

function getOpositeTransactionType (type) {
  return consts.transactionTypes.withdrawal === type
    ? consts.transactionTypes.deposit : consts.transactionTypes.withdrawal
}

module.exports = {
  getOpositeTransactionType,
}
