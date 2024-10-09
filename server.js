
// imports
var express = require('express');
var bodyParser = require('body-parser');
const helmet = require('helmet');

const httpProxy = require('express-http-proxy');
const compression = require('compression');
const cors = require('cors');

const spdy = require("spdy");
const fs = require('fs');

const PORT = 5000;
const CERT_DIR = `${__dirname}/cert`;


var jwtUtils = require('./utils/jwt.utils');
var models = require('./models');
var db = require('./models');
var dbs = require('./models').db;
// Imports routes
const authRoute = require('./routes/auth');
const equipeCommandeRoute = require('./routes/equipeCommande');
const effectifRoute = require('./routes/effectif');
// const ServerSSE = require('./sse');
const connectDB = require('./config/db');
var app = express();
let cx = 0;
let nvcid = 0;
connectDB();
let connexions = new Set();
let currentId = 0;
let tabData = [];
let tabDataG = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var corsOptions = {
  origin: ['http://localhost:4200'], // 'https://ticnom.com', 'https://www.ticnom.com'],
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}

app.use(cors(corsOptions));
app.use(compression());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
  res.setHeader('Access-Control-Expose-Headers','Authorization');
  next();
  app.options('*', (req, res) => {
      // allowed XHR methods  
      res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
      res.setHeader('Accept', 'text/html', 'utf-8');
      res.send();
  });
});
app.use(sse());
app.use('/api/users', authRoute);
app.use('/api/equipeCommande', equipeCommandeRoute);
app.use('/api/effectifs', effectifRoute);

app.get('/sse', (request, response) => {
//   console.log('il entre ici dans   === sse ==')
  response.initStream();
});



app.get('/listeCommandes', async (request, response) => {
    if (cx == 1) {
        // console.log('aprés creation');

        promisseA = new Promise((resolutionFunc, rejectionFunc) => {
            resolutionFunc(recupeData());
        });

        promisseA.then((val) =>
            recupeDataTabe(val),
            // console.log("journalisation asynchrone / val vaut :", val),
        ).then((tabData) => { 
            // console.log(r);
            response.initStream();
    
            let id = 1;
            tab = [];
            // console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
            // console.log(tabData);
            // console.log('cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc')
            response.sendSSE(tabData, 'listeCnde'); // {id: 1, data: tabData}
            // console.log('il entre ici dans  ---- listeCommandes')
        
        });


    }
});


// **** annuler des commandes **************************************************************************
app.post('/annulerCommandes',  async (req, res, next) => { 
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return res.status(400).json({'error': 'wrong token'}); 

    promisseA = new Promise((resolutionFunc, rejectionFunc) => {
        //resolutionFunc(777);
        resolutionFunc(recupeDernierAffectations());
    });

    promisseA.then((val) =>
        console.log(val),
        // cx = 1,
        // res.redirect('/listeCommandes')
    );
    promisseB = new Promise((resolutionFunc, rejectionFunc) => {
        //resolutionFunc(777);
        resolutionFunc(recupeDernierCommandes());
    });

    promisseB.then((val) =>
        console.log(val),
        cx = 1,
        res.redirect('/listeCommandes')
    );



        // console.log("journalisation asynchrone / val vaut :", val),
});

// **** traitement des commandes **************************************************************************
app.post('/traitementCommandes',  async (req, res, next) => { 
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
  if (numEscale == null || matce == null || numEquipe == null || navire == null) {
      return res.status(400).json({ 'error' : 'missing parameters'});
  }
  data.navire = `${data.navire}`;
  var newCommande = await db.commandEffectifs.create({
          numEscale : data.numEscale,
          navire : data.navire,
          matce: data.matce,
          numEquipe: data.numEquipe,
          numShift: data.numShift })
      .then(async function(newCommande) {
          var c = newCommande;
          var numCmd = c.null;
          nvcid = numCmd;
          for (i = 0; i< effectifs.length; i++) {
            await db.EffectifCommande.create({
                  commandeId : numCmd,
                  matce : data.matce,
                  matp : effectifs[i].matp
              })
          }
      }).
      then((value) => {
        cx = 1;
        res.redirect('/listeCommandes');
        
    //   }).then((v) => {
    //     console.log(recupeData());
        // response.initStream();
        // response.sendSSE({id: newCommande, data: recupeData()}, 'listeCnde');
      })
      .catch(function(err) {
          return res.status(500).json({'error': 'cannot add Commande'});
      })
});
// **** fin de traitement des commandes ****************************************************************

