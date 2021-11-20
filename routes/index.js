const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const helpers = require('../_helpers')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

module.exports = (app, passport) => {
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
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  app.get('/restaurants', authenticated, restController.getRestaurants)
  // 瀏覽最新動態、評論
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  // 瀏覽一筆餐廳
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  // 留言
  // 送出一筆留言
  app.post('/comments', authenticated, commentController.postComment)
  // 刪除一筆留言 (only admin can do )
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  // 後台
  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // 新增餐廳頁面
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  // 送出新增餐廳
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  // 瀏覽一筆餐廳
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  // 編輯(更新)一筆餐廳
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  // 送出編輯一筆餐廳
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  //刪除一筆餐廳
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 瀏覽user清單
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers )
  // 修改user權限
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 瀏覽categories頁面
  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  // 送出新增category
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
  // 瀏覽一筆category
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  // 送出編輯一筆category
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  // 刪除一筆category
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

  // user
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
  // 瀏覽profile頁面
  app.get('/users/:id', authenticated, userController.getUser)
  // 瀏覽編輯profile頁面
  app.get('/users/:id/edit', authenticated, userController.editUser)
  // 送出修改profile
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
}
