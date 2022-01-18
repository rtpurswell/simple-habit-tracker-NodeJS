const jwt = require('express-jwt')
const jwks = require('jwks-rsa')

module.exports = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-5e2zuayl.us.auth0.com/.well-known/jwks.json',
  }),
  audience: 'http://localhost:3001',
  issuer: 'https://dev-5e2zuayl.us.auth0.com/',
  algorithms: ['RS256'],
})
