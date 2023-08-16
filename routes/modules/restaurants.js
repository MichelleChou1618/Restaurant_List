// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()

// 載入 Restaurant model
const Restaurant = require('../../models/restaurant')

//設定New頁面 - 點擊'新增餐廳' button -路由: 新增一筆Restaurant
router.post('/', (req, res) => {
  const restaurant = req.body       // 從 req.body 拿出表單裡資料
  //console.log(restaurant)
  return Restaurant.create(restaurant)     // 存入資料庫 => Restaurant.create(): 資料庫新增資料
    .then(() => res.redirect('/')) // 新增完成後導回首頁
    .catch(error => console.log(error))
})

//設定首頁 - 點擊Card -路由: 至Show頁面 => 瀏覽特定 Restaurant 
router.get('/:restaurant_id', (req, res) => {
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
router.get('/:restaurant_id/edit', (req, res) => {
  const id = req.params.restaurant_id //從req.params取出動態路由裡的id
  return Restaurant.findById(id) //至資料庫用id查詢特定一筆 restaurant 資料 => Restaurant.findById()
    .lean()               //轉換成乾淨的 JavaScript 資料物件
    .then((restaurant) => res.render('edit', { restaurant })) //資料會被存在 restaurant 變數裡，傳給樣板引擎，請 Handlebars 幫忙組裝 edit 頁面
    .catch(error => console.log(error))
})

// 設定Edit頁面 - 點擊'儲存修改' button - 路由: Update一筆restaurant
router.put('/:restaurant_id', (req, res) => {
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
router.delete('/:restaurant_id', (req, res) => {
  const id = req.params.restaurant_id      //取得網址上的識別碼，用來查詢使用者想刪除的 restaurant
  return Restaurant.findById(id)      //使用 Restaurant.findById() 查詢資料，資料庫查詢成功以後，會把資料放進 restaurant
    .then(restaurant => restaurant.remove()) //用 restaurant.remove() 刪除這筆資料
    .then(() => res.redirect('/')) //成功刪除以後，使用 redirect 重新呼叫首頁，此時會重新發送請求給 GET /，進入到另一條路由。
    .catch(error => console.log(error))
})


// 匯出路由器
module.exports = router
