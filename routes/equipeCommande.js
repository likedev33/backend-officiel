
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

router.post('/ajout',  (req, res, next) => { 
    // console.log(req.body);

    var numEscale   = req.body.numEscale;
    var posteQuai   = req.body.posteQuai;
    var matce       = req.body.matce;
    var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
        if (userId < 0)      
            return res.status(400).json({'error': 'wrong token'});

            db.EffectifCommande.create({
                num_escale : numEscale,
                poste_quai : posteQuai,
                matce: matce
            }).then(function(newEffectifCommande) {
                return res.status(201).json({
                    newEffectifCommande
                })
            })
            .catch(function(err) {
                return res.status(500).json({'error': 'cannot add Effectif'});
            })
        });

module.exports = router;
