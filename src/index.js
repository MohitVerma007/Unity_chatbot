const express = require('express')
const app = express()
const { PORT, CLIENT_URL } = require('./constants')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const cors = require('cors')

//import passport middleware
require('./middlewares/passport-middleware')

//initialize middlewares
app.use(express.json())
app.use(cookieParser())
// app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://loenex.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(passport.initialize())


// const resetDailyRequestCounts = require("./cronjob/scheduler")
// resetDailyRequestCounts()



//import routes
const authRoutes = require('./routes/auth')


//initialize routes
app.use('/api/v1/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//app start
const appStart = () => {
  try {
    app.listen(PORT, () => {
      console.log(`The app is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(`Error: ${error.message}`)
  }
}

appStart()
