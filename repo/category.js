const {db} = require('db')
const error = require('error')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  name: 'name',
  userId: 'user_id',
})

async function create (name, userId) {
  return db.one(`
    INSERT INTO category (name, user_id)
    VALUES ($[name], $[userId])
    RETURNING id
  `, {name, userId})
  .catch({constraint: 'category_user_id_name_key'}, error('category.duplicate'))
  .catch(error.db('db.write'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM category
    WHERE id = $[id]
  `, {id})
  .catch(error.QueryResultError, error('category.not_found'))
  .catch(error.db('db.read'))
  .then(map)
}

async function getUserCategories (userId) {
  return db.any(`
    SELECT * FROM category
    WHERE user_id = $[userId]
  `, {userId})
  .catch(error.db('db.read'))
  .map(map)
}

async function updateById (id, body) {
  return db.none(`
    UPDATE category
    SET name = $[name]
    WHERE id = $[id]
  `, {id, ...body})
  .catch({constraint: 'category_user_id_name_key'}, error('category.duplicate'))
  .catch(error.db('db.write'))
}

async function deleteById (id) {
  return db.one(`
    DELETE FROM category
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('category.not_found'))
  .catch({constraint: 'nez'}, error('category.has_transactions'))
  .catch(error.db('db.delete'))
}

module.exports = {
  create,
  deleteById,
  getById,
  getUserCategories,
  updateById,
}
