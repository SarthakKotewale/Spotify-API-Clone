const jwt = require('jsonwebtoken')

const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "15d" })
}
module.exports = generateToken