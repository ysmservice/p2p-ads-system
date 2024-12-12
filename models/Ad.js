module.exports = (sequelize, DataTypes) => {
    const Ad = sequelize.define('Ad', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('image', 'vast', 'vpaid'),
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false
        },
        advertiserId: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        tableName: 'ads',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: false
    });

    Ad.associate = (models) => {
        Ad.belongsTo(models.Advertiser, { foreignKey: 'advertiserId' });
        Ad.hasMany(models.Interaction, { foreignKey: 'adId' });
    };

    return Ad;
};
