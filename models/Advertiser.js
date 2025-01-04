module.exports = (sequelize, DataTypes) => {
    const Advertiser = sequelize.define('Advertiser', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true  // nameは登録時に必須としない
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: true,  // 登録時は必須としない
            defaultValue: 'paypal'
        },
        paymentDetails: {
            type: DataTypes.JSON,
            allowNull: true,   // 登録時は必須としない
            defaultValue: {}
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
