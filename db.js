const _ = require('lodash')
const pgp = require('pg-promise')()

const queryFiles = new Map()

function sql (filename) {
  if (!queryFiles.has(filename) || process.env.NODE_ENV === 'development') {
    queryFiles.set(filename, new pgp.QueryFile(`${filename}.sql`, {
      compress: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
    }))
  }

  return queryFiles.get(filename)
}

function slugify (s) {
  return require('slugify')(_.toLower(_.deburr(_.trim(s))))
}

module.exports = {
  db: pgp(process.env.DATABASE_URL),
  helper: pgp.helpers,
  pgp,
  sql,
  slugify,
  util: pgp.utils,
}
