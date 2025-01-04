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
        revenue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'interactions',
        timestamps: false,
        hooks: {
            beforeCreate: (interaction) => {
                // Set revenue based on interaction type
                switch(interaction.interactionType) {
                    case 'click':
                        interaction.revenue = 0.50; // $0.50 per click
                        break;
                    case 'view':
                        interaction.revenue = 0.10; // $0.10 per view
                        break;
                    case 'video_complete':
                        interaction.revenue = 1.00; // $1.00 per complete video view
                        break;
                    default:
                        interaction.revenue = 0.00;
                }
            }
        }
    });

    Interaction.associate = (models) => {
        Interaction.belongsTo(models.Ad, { foreignKey: 'adId' });
        Interaction.belongsTo(models.Advertiser, { foreignKey: 'advertiserId' });
        Interaction.belongsTo(models.Publisher, { foreignKey: 'publisherId' });
    };

    return Interaction;
};
