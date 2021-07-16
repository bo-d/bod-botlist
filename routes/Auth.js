const router = require('express').Router();
const Oauth2 = require('../modules/DiscordOauth2');
const User = require('../models/User');
const config = require('../config');
const axios = require('axios');



router.get('/login', (req, res, next) => {
  res.redirect(Oauth2.getOauthUrl());
});


router.get('/callback', async (req, res, next) => {
  
  const user = await Oauth2.getUserByCode(req.query.code);
  
  req.session.user = user;
  
  User.findOne({ id: user.id })
  .then((data) => {
    if(!data) {
      data = new User({
        id: user.id,
        name: user.username,
        tag: `${user.username}#${user.discriminator}`,
        avatar: user.avatar
      });
    } else {
      data.name = user.username;
      data.tag = `${user.username}#${user.discriminator}`;
      data.avatar = user.avatar;
    };
    
    data.save((err, doc) => {
      if(err) return next(err);
      if(req.session.backURL) return res.redirect(req.session.backURL);
      res.redirect('/');
    });
  })
  .catch(next);
  
});

router.get('/logout', (req, res, next) => {
  
  delete req.session && req.session.backURL;
  req.session.destroy(() => {
    res.redirect('/');
  });
  
});

module.exports = router;
