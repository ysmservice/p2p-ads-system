const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const sequelize = new Sequelize(process.env.MARIADB_URI, {
    dialect: 'mariadb',
    logging: (msg) => logger.debug(msg)
});

// モデルの定義
const models = {
    Advertiser: require('./Advertiser')(sequelize, Sequelize.DataTypes),
    Publisher: require('./Publisher')(sequelize, Sequelize.DataTypes),
    Ad: require('./Ad')(sequelize, Sequelize.DataTypes),
    Interaction: require('./Interaction')(sequelize, Sequelize.DataTypes),
    Payment: require('./Payment')(sequelize, Sequelize.DataTypes),
};

// アソシエーションの定義
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
