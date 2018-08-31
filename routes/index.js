var express = require('express');
var router = express.Router();

function renderHomePage(req, res) {


    var serverName = process.env.VCAP_APP_HOST ? process.env.VCAP_APP_HOST + ":" + process.env.VCAP_APP_PORT : 'localhost:3000';
    console.log("SERVER_NAME : " +serverName);
    //save user from previous session (if it exists)
    var user = req.body.user;
    //regenerate new session & store user from previous session (if it exists)
    req.session.regenerate(function (err) {

       req.session.user = user;
    //   req.body.user = user;
        console.log('req.body.user =  ' +req.session.user);
    //    console.log(req);
      return res.render('index', { title:'Express', server:serverName, user:req.session.user});
    //  res.send('index', { title:'Express', server:serverName, user:req.body.user});
  //  res.finished = true;
  //res.end();

    });
}

/* GET home page. */
//router.get('/', renderHomePage); //main

router.get('/',function(req,res){

  renderHomePage(req,res);

//  res.end();
});


/*
 When the user logs in (in our case, does http POST w/ user name), store it
 in Express session (which inturn is stored in Redis)
 */
router.post('/user', function (req, res) {

    req.session.user = req.body.user;//set username to session
    console.log("Under USER URL ----> req.session.Session.user  :  " + req.session.user);

    renderHomePage(req, res);

   //	renderHomePage(req, res);

});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


module.exports = router;
