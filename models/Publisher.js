module.exports = (sequelize, DataTypes) => {
    const Publisher = sequelize.define('Publisher', {
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
