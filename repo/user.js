const {db} = require('db')
const error = require('error')

async function create (data) {
  return db.none(`
    INSERT INTO
      "user" (id, email, name)
      VALUES ($[id], $[email], $[name])
    ON CONFLICT DO NOTHING
  `, data)
  .catch(error.db('db.write'))
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
  return db.none(`
    BEGIN;

    DELETE FROM wallet
    WHERE user_id = $[id];

    DELETE FROM "user"
    WHERE id = $[id];

    COMMIT;
  `, {id})
  .catch(error.db('db.delete'))
}

module.exports = {
  create,
  getById,
  removeById,
}