//********************** requette de récupération du drnier shift ************************** */
// ***** annuler les dernières affectations déjà saisies ******************************************
async function recupeDernierAffectations() {
    await dbs.sequelize.query(' SELECT SUBSTRING(createdAt,1,10) dt,numShift FROM commandeffectifs ' +
    ' ORDER BY createdAt DESC, numShift DESC LIMIT 1 ', { type: dbs.sequelize.QueryTypes.SELECT })
    .then( async (value) => {
        sh = value[0].numShift;
        await dbs.sequelize.query(` DELETE FROM effectifcommandes ec WHERE ec.commandeId IN ( ` +
        ` SELECT ce.id FROM commandeffectifs ce ` +
        ` WHERE SUBSTRING(ce.createdAt,1,10) = (SELECT SUBSTRING(createdAt,1,10) FROM commandeffectifs group by SUBSTRING(createdAt,1,10) ` +
        ` ORDER BY createdAt DESC LIMIT 1) AND ce.numShift = ${sh}) `, { type: dbs.sequelize.QueryTypes.SELECT })
    })
    .catch(function(err) {
        console.log('catch error', err);
        return [];
    })
}

// ***** annuler les dernières commandes déjà saisies ******************************************
async function recupeDernierCommandes() {
    await dbs.sequelize.query(' SELECT SUBSTRING(createdAt,1,10) dt,numShift FROM commandeffectifs ' +
    ' ORDER BY createdAt DESC, numShift DESC LIMIT 1 ', { type: dbs.sequelize.QueryTypes.SELECT })
    .then( async (value) => {
        sh = value[0].numShift;
        await dbs.sequelize.query(` DELETE FROM commandeffectifs WHERE SUBSTRING(createdAt,1,10) = ` + 
        ` (SELECT t.dt FROM (SELECT SUBSTRING(createdAt,1,10) dt FROM commandeffectifs GROUP BY SUBSTRING(createdAt,1,10) ORDER BY createdAt DESC LIMIT 1) AS t) ` + 
        ` AND numShift = ${sh} `,{ TYPE: dbs.sequelize.QueryTypes.SELECT })
    })
    .catch(function(err) {
        console.log('catch error', err);
        return [];
    })
}

// *******************************************************************************************
// ***** récupération des affectations déjà saisies ******************************************
 async function recupeData() {
    let tabDataG = [];
    await dbs.sequelize.query(' SELECT ce.id,es.poste_quai AS CODE,SUBSTRING(n.nom_navire,1,30) navire,ce.matce,ce.numEquipe, ' +
            ` CASE ce.numShift WHEN 1 THEN 'MATIN' WHEN 2 THEN 'SOIR' WHEN 3 THEN 'NUIT' WHEN 4 THEN 'DOUBLE NUIT' ELSE 'MATIN' END AS shift ` +
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
                            ' GROUP BY ce.id ' +
            ' ORDER BY es.poste_quai,ce.numEquipe ', { type: dbs.sequelize.QueryTypes.SELECT })   //  WHERE ce.id = ${nvcid}
    .then( (value) => {
        tabDataG = value;
        // console.log('111 tabg->', tabDataG);
        // return tabDataG;
    })
    .catch(function(err) {
        console.log('catch error', err);
        return [];
    })
    return tabDataG;
}

