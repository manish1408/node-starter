const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Website = require('../models/Website');

const randomBytesAsync = promisify(crypto.randomBytes);



/**
 * GET /website
 * Website page.
 */
exports.getWebsite = (req, res) => {

  Website.find( function ( err, websites, count ){
      res.render('account/website', {
        title: 'Website Management',
        websites:websites
      });
  });

};

/**
 * Post /website
 * Website page.
 */
exports.postWebsite = (req, res) => {

  req.assert('Url', 'Url is not Empty').notEmpty();
  req.assert('WebsiteName', 'WebsiteName is not Empty').notEmpty();
  req.assert('GoogleMonitorInterval', 'GoogleMonitorInterval is not Empty').notEmpty();
  req.assert('UptimeMonitorInterval', 'UptimeMonitorInterval is not Empty').notEmpty();
  req.assert('SSLMonitorInterval', 'SSLMonitorInterval is not Empty').notEmpty();
  req.assert('BrokenLinksInterval', 'BrokenLinksInterval is not Empty').notEmpty();
  

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/website');
  }

  const website = new Website({
    Url: req.body.Url,
    WebsiteName: req.body.WebsiteName,
    GoogleMonitorInterval: req.body.GoogleMonitorInterval,
    UptimeMonitorInterval: req.body.UptimeMonitorInterval,
    SSLMonitorInterval: req.body.SSLMonitorInterval,
    BrokenLinksInterval: req.body.BrokenLinksInterval,
    UserId:req.user.id
  });

    console.log('req=');
    console.log(req);


   website.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Website Data Saved Successfully.' });
        return res.redirect('/website');
      });

 
};


/**
 * Delete /website
 * Website page.
 */
exports.deleteWebsite = (req, res) => {
  // Website.findOneAndRemove({ id: req.params.id }, function(err) {
  //   if (err) throw err;
  //   // we have deleted the user
  //   res.send({data:'success'});
  // });
  Website.findById( req.params.id, function ( err, website ){
    website.remove( function ( err, _website ){
      res.send({data:'success'});
    });
  });

};








