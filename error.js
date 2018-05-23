const NestedError = require('nested-error-stacks')
const _ = require('lodash')
const assert = require('assert')
const pgp = require('pg-promise')

const konst = require('const.js')

class GenericError extends NestedError {
  constructor (ec, cause, status) {
    super(ec, cause)
    this.error = ec
    this.code = code(ec)
    this.status = status
  }
}

class DatabaseError extends GenericError {}
class HttpError extends GenericError {}
class ValidationError extends GenericError {}

function code (ec) {
  const code = _.get(konst.error, ec)
  assert(code, 'invalid error const specified')
  return code
}

function wrapper (ErrorClass, defaultStatus = 500, nothrow = false) {
  return function (ec, status = defaultStatus, defaultCause = null) {
    if (defaultCause) {
      const err = new ErrorClass(ec, defaultCause, status)
      if (nothrow) return err
      throw err
    }
    return function handler (cause) {
      throw new ErrorClass(ec, cause, status)
    }
  }
}

const error = wrapper(GenericError, 400)

error.db = wrapper(DatabaseError, 500)
error.http = wrapper(HttpError, 500, true)
error.validation = wrapper(ValidationError, 400)

error.AssertionError = assert.AssertionError
error.DatabaseError = DatabaseError
error.GenericError = GenericError
error.ValidationError = ValidationError
error.QueryResultError = pgp.errors.QueryResultError

module.exports = error
