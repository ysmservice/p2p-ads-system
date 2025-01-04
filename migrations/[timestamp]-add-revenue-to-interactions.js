module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('interactions', 'revenue', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        });

        // Update existing records with default values
        await queryInterface.sequelize.query(`
            UPDATE interactions 
            SET revenue = CASE 
                WHEN interactionType = 'click' THEN 0.50
                WHEN interactionType = 'view' THEN 0.10
                WHEN interactionType = 'video_complete' THEN 1.00
                ELSE 0.00
            END
        `);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('interactions', 'revenue');
    }
};
