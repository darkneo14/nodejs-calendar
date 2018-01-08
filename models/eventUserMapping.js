var mongoose=require('mongoose');
var Schema=mongoose.Schema;


var EventUserMappingSchema = mongoose.Schema({
    user : String,
    event : String,
    date : Date,
    type : String
});

var EventUserMappingSchema = mongoose.model('EventUserMapping', EventUserMappingSchema);


module.exports = EventUserMappingSchema;