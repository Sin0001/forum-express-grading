const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')
const passport = require('../config/passport')


const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  // 前台
  //如果使用者訪問首頁，就導向 /restaurants 的頁面
  router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  router.get('/restaurants', authenticated, restController.getRestaurants)
  // 瀏覽前10人氣餐廳
  router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
  // 瀏覽最新動態、評論
  router.get('/restaurants/feeds', authenticated, restController.getFeeds)
  // 瀏覽dashboard
  router.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)
  // 瀏覽一筆餐廳
  router.get('/restaurants/:id', authenticated, restController.getRestaurant)

  // 留言
  // 送出一筆留言
  router.post('/comments', authenticated, commentController.postComment)
  // 刪除一筆留言 (only admin can do )
  router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  // 後台
  // 連到 /admin 頁面就轉到 /admin/restaurants
  router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // 新增餐廳頁面
  router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  // 送出新增餐廳
  router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  // 瀏覽一筆餐廳
  router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  // 編輯(更新)一筆餐廳
  router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  // 送出編輯一筆餐廳
  router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  //刪除一筆餐廳
  router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 瀏覽user清單
  router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  // 修改user權限
  router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 瀏覽categories頁面
  router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  // 送出新增category
  router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
  // 瀏覽一筆category
  router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  // 送出編輯一筆category
  router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  // 刪除一筆category
  router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // user
  router.get('/signup', userController.signUpPage)
  router.post('/signup', userController.signUp)
  router.get('/signin', userController.signInPage)
  router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  router.get('/logout', userController.logout)
  // 瀏覽 top10 users
  router.get('/users/top', authenticated, userController.getTopUser)
  // 瀏覽profile頁面
  router.get('/users/:id', authenticated, userController.getUser)
  // 瀏覽編輯profile頁面
  router.get('/users/:id/edit', authenticated, userController.editUser)
  // 送出修改profile
  router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
  // 送出將餐廳加入我的最愛
  router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  // 移除我的最愛
  router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
  // like this restaurant
  router.post('/like/:restaurantId', authenticated, userController.addLike)
  // unlike this restaurant
  router.delete('/like/:restaurantId', authenticated, userController.removeLike)
  // follow user
  router.post('/following/:userId', authenticated, userController.addFollowing)
  // remove follow user
  router.delete('/following/:userId', authenticated, userController.removeFollowing)

  module.exports = router
