module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        adType: {
            type: DataTypes.ENUM('image', 'vast', 'vpaid', 'bulk'),
            allowNull: false
        },
        adId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'ads',
                key: 'id'
            }
        },
        publisherId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'publishers',
                key: 'id'
            }
        },
        advertiserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'advertisers',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD'
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed'),
            allowNull: false,
            defaultValue: 'pending'
        },
        paypalTransactionId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'payments',
        timestamps: false
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Advertiser, { foreignKey: 'advertiserId' });
        Payment.belongsTo(models.Publisher, { foreignKey: 'publisherId' });
        Payment.belongsTo(models.Ad, { foreignKey: 'adId' });
    };

    return Payment;
};
