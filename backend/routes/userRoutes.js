const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Please fill in all fields.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) return res.status(400).json({ message: 'An account with this email already exists.' })
    const user = await User.create({ name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10) })
    res.status(201).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) { res.status(500).json({ message: 'Something went wrong. Please try again.' }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email?.toLowerCase() })
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' })
    res.json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) { res.status(500).json({ message: 'Something went wrong. Please try again.' }) }
})

function createToken(id) { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }) }

module.exports = router
