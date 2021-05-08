const express = require('express');
const User = require('../models/user');
const isLoggedIn = require('../../middleware/auth');
const Group = require('../models/group');
const { use } = require('passport');
const router = new express.Router();

const app = express();

router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    req.flash('success', 'Welcome Back!');
    res.redirect('/profile');
  } else {
    res.render('home', { isGoogle: false });
  }
});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await User.findById(req.user.id).populate('groups');
  res.render('dashboard', {
    user: user,
  });
});

router.get('/reportingTool', isLoggedIn, (req, res) => {
  res.render('reportingTool', { user: req.user });
});

router.get('/performance', isLoggedIn, async (req, res) => {
  if (req.user.isManager || req.user.tempManager) {
    const users = await User.find({}).populate('groups');
    res.render('performance', { users, user: req.user });
    // User.find({})
    //   .then((foundUsers) => {
    //     res.render('performance', { users: foundUsers });
    //   })
    //   .catch((err) => {
    //     throw new Error('Not found!', err);
    //   });
  } else {
    res.render('err404');
  }
});

router.get('/studentDetails', isLoggedIn, async (req, res) => {
  if (req.user.isManager || req.user.tempManager) {
    const users = await User.find({}).populate('groups');
    res.render('studentDetails', { users, user: req.user });
    // if (req.user.isManager) {
    //   User.find({})
    //     .then((foundUsers) => {
    //       res.render('studentDetails', { users: foundUsers });
    //     })
    //     .catch((err) => {
    //       throw new Error('Not found!', err);
    //     });
  } else {
    res.render('err404');
  }
});

router.get('/assign', isLoggedIn, async (req, res) => {
  if (req.user.isManager || req.user.tempManager) {
    try {
      const groups = await Group.find({});
      const users = await User.find({}).populate('groups').exec();
      // console.log(users[0].groups);
      // console.log(typeof users[0].groups);
      res.render('assign', { groups, users });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render('err404');
  }
});

router.post('/createGroup', (req, res) => {
  const group = new Group({
    groupNumber: req.body.groupNumber,
    groupLink: req.body.groupLink,
  });
  group.save().then(() => {
    console.log('success');
  });

  res.redirect('/assign');
});

router.post('/assignGroup/:id', async (req, res) => {
  try {
    const selected = req.params.id;
    Group.findByIdAndUpdate(selected, {
      user: req.body.users.split(' ')[0],
      userName: req.body.users.split(' ')[1],
    })
      .then(() => {
        res.redirect('/assign');
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {}
});

router.delete('/groups/:id', isLoggedIn, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id).then(() => {
      res.redirect('/assign');
    });
  } catch (err) {
    res.status(500).send();
  }
});

router.get('/assignManager/:id', (req, res) => {
  if (req.user.isManager === true) {
    let id = req.params.id;
    User.findOneAndUpdate({ _id: id }, { tempManager: true })
      .then((u) => {
        res.redirect('/performance');
      })
      .catch((e) => {});
  } else {
    res.render('err404');
  }
});

router.get('/unassignManager/:id', (req, res) => {
  if (req.user.isManager === true) {
    let id = req.params.id;
    User.findOneAndUpdate({ _id: id }, { tempManager: false })
      .then((u) => {
        res.redirect('/performance');
      })
      .catch((e) => {});
  } else {
    res.render('err404');
  }
});

module.exports = router;
