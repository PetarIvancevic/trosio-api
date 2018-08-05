require('dotenv-safe').config()
const ngrok = require('ngrok')

async function connect () {
  const url = await ngrok.connect(process.env.PORT)
  console.log(`
    Tunnel created!
    Web interface: ${url}
  `)
}

connect()
