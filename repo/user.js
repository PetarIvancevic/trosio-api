const {db} = require('db')
const error = require('error')

async function create (data) {
  return db.none(`
    INSERT INTO
      "user" (id, name, email)
      VALUES ($[id], $[name], $[email])
  `, data)
  .catch({constraint: 'user_pk'}, error('user.duplicate'))
  .catch({constraint: 'email_unique'}, error('user.duplicate'))
  .catch(error.db('db.write'))
}

async function get () {
  return db.any(`
    SELECT * FROM "user"
  `)
  .catch(error.db('db.read'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM "user"
    WHERE id=$[id]
  `, {id})
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
}

async function removeById (id) {
  return db.one(`
    DELETE FROM "user" WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.delete'))
}

async function updateById (id, data) {
  return db.one(`
    UPDATE "user"
    SET name=$[name],
      email=$[email]
    WHERE id = $[id]
    RETURNING id
  `, {id, ...data})
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  get,
  getById,
  removeById,
  updateById,
}
