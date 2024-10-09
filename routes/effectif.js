
// Imports
var express =  require('express');

var bcrypt = require('bcryptjs');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var db = require('../models');
var dbs = require('../models').db;


var tabTok = [];
// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,13}$/;
const router = require('express').Router();

let connexions = new Set();
let currentId = 0;

router.get('/listeEffectifs',  (req, res) => {
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    if (userId < 0)      
        return res.status(400).json({'error': 'wrong token'});
        dbs.sequelize.query(' SELECT e.matricule_pointage matp,e.clep cle,e.matricule_agent mat,e.nom_agent nom, ' +
        ' e.prenom_agent prenom,e.code_fonction CODE,f.desi_fonction fonction ' +
        ' FROM effectifs e LEFT JOIN fonctions f ON e.code_fonction = f.code_fonction ' +
        ' WHERE e.statut = 0 AND e.code_fonction IN (1,7,9)' ).
        then((value) => {
            return res.status(200).json(value[0] );
        })
        .catch(function(err) {
            return res.status(500).json({'error': 'cannot found Effectif'});
        })
    });

router.get('/listeCommandes',  async (req, res) => {

        var headerAuth  = req.headers['authorization'];
        console.log(headerAuth);

        let tabg = [];
        let elem = {};
        var userId      = jwtUtils.getUserId(headerAuth);
        if (userId < 0)      
            return res.status(400).json({'error': 'wrong token'});
        
        tabTok.push(userId)
        console.log(tabTok)

        await dbs.sequelize.query(' SELECT ce.id,es.poste_quai AS code,SUBSTRING(n.nom_navire,1,30) navire,ce.matce ' +
            ' FROM commandeffectifs ce ' +
            ' LEFT JOIN escales es ON ce.numEscale = es.num_escale ' +
            ' LEFT JOIN navires n ON es.code_navire = n.code_navire ' +
            ' WHERE SUBSTRING(ce.createdAt,1,10) = (SELECT SUBSTRING(cde.createdAt,1,10) dateCDE ' +
                                ' FROM commandeffectifs cde ' +
                                ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                                ' LIMIT 1) AND ' +
                ' ce.numShift = (SELECT cde.numShift ' +
                                ' FROM commandeffectifs cde ' +
                                ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                                ' LIMIT 1) ' +
            ' GROUP BY ce.id ', { type: dbs.sequelize.QueryTypes.SELECT }).
            then( (value) => {
                tabg = value;
            })

            let tabe = [];
            await dbs.sequelize.query(' SELECT ec.commandeId,ec.matce,ef.matricule_pointage AS matp,ef.clep AS cle,ef.matricule_agent AS mat,  ef.nom_agent AS nom,ef.prenom_agent AS prenom, ' +  
            ' ef.code_fonction AS codef,SUBSTRING(f.desi_fonction,1,40) AS fonction ' +  
            ' FROM effectifcommandes ec LEFT JOIN effectifs ef ON ec.matp = ef.matricule_pointage AND ef.clep =1 ' +
            ' LEFT JOIN fonctions f ON ef.code_fonction = f.code_fonction ' +  
            ' WHERE ec.commandeId IN (SELECT ce.id ' +
                                ' FROM commandeffectifs ce ' +
                                ' WHERE SUBSTRING(ce.createdAt,1,10) = (SELECT SUBSTRING(cde.createdAt,1,10) dateCDE ' +
                                ' FROM commandeffectifs cde ' +
                                ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                                ' LIMIT 1) AND ' +
                                ' ce.numShift = (SELECT cde.numShift ' +
                                    ' FROM commandeffectifs cde ' +
                                    ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                                    ' LIMIT 1) ' +
            ' GROUP BY ce.id) ', { type: dbs.sequelize.QueryTypes.SELECT }).
            then( (value) => {
                tabe= value;
            });
            // console.log(tabe);
    
            // let t = tabg.map()
            tab = [];
            tabg.forEach((element) => {
    
                // console.log(element);
    
                
                numCde = String(element.id);
                item = [];
                item.push(tabe.filter(elem => String(elem.commandeId).indexOf(numCde) !== -1));

                // console.log(item);

                let Obj1 = {
                    id: element.id,
                    code: element.code,
                    navire: element.navire,
                    matce: element.matce,
                    item: item[0]
                }
                tab.push(Obj1);
                // console.log(tab);

            })

            // console.log('tab->' , tab);
            return res.status(200).json(tab );

            response.ServerSSE().sendSSE({id: 1, dt: tab}, 'liste_cnde');

        });




