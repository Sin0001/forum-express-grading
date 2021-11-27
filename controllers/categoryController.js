const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

let categoryController = {
  // 瀏覽categories頁面
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  
  // 送出新增category
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/categories')
    })
  },

  // 送出修改category
  putCategory: (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/categories')
    })
  },

  // 刪除category
  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/categories')
      }
    })
  },
}
module.exports = categoryController