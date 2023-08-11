// 設定資料庫連線: 把 app.js 裡和「資料庫連線」有關的程式碼都複製過來一份，另外，也要一併載入 Restaurant model，因為這裡要操作的資料和 Restaurant 有關
const mongoose = require('mongoose') ////載入 mongoose
const Restaurant = require('../restaurant') // 載入 restaurant model
const restaurantList = require("../../restaurant.json").results //載入 restaurant.json
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// 設定連線到 mongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('running restaurantSeeder script...')

  //將restaurantList新增至資料庫
  Restaurant.create(restaurantList)
    .then(() => {
      console.log("restaurantSeeder done!")
      db.close()
    })
    .catch(err => console.log(err))
})