async function data(a,b ) {
    console.log(a);
    console.log(b); 
    let c = {};
        return await  dbs.sequelize.query(' SELECT ef.matricule_pointage AS matp,ef.clep AS cle,ef.matricule_agent AS mat, ' +
        ' ef.nom_agent AS nom,ef.prenom_agent AS prenom, ' +
        ' ef.code_fonction AS codef,SUBSTRING(f.desi_fonction,1,40) AS fonction ' +
        ' FROM effectifcommandes ec LEFT JOIN effectifs ef ON ec.matp = ef.matricule_pointage and ef.clep =1 ' +
        ' LEFT JOIN fonctions f ON ef.code_fonction = f.code_fonction ' +
        ` WHERE ec.commandeId = ${a} AND ec.matce = ${b} `, { type: dbs.sequelize.QueryTypes.SELECT }).
        then((valc) => {
            // console.log(valc);
            // tab.push(valc);
            // const t = Object.assign({}, {'item':elem}, valc);
            // console.log(valc);
            c =  valc;
            
            return c;
        }).
        catch((error) => {
            return null
        });
        
}



router.get('/listePoste',  (req, res) => {
    var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
        if (userId < 0)      
            return res.status(400).json({'error': 'wrong token'});
            dbs.sequelize.query(` SELECT e.num_escale,CONCAT(CONCAT('POSTE: ',e.poste_quai),CONCAT(' - ',SUBSTRING(n.nom_navire,1,25)) ) AS navire  ` +
            ' FROM escales e LEFT JOIN navires n ON e.code_navire = n.code_navire ' +
            ` WHERE e.date_sortie = '0000-00-00' AND e.poste_quai > 7 AND e.poste_quai < 25 ` +
            ' GROUP BY e.num_escale  ' +
            ' ORDER BY e.num_escale DESC,e.poste_quai ').
            then((value) => {
                return res.status(200).json(value[0] );
            })
            .catch(function(err) {
                return res.status(500).json({'error': 'cannot found Poste'});
            })
        });

router.post('/commandeEffectif',  async (req, res, next) => { 
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
        if (userId < 0)      
            return res.status(400).json({'error': 'wrong token'});
            
        var numEscale   = req.body.numEscale;
        var navire      = req.body.navire;
        var matce       = parseInt(req.body.matce);
        var numEquipe   = req.body.numEquipe;
        var numShift   = req.body.numShift;
        var data = req.body;
        var effectifs = req.body.item;
        if (numEscale == null || matce == null || numEquipe == null ) {
            return res.status(400).json({ 'error' : 'missing parameters'});
        }
        // console.log(data.numEscale);
        // console.log(data.navire);
        // console.log(data.matce);
        // console.log(data.numEquipe);
        data.navire = `${data.navire}`;
        var newCommande = await db.commandEffectifs.create({
                numEscale : data.numEscale,
                navire : data.navire,
                matce: data.matce,
                numEquipe: data.numEquipe,
                numShift: data.numShift })
            .then(function(newCommande) {
                var c = newCommande;
                var numCmd = c.null;
                for (i = 0; i< effectifs.length; i++) {
                    db.EffectifCommande.create({
                        commandeId : numCmd,
                        matce : data.matce,
                        matp : effectifs[i].matp
                    })
                }
                return res.status(201).json({
                    newCommande
                })
            })
            .catch(function(err) {
                return res.status(500).json({'error': 'cannot add Commande'});
            })
    });

module.exports = router;
