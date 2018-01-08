var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var EventSchema = mongoose.Schema({
    user : String,
    title : String,
    date : Date,
    color : String,
    category : String,
    availability : String,
    timeType :  String,
    startTime: Number,
    endTime : Number,
    note : String,
    type: String
});


var Event = mongoose.model('Event', EventSchema);


module.exports = Event;