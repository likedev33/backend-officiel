'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
const db = {};

/* mise en commentaire le 17/07/2020
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
*/ 

// ajoutté le 17/07/2020
require('dotenv').config();
let sequelize = new Sequelize(
  'logimac_bd', // process.env.DB_NAME, // || 'gestmedic', 	// 'uqfx2551_gestmedic',
  'arezki', // process.env.DB_USER, // || 'root', 		// 'uqfx2551_arezki',
  process.env.DB_PASS, // || 'bial3717',	// 'b3ZXqfJlEWxNfjdh2m',
  {
      host:"localhost",
      dialect: "mysql",
      port:3306,
      operatorsAliases: false
  }
);
// let sequelize = new Sequelize(config.database, config.username, config.password, {host: config.host, dialect: config.dialect, operatorsAliases: false });
console.log(process.env.DB_NAME +' -- ' + process.env.DB_USER +' -- ' +  process.env.DB_PASS);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // const model = sequelize['import'](path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
     db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


// Models/tables
const User   = require('../models/user.js')(sequelize, Sequelize);
const Role   = require('../models/role.js')(sequelize, Sequelize);
const UserRole   = require('../models/userRole.js')(sequelize, Sequelize);
const commandEffectifs   = require('../models/commandEffectif.js')(sequelize, Sequelize);
const EffectifCommande   = require('../models/effectifCommande.js')(sequelize, Sequelize);

Role.belongsToMany(User, {
  through: "user_roles"
});
User.belongsToMany(Role, {
  through: "user_roles"
});
db.ROLES = ["user", "admin", "moderator"];
/*
const Medicament    = require('../models/med_medicament.js')(sequelize, Sequelize);
const Presentation  = require('../models/med_presentation.js')(sequelize, Sequelize);
const Composition   = require('../models/med_composition.js')(sequelize, Sequelize);

const Patient   = require('../models/patient.js')(sequelize, Sequelize);
const Ordonance   = require('../models/med_ordonance.js')(sequelize, Sequelize);
const Notices   = require('../models/med_notices.js')(sequelize, Sequelize);
const Noticesavantutilisations = require('../models/med_noticesavantutilisations.js')(sequelize, Sequelize);
const Noticesconcervation  = require('../models/med_noticesconcervation.js')(sequelize, Sequelize);
const Noticesdefinitions   = require('../models/med_noticesdefinitions.js')(sequelize, Sequelize);
const Noticeseffetsindesirables = require('../models/med_noticeseffetsindesirables.js')(sequelize, Sequelize);
const Noticesemballages = require('../models/med_noticesemballages.js')(sequelize, Sequelize);
const Noticesutilisations = require('../models/med_noticesutilisations.js')(sequelize, Sequelize);

const Rcp   = require('../models/med_rcp.js')(sequelize, Sequelize);
const LignesOrdonance   = require('../models/med_lignesordonance.js')(sequelize, Sequelize);

const VoieAdmin_Med   = require('../models/med_voieadmin_medicament.js')(sequelize, Sequelize);
const VoieAdmin   = require('../models/med_voieadministration.js')(sequelize, Sequelize);

const Pathologie_Med   = require('./med_pathologies_medicament.js')(sequelize, Sequelize);
const Pathologie   = require('../models/med_pathologie.js')(sequelize, Sequelize);

const Rdv   = require('../models/rdv.js')(sequelize, Sequelize);

const allergiesAlimentaires   = require('../models/allergiesalimentaires.js')(sequelize, Sequelize);
const etatPhysiologiques   = require('../models/etatphysiologiques.js')(sequelize, Sequelize);
const vaccins   = require('../models/vaccins.js')(sequelize, Sequelize);
const biometrie   = require('../models/biometrie.js')(sequelize, Sequelize);
const antfamille   = require('../models/antfamille.js')(sequelize, Sequelize);
const antpersonnel   = require('../models/antpersonnel.js')(sequelize, Sequelize);
// Relations
Presentation.belongsTo(Medicament, {foreignKey: 'code_cis'});
Medicament.hasMany(Presentation, {foreignKey: 'code_cis'});

Composition.belongsTo(Medicament,{foreignKey: 'code_cis'});
Medicament.hasMany(Composition, {foreignKey: 'code_cis'});

LignesOrdonance.belongsTo(Ordonance,{foreignKey: 'ordonanceId'});
Ordonance.hasMany(LignesOrdonance, {foreignKey: 'ordonanceId'});

// Pathologie.hasMany(Ordonance, { foreignKey: "id" }); // pathologieId
// Ordonance.belongsTo(Pathologie, { foreignKey: "id" }); // pathologieId

Rdv.belongsTo(Patient, {foreignKey: 'patientId'});
Patient.hasMany(Rdv, {foreignKey: 'patientId'});

//VoieAdmin_Med.belongsTo(Medicament,{foreignKey: 'code_cis'});
//Medicament.hasMany(VoieAdmin_Med, {foreignKey: 'code_cis'});

// VoieAdmin_Med.belongsTo(VoieAdmin, {foreignKey: 'id_voie'});
// VoieAdmin.hasMany(VoieAdmin_Med, {foreignKey: 'id_voie'});

Pathologie.belongsToMany(Medicament, {
   through: Pathologie_Med, foreignKey:'pathologie_id' })
Medicament.belongsToMany(Pathologie, {
    through: Pathologie_Med, foreignKey:'code_cis' });

VoieAdmin.belongsToMany(Medicament, {
  through: 'med_voieadmin_medicaments', foreignKey:'id_voie' });
Medicament.belongsToMany(VoieAdmin, {
  through: 'med_voieadmin_medicaments', foreignKey:'code_cis' });
*/
module.exports = {
  User,
  Role,
  UserRole,
  commandEffectifs,
  EffectifCommande,
/*
  Medicament,
  Presentation,
  Composition,
  Patient,
  VoieAdmin_Med,
  VoieAdmin,
  Pathologie,
  Pathologie_Med,
  Ordonance,
  Notices,
  Noticesavantutilisations,
  Noticesconcervation,
  Noticesdefinitions,
  Noticeseffetsindesirables,
  Noticesemballages,
  Noticesutilisations, 
  Rcp,
  Rdv,
  LignesOrdonance,
  allergiesAlimentaires,
  etatPhysiologiques,
  vaccins,
  biometrie,
  antfamille,
  antpersonnel,
  */
  db
};
