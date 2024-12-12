module.exports = (sequelize, DataTypes) => {
    const Advertiser = sequelize.define('Advertiser', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'paypal'
        },
        paymentDetails: {
            type: DataTypes.JSON,
            allowNull: false
        }
    }, {
        tableName: 'advertisers',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: false
    });

    Advertiser.associate = (models) => {
        Advertiser.hasMany(models.Ad, { foreignKey: 'advertiserId' });
        Advertiser.hasMany(models.Payment, { foreignKey: 'advertiserId' });
    };

    return Advertiser;
};
