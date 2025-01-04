module.exports = (sequelize, DataTypes) => {
    const Publisher = sequelize.define('Publisher', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
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
            allowNull: false,
            validate: {
                notEmpty: true,  // 空文字を許可しない
                len: [6, 100]    // 最小6文字、最大100文字
            }
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'paypal'
        },
        paymentDetails: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        }
    }, {
        tableName: 'publishers',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: false
    });

    Publisher.associate = (models) => {
        Publisher.hasMany(models.Payment, { foreignKey: 'publisherId' });
    };

    return Publisher;
};
