module.exports = (sequelize, DataTypes) => {
    const Interaction = sequelize.define('Interaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        adId: {
            type: DataTypes.UUID,
            allowNull: false,
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
        interactionType: {
            type: DataTypes.ENUM('click', 'video_view'),
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'interactions',
        timestamps: false
    });

    Interaction.associate = (models) => {
        Interaction.belongsTo(models.Ad, { foreignKey: 'adId' });
        Interaction.belongsTo(models.Publisher, { foreignKey: 'publisherId' });
    };

    return Interaction;
};
