const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  // 後台首頁
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true,}).then( restaurants => {
      return res.render('admin/restaurants', { restaurants: restaurants })
    })
  },
  // 新增餐廳頁面
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  }
}
module.exports = adminController