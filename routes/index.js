var express = require('express');
var mongoose = require('mongoose')
var router = express.Router();
var User = require('../modules/user')
var Password_details= require('../modules/add_password')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
var getallpass = Password_details.find()

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Middleware
function checkLoginUser(req,res,next){
  var usertoken = localStorage.getItem('usertoken')
  try{
    var decoded = jwt.verify(usertoken,'loginToken')
  } catch(err){
    res.redirect('/')
  }
  next();
}

function checkEmail(req,res,next){
  var email = req.body.email
  var checkexist = User.findOne({email:email})
  checkexist.exec((err,data)=>{
    if (err) throw console.log(err);
    if (data){
      return res.render('signup', { title: 'Password Managment System', msg:"Already Email Exists" });
    }
  });
  next();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  if(loginuser){
    res.redirect('/dashboard')
  }else{
  res.render('index', { title: 'Password Managment System',loginuser:loginuser, msg:'' });
  }
});

router.post('/', function(req, res, next) {
  var email = req.body.email
  var password = req.body.password
  var checkemail = User.findOne({email:email})
  checkemail.exec((err,data)=>{
    if (err) throw console.log(err)
    var getpassword = data.password
    var getUserID = data._id
    if(bcrypt.compareSync(password,getpassword)){
      var token = jwt.sign({userID:getUserID},'loginToken')
      localStorage.setItem('usertoken',token)
      localStorage.setItem('loginuser',data.username)
      res.redirect('/dashboard');
    }
    else{
      res.render('index', { title: 'Password Managment System', msg:'Invalid UserId or Paasword' });
    }
  })
});

router.get("/dashboard",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  res.render('dashboard',{title:"Password Managment System",loginuser:loginuser, msg:""})
})

router.get("/addnewpassword",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  console.log(loginemail)
  getallpass.exec(function(err,data){
    if (err) throw console.log(err)
    res.render('addnewpassword',{ title:"Password Managment System",records:data, errors:'',loginuser:loginuser, msg:""})
  })
})

router.post("/addnewpassword",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  var pass_detail = req.body.passworddetail;
  var pass_cat = req.body.passwordcategory;
  var password_details = new Password_details({
    password_category:pass_cat,
    password_detail:pass_detail,
  })
  password_details.save(function(err,data){
      if (err) throw console.log(err)
      res.render('addnewpassword',{ title:"Password Managment System",records:data, errors:'',loginuser:loginuser, msg:"Password Inserted Successfully"})
      console.log({decoded})

    })
  })
 


router.get('/signup', function(req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  if(loginuser){
    res.redirect('/dashboard')
    
  }else{
  res.render('signup', { title:"Password Managment System",loginuser:loginuser, msg:"" });
  }
});

router.post('/signup', checkEmail ,function(req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;
  if (password !=confirmpassword){
    res.render('signup', { title: 'Password Managment System', msg:'Email or Password does not Match' });
  }
  else{
    password = bcrypt.hashSync(req.body.password,10)
  var user = new User({
    username:username,
    email:email,
    password:password,
  })
  user.save((err,doc)=>{
    if (err) {
      console.log(err)
    }
      return res.render('signup', { title: 'Password Managment System', msg:'User Registered Successfully' });
  })
}

});

router.get("/viewallpassword",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  var loginid = localStorage.getItem('loginid')
  var getdata = 
  getallpass.exec(function(err,data){
    if (err) throw console.log(err);
    res.render('viewallpassword', { title: 'Password Managment System',loginuser:loginuser,records:data  });
  });
  });


router.get("/viewallpassword/edit/:id",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  var id = req.params.id
  var getpassdetail = Password_details.findById({_id:id})
  getpassdetail.exec(function(err,data){
      if (err) throw console.log(err)
      res.render('edit_password_details', { title: 'Password Managment System',record:data,loginuser:loginuser ,msg:''  });
    })
  })

router.post("/viewallpassword/edit/:id",checkLoginUser,function(req,res,next){
  var loginuser = localStorage.getItem('loginuser')
  var id = req.params.id
  var passcat = req.body.pass_category
  var passdetail = req.body.pass_detail
  Password_details.findByIdAndUpdate(id,{password_category:passcat,password_detail:passdetail}).exec(function(err){
  var getpassdetail = Password_details.findById({_id:id})
  getpassdetail.exec(function(err,data){
      if (err) throw console.log(err)
    res.redirect("/viewallpassword")
    })
  })
  })


router.get('/viewallpassword/delete/:id', checkLoginUser,function(req, res, next) {
  var id = req.params.id;
  var passdelete = Password_details.findByIdAndDelete(id);
  passdelete.exec(function(err){
    if (err) throw console.log(err)
    else{
  res.redirect('/viewallpassword')
    }
  })
});


router.get('/logout', function(req, res, next) {
  localStorage.removeItem('usertoken')
  localStorage.removeItem('loginuser')
  res.redirect('/')
});

module.exports = router;
