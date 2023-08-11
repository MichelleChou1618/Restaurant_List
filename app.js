// require packages used in the project
const express = require('express')
const app = express()
const port = 3000

// require express-handlebars here
const exphbs = require('express-handlebars')

//require restaurant.json here => 改成由Restaurant model自資料庫取
// const restaurantList = require('./restaurant.json')
// 載入 Restaurant model
const Restaurant = require('./models/restaurant')

// 引用 body-parser
const bodyParser = require('body-parser')


// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//載入 mongoose
const mongoose = require('mongoose')
// 設定連線到 mongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
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

// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(bodyParser.urlencoded({ extended: true }))



// routes setting
//設定首頁路由: 瀏覽所有Restaurant
app.get('/', (req, res) => {
  
  //res.render('index', { restaurant: restaurantList.results })
  //把 Restaurant model 的資料傳到樣板裡
  return Restaurant.find() // 取出 Restaurant model 裡的所有資料 => Todo.find(): 至資料庫取出所有資料
    .lean() //把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then((restaurants) => res.render('index', { restaurant: restaurants })) //將資料傳給 index 樣板
    .catch(error => console.error(error)) // 錯誤處理
})

// 設定首頁 - 點擊'新增餐廳' button - 路由: 至New頁面: 表單
app.get('/restaurants/new', (req, res) => {

  return res.render('new') 
   
})

//設定New頁面 - 點擊'新增餐廳' button -路由: 新增一筆Restaurant
app.post('/restaurants', (req, res) => {
  const restaurant = req.body       // 從 req.body 拿出表單裡資料
  //console.log(restaurant)
  return Restaurant.create(restaurant)     // 存入資料庫 => Restaurant.create(): 資料庫新增資料
     .then(() => res.redirect('/')) // 新增完成後導回首頁
     .catch(error => console.log(error))
})

//設定首頁 - 點擊Card -路由: 至Show頁面 => 瀏覽特定 Restaurant 
app.get('/restaurants/:restaurant_id', (req, res) => {
  //console.log(req.params.restaurant_id)
  // const restaurant = restaurantList.results.find(restaurant => restaurant.id.toString() === req.params.restaurant_id)
  // res.render('show', { restaurant: restaurant})

  const id = req.params.restaurant_id //從req.params取出動態路由裡的restaurant_id
  return Restaurant.findById(id) //至資料庫用id查詢特定一筆 restaurant資料 => Restaurant.findById()
     .lean()               //轉換成乾淨的 JavaScript 資料物件
     .then((restaurant) => res.render('show', { restaurant: restaurant })) //資料會被存在restaurant 變數裡，傳給樣板引擎，請 Handlebars 幫忙組裝 show 頁面
     .catch(error => console.log(error))
})

//設定首頁, Show頁面 - 點擊'Edit' button - 路由: 至Edit頁面: 表單with 預設資料 
app.get('/restaurants/:restaurant_id/edit', (req, res) => {
  const id = req.params.restaurant_id //從req.params取出動態路由裡的id
  return Restaurant.findById(id) //至資料庫用id查詢特定一筆 restaurant 資料 => Restaurant.findById()
    .lean()               //轉換成乾淨的 JavaScript 資料物件
    .then((restaurant) => res.render('edit', { restaurant })) //資料會被存在 restaurant 變數裡，傳給樣板引擎，請 Handlebars 幫忙組裝 edit 頁面
    .catch(error => console.log(error))
})

  // 設定Edit頁面 - 點擊'儲存修改' button - 路由: Update一筆restaurant
  app.post('/restaurants/:restaurant_id/edit', (req, res) => {
    const id = req.params.restaurant_id   //從req.params取出動態路由裡的id 
    //const newRestaurant = req.body // 從 req.body 拿出表單裡資料
    // return Restaurant.findById(id)   //至資料庫用id查詢特定一筆 restaurant 資料 => Todo.findById()
    //   .then(restaurant => {          // 如果查詢成功, 修改後儲存資料
    //     restaurant = newRestaurant
    //     return restaurant.save()
    //   })
    return Restaurant.findByIdAndUpdate(id, req.body)
      .then(() => res.redirect(`/restaurants/${id}`)) //如果儲存成功, 導回Show頁面
      .catch(error => console.log(error))      //任一步驟出現失敗，都會跳進錯誤處理
  })

  // 設定首頁頁面 - 點擊'Delete' button - 路由: 刪除該筆restaurant
app.post('/restaurants/:restaurant_id/delete', (req, res) => {
  const id = req.params.restaurant_id      //取得網址上的識別碼，用來查詢使用者想刪除的 restaurant
  return Restaurant.findById(id)      //使用 Restaurant.findById() 查詢資料，資料庫查詢成功以後，會把資料放進 restaurant
    .then(restaurant => restaurant.remove()) //用 restaurant.remove() 刪除這筆資料
    .then(() => res.redirect('/')) //成功刪除以後，使用 redirect 重新呼叫首頁，此時會重新發送請求給 GET /，進入到另一條路由。
    .catch(error => console.log(error))
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