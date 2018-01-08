var nodemailer = require('nodemailer'); // npm package to send mails
var busboy = require('connect-busboy');
var fs = require('fs');
var config = require('../config')
var Event = require('../models/event')
var EventUserMapping = require('../models/eventUserMapping');
var countGlobal = 0;


function performCheck(event, participants, res, callback, repeatData){
	EventUserMapping.find({user: { $in: participants}, date: event.date, type: "busy"}, function(err, eventUserMap) {
		console.log(eventUserMap);
		if(err){
			// res.json()
			returnResponse(res, {message: "Some Error Occured!! Please try again", success: false});
		}
		if(eventUserMap && eventUserMap.length > 0){
			var cnt =0;
			eventUserMap.forEach(function(value) {
				Event.findOne({_id : value.event}, function(err, mappedEvent) {
					console.log(mappedEvent);
					cnt++;
					console.log(cnt);
					if(mappedEvent){
						if((event.startTime >= mappedEvent.startTime && event.startTime <= mappedEvent.endTime ) 
							|| (event.endTime >= mappedEvent.startTime && event.endTime <= mappedEvent.endTime )
							|| (event.startTime <= mappedEvent.startTime && event.endTime >= mappedEvent.endTime) ){
							cnt = -1;
							// res.json()
							// return "here";
							returnResponse(res,{message: "Event cannot be added!! participant "+ value.user+" is busy in the time slot", success: false});
							// process.exit();
						}
					}
					if(cnt == eventUserMap.length){
						console.log("callback");
						callback(event,participants,res,repeatData);
					}
				})
			})
		}
		else{
			console.log("in else");
			callback(event,participants,res,repeatData);
		}
	})
}

function saveData(event, participants, res, repeatData){
	console.log("in saveData");
	event.save(function(err, addedEvent) {
			// console.log("hereerer");
			if(err){
				console.log("error",err);
				// res.json()
				returnResponse(res,{message: "Some Error Occured!! Please try again", success: false});
			}
			var count = 0;
			for(i =0; i <= repeatData.times; i++){
				dateToSet = new Date(event.date);
				dateToSet.setDate(dateToSet.getDate() + i*repeatData.duration) 
				console.log(dateToSet,i*repeatData.duration);
				participants.forEach(function(participant){					
					var eventUserMap = new EventUserMapping();
					eventUserMap.user = participant;
					eventUserMap.event = event._id;
					eventUserMap.date = dateToSet;
					eventUserMap.type = event.type;
					eventUserMap.save(function(err){
						console.log("saving");
						count++;
						if(err){		
							console.log(err);				
						}
						if(i==0){
							var transporter = nodemailer.createTransport({
								service: "Gmail",
								auth: {
									user: "email",
									pass: "pass"
								}
							});

							var mailOptions = {
								from: 'Google Calendar',
								to: participant,
								subject: 'Event Added',
								text: addedEvent,
								html: addedEvent
							};

							// Sending the emails
							transporter.sendMail(mailOptions, function(error, info){
								if (error) {
									console.log(error);
									console.log("eerror whle sending mail to "+ participant)
								}
								console.log('Message sent: '+addedEvent);
							});
						}
						if(count == ((repeatData.times+1)*participants.length)){
							console.log("returning");
							returnResponse(res, {message: "Created successfully", success: true});
						}

					});
		
				})
				
			}
			// res.json();
			
		})
}

function returnResponse(res,data){
	countGlobal ++;
	if(countGlobal == 1){
		console.log("returning Data");
		res.json(data);
	}
}

module.exports = {

	createEvent : function(req, res, next) {
		countGlobal = 0;
		var event = new Event();
		event.timeType = req.body.timeType;
		event.title = req.body.title;
		event.color = req.body.color;
		event.note = req.body.note;
		event.category = req.body.category;
		event.startTime = req.body.startTime;
		event.endTime = req.body.endTime;
		event.type = req.body.type;
		event.date = new Date(req.body.date); 

		var repeatData = {};
		repeatData.times = req.body.repeatTimes || 0;
		repeatData.duration = req.body.repeatDuration || 1;
		var error = false;
		if(repeatData.times > 10){
			error = true;
			returnResponse(res,{message: "Repeat Count is too Much!! Max allowed limit is 10.", success: false});
		}
		if(event.type == "busy" && event.timeType == "allDay"){
			error = true;
			returnResponse(res,{message: "All Day event can not have availability as Busy", success: false});
		}
		event.user = req.decoded.email;
		var participants = req.body.participants || [];
		participants.push(event.user);
		console.log(participants,event);
		if(event.timeType == "time" && !error){
			console.log("inside If");
			performCheck(event, participants, res, saveData, repeatData);
		} else if(!error){
			saveData(event, participants, res, repeatData);
		}
		
	},

	viewEvents : function(req, res, next){
		var email = req.decoded.email;
		var curDate = new Date();
		curDate.setDate(curDate.getDate()-1);
		console.log(email,curDate);
		EventUserMapping.find({user: email, date: {$gt: curDate}}).limit(10).exec(function(err, eventUserMap){
			console.log(eventUserMap);
			if(err){
				res.json({message: "Some Error Occured!! Please try again", success: false});
			}
			if(eventUserMap && eventUserMap.length >0 ){
				var count = 0;
				var data = [];
				var errs = 0;
				eventUserMap.forEach(function(eventUser) {
					console.log(eventUser);
					Event.findOne({_id: eventUser.event}, function(err, event) {
						count++;
						if(err || !event){
							// errs =1;
							console.log(err);
						}else{
							event.date = eventUser.date;
							console.log(event)
							data.push(event);
							
						}
						if(count == eventUserMap.length && errs == 0){
							res.json({message: "Data fetched",data: data, success: true});
						}
					})
					
				})			
			} else{
				res.json({message: "Data fetched",data: [], success: true});
			}
		})

	},

	searchEvents : function(req, res, next) {
		var email = req.decoded.email;
		var toMatch = req.query.toMatch;
		console.log(toMatch);
		var curDate = new Date();
		curDate.setDate(curDate.getDate()-1);
		EventUserMapping.find({user: email, date: {$gt: curDate}}).sort({date: -1}).limit(10).exec(function(err, eventUserMap){
			if(err){
				res.json({message: "Some Error Occured!! Please try again", success: false});
			}
			if(eventUserMap && eventUserMap.length >0 ){
				var count = 0;
				var data = [];
				var errs = 0;
				eventUserMap.forEach(function(eventUser) {
					Event.findOne({_id: eventUser.event}, function(err, event) {
						count++;
						if(err || !event){
							// errs =1;
							console.log(err);
						}else{
							if(event.title == toMatch || event.note == toMatch){
								event.date = eventUser.date;
								data.push(event);
							}
							
						}
						if(count == eventUserMap.length && errs == 0){
							res.json({message: "Data fetched",data: data, success: true});
						}
					})
					
				})
			} else{
				res.json({message: "Data fetched",data: [], success: true});
			}			
		})
	}

}