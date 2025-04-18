const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Room = require('./models/Room')
const Booking = require('./models/Booking')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

app.post('/register', async (req, res) => {
  const { username, password, isAdmin } = req.body
  const userExists = await User.findOne({ username })
  if (userExists) return res.status(400).json({ msg: 'User exists' })
  const hashed = await bcrypt.hash(password, 10)
  const newUser = new User({ username, password: hashed, isAdmin })
  await newUser.save()
  res.json({ msg: (isAdmin)? 'Admin registered' : 'User registered' })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(400).json({ msg: 'No user found' })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ msg: 'Invalid username or password' })
  const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, 'secretKey')
  res.json({ token, isAdmin: user.isAdmin, msg: "Login successful" })
})

app.post('/rooms', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ msg: 'No token' })
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, 'secretKey')
    if (!decoded.isAdmin) return res.status(403).json({ msg: 'Not admin' })
    const { type, price, available } = req.body
    const newRoom = new Room({ type, price, available })
    await newRoom.save()
    res.json({ msg: 'Room added' })
  } catch {
    res.status(401).json({ msg: 'Invalid token' })
  }
})

app.get('/rooms', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ msg: 'No token' })
  try {
    const token = header.split(' ')[1]
    jwt.verify(token, 'secretKey')
    const rooms = await Room.find()
    res.json(rooms)
  } catch {
    res.status(401).json({ msg: 'Invalid token' })
  }
})

app.post('/book', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ msg: 'No token' })
  let decoded
  try {
    const token = header.split(' ')[1]
    decoded = jwt.verify(token, 'secretKey')
  } catch {
    return res.status(401).json({ msg: 'Invalid token' })
  }
  const { roomId } = req.body
  const room = await Room.findById(roomId)
  if (!room || !room.available) return res.status(400).json({ msg: 'Not available' })
  const newBooking = new Booking({ userId: decoded.userId, roomId: room._id })
  await newBooking.save()
  room.available = false
  await room.save()
  res.json({ msg: 'Room booked' })
})

app.get('/bookings', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ msg: 'No token' })
  let decoded
  try {
    const token = header.split(' ')[1]
    decoded = jwt.verify(token, 'secretKey')
  } catch {
     return res.status(401).json({ msg: 'Invalid token' })
   }
   if (decoded.isAdmin) {
     const allBookings = await Booking.find().populate('roomId')
     return res.json(allBookings)
   } else {
     const userBookings = await Booking.find({ userId: decoded.userId }).populate('roomId')
     return res.json(userBookings)
   }
 })
 
app.delete('/cancel/:id', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ msg: 'No token' })
  let decoded
  try {
    const token = header.split(' ')[1]
    decoded = jwt.verify(token, 'secretKey')
  } catch {
    return res.status(401).json({ msg: 'Invalid token' })
  }
  const booking = await Booking.findById(req.params.id)
  if (!booking) return res.status(404).json({ msg: 'Not found' })
  if (!decoded.isAdmin && booking.userId.toString() !== decoded.userId) {
    return res.status(403).json({ msg: 'Forbidden' })
  }
  const room = await Room.findById(booking.roomId)
  room.available = true
  await room.save()
  await booking.deleteOne()
  res.json({ msg: 'Booking canceled' })
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/rooms', require('./routes/roomRoutes'))
app.use('/api/bookings', require('./routes/bookingRoutes'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/:page', (req, res) => {
    const allowedPages = ['login.html', 'register.html', 'user.html', 'admin.html', 'index.html', 'admin-register.html']
    let requestedPage = req.params.page

    if (!requestedPage.endsWith('.html')) {
        requestedPage += '.html'
    }

    if (allowedPages.includes(requestedPage)) {
        res.sendFile(path.join(__dirname, 'public', requestedPage))
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'))
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})