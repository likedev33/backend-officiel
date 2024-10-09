'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false
    }
    /*
    nom: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    adresse: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
    */
    // email: DataTypes.STRING,
    // username: DataTypes.STRING,
    // password: DataTypes.STRING,
    // nom: DataTypes.STRING,
    // adresse: DataTypes.STRING,
    // telephone: DataTypes.STRING,
    // isAdmin: DataTypes.INTEGER
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
