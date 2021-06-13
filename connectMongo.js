const mongoose = require('mongoose');

const healthFoundationSchema = new mongoose.Schema({
    assistantProgramName: {
        type: String,
        required: true,
        unique : true
    },
    status: {
        type: String,
        required: true
    },
    treatmentList: {
        type: String,
        required: true
    },
    grantAmount: {
        type: String,
        required: true
    }
});

const Programs = mongoose.model('Programs', healthFoundationSchema);

module.exports = Programs;