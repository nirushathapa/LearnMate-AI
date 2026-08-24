const jwt = require('jsonwebtoken')

function protect(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null

  if (!token) return res.status(401).json({ message: 'Please log in to continue.' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}

module.exports = protect
