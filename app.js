// require packages used in the project
const express = require('express')
const app = express()
const port = 3000

// require express-handlebars here
const exphbs = require('express-handlebars')

//require restaurant.json here
const restaurantList = require('./restaurant.json')

// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//載入 mongoose
const mongoose = require('mongoose')
//// 設定連線到 mongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

// setting template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// setting static files
app.use(express.static('public'))



// routes setting
app.get('/', (req, res) => {
  
  res.render('index', { restaurant: restaurantList.results })
})

app.get('/restaurants/:restaurant_id', (req, res) => {
  //console.log(req.params.restaurant_id)
  const restaurant = restaurantList.results.find(restaurant => restaurant.id.toString() === req.params.restaurant_id)
  res.render('show', { restaurant: restaurant})
})

app.get('/search', (req, res) => {
  //console.log(req.query)
  const keyword = req.query.keyword

  if (!keyword) {
    return res.redirect("/")
  }
  
  const filteredRestaurants = restaurantList.results.filter(restaurant => restaurant.name.toLowerCase().includes(keyword.toLowerCase()) || restaurant.category.toLowerCase().includes(keyword.toLowerCase()))
  res.render('index', { restaurant: filteredRestaurants, keyword: keyword})
})


// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})