'use strict';
module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define("user_roles", {
      roleid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      }
    });
    return UserRole;
  };
  