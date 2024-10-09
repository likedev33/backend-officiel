
// Imports
var express =  require('express');

var bcrypt = require('bcryptjs');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var db = require('../models');
var dbs = require('../models').db;


// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,13}$/;
const router = require('express').Router();

router.get('/register', (req, res) => {
    console.log('ok');
});

router.post('/register',  (req, res, next) => { 
    // console.log(req.body);

    var email       = req.body.email;
    var username    = req.body.username;
    var password    = req.body.password;
    var nom         = req.body.nom;
    var adresse     = req.body.adresse;
    var telephone   = req.body.telephone;
    var role        = req.body.isAdmin;

    // console.log(nom + ' - ' + adresse + ' - ' + telephone);

    if (email == null || username == null || password == null ) {
        return res.status(400).json({ 'error' : 'missing parameters'});
    }

    if (username.length >= 20 || username.length <= 4 ) {
        return res.status(400).json({ 'error' : 'wrong username (must be length 5 - 12)'});
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({'error': 'email is not valid'});
    }

    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({'error': 'password invalid (must length 4 - 8 and include 1 number'});
    }
    
    models.User.findOne({
        attributes : ['email'],
        where : { email: email }
    }) // fin findOne
    .then(function(userFound) {
        if (!userFound) {
            bcrypt.hash(password, 5, async function(err, bcryptedPassword) {
                var newUser = await models.User.create({
                    email : email,
                    username: username,
                    password: bcryptedPassword,
                    nom: nom,
                    adresse: adresse,
                    telephone: telephone,
                    isAdmin: 1
                }) // fin de newUser = models.User.create
                .then(async function(newUser) {
                    var newUser = await models.UserRole.create({
                        roleid : 3,
                        userid: newUser.id
                    })
                    return res.status(201).json({
                        'userId' : newUser.id
                    })
                })
                .catch(function(err) {
                    console.log(err);
                    return res.status(500).json({'error': 'cannot add user'});
                })
            }); // fin de bcrypt.hash(password, 5, function(err, bcryptedPassword)
        } else {
            return res.status(409).json({'error': 'user already exist'});
        } // fin de (!userFound)
    })
    .catch(function(err) {
        return res.status(500).json({'error': 'enable to verify user'});
    }); // fin de then(function(userFound)    
});

router.post('/login', (req, res) => {

    var username       = req.body.username;
    var password    = req.body.password;

    if (username == null || password == null) {
        return res.status(400).json({'error' : 'missing parameters'});
    }

    //models.User.findOne({
    db.User.findOne({
        where : { username: username }
    })
    .then(function(userFound) {
        if(userFound) {
            bcrypt.compare(password, userFound.password, async function(errBycrypt, resBycrypt) {
                if(resBycrypt) {
                    /*
                    return await res.status(200).json({
                        'id': userFound.id,
                        'username': userFound.username,
                        'email': userFound.email,
                        'userId': userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound),
                        'nom': userFound.nom,
                        'adresse': userFound.adresse,
                        'telephone': userFound.telephone,
                        'isAdmin' : userFound.Role
                    });
                    */
                    dbs.sequelize.query(' SELECT u.id,u.username,u.email,u.password,ue.roleid,r.name ' +
                                ' FROM users u LEFT JOIN user_roles ue ON ue.userid = u.id ' +
                                ' LEFT JOIN roles r ON ue.roleid = r.id ' +
                                ' WHERE u.username =:nom ;' ,
                    { replacements: { nom: req.body.username }, type: dbs.sequelize.QueryTypes.SELECT }).
                    then((value) => {
                        // console.log(value[0])
                        return res.status(200).send({
                            id: value[0].id,
                            username: value[0].username,
                            email: value[0].email,
                            token: jwtUtils.generateTokenForUser(userFound),
                            roles: `ROLE_${value[0].name}`
                          });
                    })
                    .catch((err) => {
                        console.log(`La fiche utilisateur n''est pas trouvée !`);
                    });
                } else {
                    return res.status(400).json({'error': 'Invalid password'})
                }
            });
        } else {
            return res.status(400).json({'error': 'user not exist in DB'});
        }
    })
    .catch(function(err) {
        return res.status(500).json({'error':'Unable to verify user'});
    });
});

router.post('/signout' , (req, res) => {
    try {
      req.session = null;
      return res.status(200).send({
        message: "You've been signed out!"
      });
    } catch (err) {
      this.next(err);
    }
  });

module.exports = router;
