const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const isLoggedIn = require('../../middleware/auth');
const router = new express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const async = require('async');
const { gmailId, gmailPassword } = require('../config/keys');
const upload = require('../config/multer');
const fs = require('fs');
const Path = require('path');

const app = express();

//============Register===================

router.post('/register', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      req.flash('error', 'Image must be in jpg/png format');
      res.redirect('/');
    } else {
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        fName: req.body.fName,
        lName: req.body.lName,
        wNumber: req.body.wNumber,
        collegeName: req.body.collegeName,
        pImage: req.files[0].filename,
        cImage: req.files[1].filename,
        idImage: req.files[2].filename,
      });

      if (
        req.body.email === 'gandhibhanuj@gmail.com' ||
        req.body.email === 'mridulgandhi@wecbr.co' ||
        req.body.email === 'rohanarora@wecbr.co' ||
        req.body.email === 'sachinnegi808@gmail.com'
      ) {
        user.isManager = true;
        user.position = 'Manager';
      }

      User.register(user, req.body.password, (err, user) => {
        if (err) {
          req.flash('error', 'User already exists');
          res.redirect('/');
        } else {
          passport.authenticate('local')(req, res, (err, user) => {
            req.flash(
              'success',
              'Successfully Signed Up! Nice to meet you, ' + req.body.fName
            );
            res.redirect('/profile');
          });
        }
      });
    }
  });
});

//==================Login=======================

router.post(
  '/login',
  passport.authenticate('local', {
    successFlash: 'Welcome back!',
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: 'Please check Email or Password',
  }),
  (req, res) => {}
);

//======================Logout======================

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.flash('success', 'Successfully Logged Out!');
  res.redirect('/');
});

//=======================User profile================
router.get('/users/:id', isLoggedIn, (req, res) => {
  if (req.user.isManager || req.user.tempManager) {
    User.findById(req.params.id)
      .populate('groups')
      .then((foundUser) => {
        res.render('userProfile', { user: foundUser });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.render('err404');
  }
});

//=================Reset=======================

router.post('/forgot', (req, res, next) => {
  async.waterfall(
    [
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash('error', "User doesn't exist");
            return res.redirect('/');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      (token, user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: gmailId,
            pass: gmailPassword,
          },
        });
        const mailOptions = {
          to: user.email,
          from: 'wecbr12345@gmail.com',
          subject: 'WeCbr Password Reset',
          text:
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' +
            req.headers.host +
            '/reset/' +
            token +
            '\n\n' +
            'This link is valid for 10 minutes only' +
            '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          console.log('mail sent');
          done(err, 'done');
        });
      },
    ],
    (err) => {
      if (err) return next(err);
      req.flash('success', 'Reset code sent to your registered email.');
      res.redirect('/');
    }
  );
});

//==============Reset token form route====================

router.get('/reset/:token', (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    (err, user) => {
      if (err) {
        throw new Error("Couldn't find user");
      }
      if (!user) {
        return res.redirect('/');
      }
      res.render('reset', { token: req.params.token });
    }
  );
});

router.post('/reset/:token', (req, res) => {
  async.waterfall(
    [
      (done) => {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          (err, user) => {
            if (err) {
              throw new Error("Couldn't find user");
            }
            if (!user) {
              return res.redirect('back');
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, (err) => {
                if (err) {
                  throw new Error("Couldn't set password");
                }
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save((err) => {
                  if (err) {
                    throw new Error("Couldn't save user");
                  }
                  req.logIn(user, (err) => {
                    done(err, user);
                  });
                });
              });
            } else {
              return res.redirect('back');
            }
          }
        );
      },
      (user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: gmailId,
            pass: gmailPassword,
          },
        });
        const mailOptions = {
          to: user.email,
          from: 'wecbr12345@gmail.com',
          subject: 'WeCbr: Your password has been changed',
          text:
            'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            user.email +
            ' has just been changed.\n',
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          done(err);
        });
      },
    ],
    (err) => {
      if (err) {
        throw new Error("Couldn't load profile");
      }
      res.redirect('/profile');
    }
  );
});

//==================Update===================
router.get('/profile/edit', isLoggedIn, (req, res) => {
  User.findById(req.user._id, (err, foundUser) => {
    res.render('editUser', { user: foundUser });
  });
});

router.put('/profile', isLoggedIn, upload, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      username: req.body.username,
      fName: req.body.fName,
      lName: req.body.lName,
      wNumber: req.body.wNumber,
      collegeName: req.body.collegeName,
    },
    (err, updatedUser) => {
      if (err) {
        res.redirect('/profile/edit');
      } else {
        req.flash('success', 'Successfully updated profile!');
        res.redirect('/profile');
      }
    }
  );
});

router.put('/changePassword', isLoggedIn, (req, res) => {
  User.findOne(
    {
      _id: req.user._id,
    },
    (err, user) => {
      if (err) {
        throw new Error("Couldn't find user");
      }
      if (!user) {
        return res.redirect('back');
      }
      if (req.body.password === req.body.confirm) {
        user.changePassword(req.body.old, req.body.password, (err) => {
          if (err) {
            throw new Error("Couldn't set password");
          }
          user.save((err) => {
            if (err) {
              throw new Error("Couldn't save user");
            }
            req.flash('success', 'Successfully Updated Information');
            res.redirect('/');
          });
        });
      } else {
        res.flash('error', "Couldn't set password");
        return res.redirect('back');
      }
    }
  );
});

router.get('/changeProfile', isLoggedIn, (req, res) => {
  res.render('changeProfile');
});

router.put('/changeProfile', isLoggedIn, upload, (req, res) => {
  if (req.user.pImage) {
    const path = Path.join(__dirname, '../../public/uploads', req.user.pImage);
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('No image to delete');
  }
  User.findByIdAndUpdate(
    req.user._id,
    {
      pImage: req.files[0].filename,
    },
    (err, updatedUser) => {
      if (err) {
        req.flash('error', "Couldn't Update Profile Picture");
        res.redirect('back');
      } else {
        req.flash('success', 'Successfully Updated Profile Picture');
        res.redirect('/profile');
      }
    }
  );
});

router.put('/changeLogo', isLoggedIn, upload, (req, res) => {
  if (req.user.cImage) {
    const path = Path.join(__dirname, '../../public/uploads', req.user.cImage);
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('No image to delete');
  }
  User.findByIdAndUpdate(
    req.user._id,
    {
      cImage: req.files[0].filename,
    },
    (err, updatedUser) => {
      if (err) {
        req.flash('error', "Couldn't Update Password");
        res.redirect('/profile');
      } else {
        req.flash('success', 'Successfully Updated Logo');
        res.redirect('/profile');
      }
    }
  );
});

// router.get("/changeProfile", isLoggedIn, (req, res) => {
//   res.render("changePhoto");
// });

// router.put("/changeProfile", isLoggedIn, upload, (req, res) => {
//   User.findByIdAndUpdate(
//     req.user._id,
//     {
//       pImage: req.files[0].filename,
//       cImage: req.files[1].filename,
//       idImage: req.files[2].filename,
//     },
//     (err, updatedUser) => {
//       if (err) {
//         res.redirect("/changePassword");
//       } else {
//         res.redirect("/profile");
//       }
//     }
//   );
// });

//===================Delete=====================
router.delete('/users/me', isLoggedIn, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
