const GoogleAuthLib = require('google-auth-library')

const error = require('error')

const googleClient = new GoogleAuthLib.OAuth2Client(process.env.GOOGLE_CLIENT_ID)

async function verify (idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  .catch(error('google.invalid_token'))

  return ticket.getPayload()
}

module.exports = {
  verify,
}
