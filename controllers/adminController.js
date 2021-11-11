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
  },
  // 送出新增餐廳
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    return Restaurant.create({
      name: req.body.name,
      tel: req.body.tel,
      address: req.body.address,
      opening_hours: req.body.opening_hours,
      description: req.body.description
    })
      .then((restaurant) => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
  },
  // 瀏覽特定餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/restaurant', {
        restaurant: restaurant
      })
    })
  }
}
module.exports = adminController