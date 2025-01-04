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
        advertiserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'advertisers',
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
            type: DataTypes.ENUM('click', 'video_view', 'video_complete', 'video_mute', 'video_pause', 'video_unmute', 'video_fullscreen', 'video_expand', 'video_collapse', 'view'),
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
        Interaction.belongsTo(models.Advertiser, { foreignKey: 'advertiserId' });
        Interaction.belongsTo(models.Publisher, { foreignKey: 'publisherId' });
    };

    return Interaction;
};