async function recupeDataTabe(t) {
        tabg = t;
        console.log(tabg);
        let tabe = [];
        await dbs.sequelize.query(' SELECT ec.commandeId,ec.matce,ef.matricule_pointage AS matp,ef.clep AS cle,ef.matricule_agent AS mat,  ef.nom_agent AS nom, ' +
        ' ef.prenom_agent AS prenom,ef.code_fonction AS codef,SUBSTRING(f.desi_fonction,1,40) AS fonction ' +
        ' FROM effectifcommandes ec LEFT JOIN effectifs ef ON ec.matp = ef.matricule_pointage AND ef.clep =1 ' +
        ' LEFT JOIN fonctions f ON ef.code_fonction = f.code_fonction ' +
        ' WHERE ec.commandeId  ' +
        ' IN (SELECT ce.id ' +
                    ' FROM commandeffectifs ce ' +
                    ' WHERE SUBSTRING(ce.createdAt,1,10) = (SELECT SUBSTRING(cde.createdAt,1,10) dateCDE ' +
                    ' FROM commandeffectifs cde ' +
                    ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                    ' LIMIT 1) AND  ' +
            ' ce.numShift = (SELECT cde.numShift ' +
                    ' FROM commandeffectifs cde ' +
                    ' ORDER BY SUBSTRING(cde.createdAt,1,10) DESC,cde.numShift DESC ' +
                    ' LIMIT 1) ' +
        ' GROUP BY ce.id) ' , { type: dbs.sequelize.QueryTypes.SELECT })
        .then( (value) => {
        tabe = value;
        if (tabe == null) {
            // console.log('333 tabe== null->', tabe);
            return [];
        }
        tabe= value;
        // console.log('4444 tabe->', tabe);
    }).
    then((result) => {
    // console.log(tabe);
        typeEcran = 'Ecran1';

        let tabc = [
            {code:8, equipe:1,occupe:''},
            {code:8, equipe:2,occupe:''},
            {code:8, equipe:3,occupe:''},
            {code:10, equipe:1,occupe:''},
            {code:10, equipe:2,occupe:''},
            {code:10, equipe:3,occupe:''},
            {code:11, equipe:1,occupe:''},
            {code:11, equipe:2,occupe:''},
            {code:11, equipe:3,occupe:''},
            {code:12, equipe:1,occupe:''},
            {code:12, equipe:2,occupe:''},
            {code:12, equipe:3,occupe:''},
            {code:13, equipe:1,occupe:''},
            {code:13, equipe:2,occupe:''},
            {code:13, equipe:3,occupe:''}, 
            {code:14, equipe:1,occupe:''},
            {code:14, equipe:2,occupe:''},
            {code:14, equipe:3,occupe:''},
            {code:15, equipe:1,occupe:''},
            {code:15, equipe:2,occupe:''},
            {code:15, equipe:3,occupe:''}, 
            {code:16, equipe:1,occupe:''},
            {code:16, equipe:2,occupe:''},
            {code:16, equipe:3,occupe:''},
            {code:17, equipe:1,occupe:''},
            {code:17, equipe:2,occupe:''},
            {code:17, equipe:3,occupe:''}, 
            {code:18, equipe:1,occupe:''},
            {code:18, equipe:2,occupe:''},
            {code:18, equipe:3,occupe:''},
            {code:21, equipe:1,occupe:''},
            {code:21, equipe:2,occupe:''},
            {code:21, equipe:3,occupe:''}, 
            {code:22, equipe:1,occupe:''},
            {code:22, equipe:2,occupe:''},
            {code:22, equipe:3,occupe:''},
            {code:23, equipe:1,occupe:''},
            {code:23, equipe:2,occupe:''},
            {code:23, equipe:3,occupe:''}, 
            {code:24, equipe:1,occupe:''},
            {code:24, equipe:2,occupe:''},
            {code:24, equipe:3,occupe:''}
        ];    
        tab = [];
        k = 1;
        // console.log('------', tabc, '--------');
        for (let i=0; i<tabg.length; i++) {
        //tabg.forEach((element) => {
            nume = tabg[i].numEquipe; // element.numEquipe;     // numero de l'équipe
            nump = tabg[i].CODE; // element.code;
            for (let j=0; j<tabc.length; j++) {
                if (nume == tabc[j].equipe && nump == tabc[j].code) {
                    // console.log(nume, ' - ', tabc[j].equipe, ' ===== ', nump, '-', tabc[j].code );
                    ecran = 'Ecran'+String(k);
                    s = 0;
                    for (let l=0; l<tabc.length; l++) {
                        if (tabc[l].occupe == ecran)
                        {
                            s++;
                        }
                    }
                    if (s==3) {
                        k++;
                        s = 0;
                        ecran='Ecran'+String(k);
                    }
                    tabc[j].occupe = ecran;
                    break;
                }
            }
            let numEcran = 0;
            for (let j=0; j<tabc.length; j++) {
                if (nume == tabc[j].equipe && nump == tabc[j].code) {
                    numEcran = tabc[j].occupe;
                    // console.log('**********', numEcran, '**********');
                    break;
                }
            }
            // console.log('--------', numEcran);

            numCde =   String(tabg[i].id); // String(element.id);
            item = [];
            item.push(tabe.filter(elem => String(elem.commandeId).indexOf(numCde) !== -1));
            // console.log(item);
            let Obj1 = {
                id: tabg[i].id, // element.id,
                code: tabg[i].CODE, //element.code,
                navire: tabg[i].navire, //element.navire,
                matce: tabg[i].matce, //element.matce,
                numShift: tabg[i].numShift, //element.numShift,
                numEquipe: tabg[i].numEquipe, //element.numEquipe,
                shift: tabg[i].shift, //element.shift,
                ecran: numEcran,
                item: item[0]
            }
            // console.log('Obj1->' ,Obj1);
            tab.push(Obj1);
            
        } //)

    }).
    then(() => {
        // console.log('resultat->' , tab);
        return tab;
    })
    return tab;
}
// ****** fin de récupération des affectations déjà saisies***********************************

