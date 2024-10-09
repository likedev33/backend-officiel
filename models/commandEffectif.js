'use strict';
module.exports = (sequelize, DataTypes) => {
    const commandEffectifs = sequelize.define("commandeffectif", {
    //   id: {
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     primaryKey: true
    //   },
      numEscale: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      navire: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      numEquipe: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },   
      matce: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      numShift: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    });
    return commandEffectifs;
  };