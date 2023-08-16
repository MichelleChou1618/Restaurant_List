// 引用 Express 與 Express 路由器
const express = require('express')
const router = express.Router()

// 載入 Restaurant model
const Restaurant = require('../../models/restaurant')

//設定首頁路由: 瀏覽所有Restaurant
router.get('/', (req, res) => {

  //res.render('index', { restaurant: restaurantList.results })
  //把 Restaurant model 的資料傳到樣板裡
  return Restaurant.find() // 取出 Restaurant model 裡的所有資料 => Todo.find(): 至資料庫取出所有資料
    .lean() //把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then((restaurants) => res.render('index', { restaurant: restaurants })) //將資料傳給 index 樣板
    .catch(error => console.error(error)) // 錯誤處理
})

// 設定首頁頁面 - 點擊'Search' button - 路由: filter restaurants + 做sort
router.get('/search', (req, res) => {
  //console.log(req.query)
  const keyword = req.query.keyword.trim().toLowerCase()
  const sort = req.query.sort.trim().toLowerCase()
  let sortCriteria = {}

  //判斷sort要用哪種criteria
  switch (sort) {
    case 'a>z':
      sortCriteria = { name_en: 'asc' }
      break

    case 'z>a':
      sortCriteria = { name_en: 'desc' }
      break

    case 'category':
      sortCriteria = { category: 'asc' }
      break

    case 'location':
      sortCriteria = { location: 'asc' }
      break

  }

  //console.log(sort, sortCriteria)

  /*
  if (!keyword) {
    return res.redirect("/")
  }
  */

  // const filteredRestaurants = restaurantList.results.filter(restaurant => restaurant.name.toLowerCase().includes(keyword.toLowerCase()) || restaurant.category.toLowerCase().includes(keyword.toLowerCase()))
  // res.render('index', { restaurant: filteredRestaurants, keyword: keyword})

  Restaurant.find({})
    .lean()
    .sort(sortCriteria)
    .then(restaurants => {
      const filteredRestaurants = keyword ? (restaurants.filter(
        data =>
          data.name.toLowerCase().includes(keyword) ||
          data.category.includes(keyword)
      )) : restaurants
      res.render("index", { restaurant: filteredRestaurants, keyword: keyword, sort: sort })
    })

    .catch(err => console.log(err))

})



// 匯出路由器
module.exports = router