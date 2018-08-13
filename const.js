module.exports = {
  error: {
    http: {
      bad_request: 400,
      unauthorized: 401,
      not_found: 404,
      internal: 500,
    },
    db: {
      connection: 600,
      read: 700,
      write: 800,
      delete: 900,
    },
    user: {
      duplicate: 1000,
      does_not_exist: 1001,
      not_found: 1100,
    },
    wallet: {
      duplicate: 1000,
      does_not_exist: 1001,
      not_found: 2100,
    },
    google: {
      invalid_token: 5500,
    },
    transaction: {
      does_not_exist: 3001,
      not_found: 3100,
    },
    category: {
      duplicate: 4000,
      does_not_exist: 4001,
      not_found: 4100,
    },
  },
  currency: {
    euro: 10,
    kuna: 20,
    dollar: 30,
  },
}
