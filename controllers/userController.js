const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const helpers = require('../_helpers')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  } ,

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id , {
      nest: true,
      include: [{ model: Comment, include:[Restaurant]}]
    })
    .then(user => {
      res.render('profile', { user: user.toJSON() })
    })
  },

  editUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        res.render('edit', { user: user.toJSON()})
      })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '使用者名稱為必填！')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : restaurant.image,
            })
              .then(() => {
                req.flash('success_messages', '使用者資料編輯成功')
                return res.redirect(`/users/${req.params.id}`)
              })
          })
      })
    }
    else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image,
          })
            .then(() => {
              req.flash('success_messages', '使用者資料編輯成功')
              return res.redirect(`/users/${req.params.id}`)
            })
        })
    }
  },

  // 加到我的最愛
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  // 移除我的最愛
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  // like this restaurant
  addLike: (req, res) => {
    return Like.create({
      //UserId: req.user.id,
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  // unlike this restaurant
  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        //UserId: req.user.id,
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
     .then( restaurant => {
       return res.redirect('back')
     })
  },

  // 瀏覽top10 users
  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },

  // 追蹤這個user
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  // 取消追蹤這個user
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController