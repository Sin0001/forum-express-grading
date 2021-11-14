const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User // 載入User資料

const adminController = {
  // 作業要求規格
  // 顯示使用者清單
  getUsers: (req, res) => {
    // 去user資料庫撈出所有users
    return User.findAll({raw: true})
    // 傳去admin/users渲染出來
      .then(users => {
        return res.render('admin/users', { users })
      })
  },

  // 修改使用者權限
  toggleAdmin: (req, res) => {
    // 用id去user資料庫找user
    // 拿出這個user的isAdmin與email (要toJSON)
    // 如果是root@example , 不行變更role , back
    // 如果不是root@example , 更新此user的isAdmin , 導回使用者頁面
    return User.findByPk(req.params.id)
      .then(user => {
        const { isAdmin, email } = user.toJSON()
        if (email === 'root@example.com') {
          req.flash('error_messages', '禁止變更管理者權限')
          return res.redirect('back')
        } else {
          user.update({ isAdmin: !isAdmin })
            .then(user => {
              req.flash('success_messages', '使用者權限變更成功')
              res.redirect('/admin/users')
            })
        }
      })
  },

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

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
      })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      }).then((restaurant) => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },
  // 瀏覽一筆餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/restaurant', {
        restaurant: restaurant
      })
    })
  },
  // 編輯(更新)一筆餐廳
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/create', { restaurant: restaurant })
    })
  },
  // 送出編輯一筆餐廳
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
            })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
      })
    }
    else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image
          })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  // 刪除一筆餐廳
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            res.redirect('/admin/restaurants')
          })
      })
  }
}
module.exports = adminController