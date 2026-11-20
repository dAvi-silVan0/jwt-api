const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Loan = db.define('Loan', {
    loanDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ATIVO', 'DEVOLVIDO', 'ATRASADO'),
        allowNull: false,
        defaultValue: 'ATIVO'
    },
    fine: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Loan;