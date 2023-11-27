const mongoose = require('mongoose');
const {Schema} = mongoose;

const AccommodationRulesSchema = new Schema({
    image:{
        type: String,
    }
})

const AccommodationRulesMOdel = mongoose.model('AccommodationRules', AccommodationRulesSchema);
module.exports = AccommodationRulesMOdel;