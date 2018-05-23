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
      not_found: 1100,
    },
    wallet: {
      not_found: 2000,
    },
    expense: {
      not_found: 3000,
    },
  },
  currency: {
    euro: 10,
    kuna: 20,
    dollar: 30,
  },
  category: {
    dummyCategory1: 10,
    dummyCategory2: 20,
    dummyCategory3: 30,
  },
}
