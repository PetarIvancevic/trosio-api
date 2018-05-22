module.exports = {
  errors: {
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
  },
}
