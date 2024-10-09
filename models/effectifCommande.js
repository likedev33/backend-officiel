'use strict';
module.exports = (sequelize, DataTypes) => {
    const EffectifCommande = sequelize.define("effectifcommandes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      commandeId: {
        type: DataTypes.INTEGER
      },
      matce: {
        type: DataTypes.INTEGER
      },
      matp: {
        type: DataTypes.INTEGER
      }
    });
    return EffectifCommande;
  };
  