app.get('/', (_, res) => {
    res.send('Hello world');
  });

  // Route POST pour la réception des données
app.post('/postEndpoint/', (req, res) => {
    // Récupérer les données envoyées via la requête POST
    const postData = req.body;
  
    // Faire quelque chose avec les données reçues (par exemple, les afficher dans la console)
    console.log('Données reçues :', postData);
  
    // Répondre au client avec un message de confirmation
    res.send('Données reçues avec succès !');
  });

  
server = spdy.createServer(
    {
      key: fs.readFileSync(`${CERT_DIR}/server.key`),
      cert: fs.readFileSync(`${CERT_DIR}/server.cert`),
    },
    app
  );

const port = 5000; // process.env.port || 8082;

 // Launch server
 server.listen(port, function() {
     console.log('Server en écoute on port :', port); // console.log(process.env);
 });




function sse() {
        return (request, response, next) => {
            response.initStream = () => {
              // 
                response.writeHead(200, {
                    // Configuration des en-têtes SSE
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'text/event-stream',
                    'Connection': 'keep-alive'
                });
                response.flush();
                // response.setHeader('Content-Type', 'text/event-stream');
                // response.setHeader('Cache-Control', 'no-cache');
                // response.setHeader('Connection', 'keep-alive');                
                
                const intervalId = setInterval(() => {
                    response.write(':\n\n');
                    response.flush();
                    // response.flush();
                }, 30000);
                
                connexions.add(response);

                response.on('close', () => {
                clearInterval(intervalId);
                response.end();
                    connexions.delete(response);
                })
            }
            response.sendSSE = (data, eventName) => {
                // console.log('***********************');
                // console.log(data);
                // console.log('***********************');              
                let dataString = 
                `id: ${currentId}\n` +
                `data: ${JSON.stringify(data)}\n` + 
                (eventName ? `event: ${eventName}\n\n` : '\n');
                console.log('***********************');
                console.log(dataString);
                console.log('***********************');
                for(let connexion of connexions) {
                    connexion.write(dataString);
                    connexion.flush();
                }

                currentId++;
            }

            next();
        }
    }
