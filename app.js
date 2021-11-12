const express = require('express')
const handlebars = require('express-handlebars') // 引入 handlebars
const db = require('./models')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const helpers = require('./_helpers')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const session = require('express-session')
const passport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000

app.engine('handlebars', handlebars({defaultLayout: 'main'})) // Handlebars 註冊樣板引擎
app.set('view engine', 'handlebars') // 設定使用 Handlebars 做為樣板引擎
app.use(express.urlencoded({extended: true})) //使用bodyParser
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false })) // 載入 session
app.use(passport.initialize())
app.use(passport.session())
app.use(flash()) // 載入flash
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req) // 要傳去nav用的user
  next()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require('./routes')(app, passport)

module.exports = app
