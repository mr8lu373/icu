
var httpserver  = require('./server/httpserver.js');
var HomeTelegramBot  = require('./bot/telegramBot.js');
var moment = require('moment');
var lastEventTimestamp = moment();
var WARNABLE = true;
var config = require('./config.js');
console.log("Start......");
console.log(config);
//Configure and start telegrambot 
console.log("Start bot......");
var token = config['telegram']['token'];
var roots =  config['telegram']['root_credentials'];
var motion_th = config['motion_th'].filter(function(value){return value.enabled});

config.working_dir = __dirname;

var bot = HomeTelegramBot.start(token, roots, motion_th, null, config);

var logdEvent = function(req, res){
	console.log('req:',req);
	return 'Ok bella per te!';
}

var logEndEvent = function(req, res){
	
	if(HomeTelegramBot){
		console.log(req.url);
		parsedUrl=require('url').parse(req.url, true);
		var eventId = '';
		var sourceName = '';
		var thisEvent = moment();
		if(parsedUrl['query'] && parsedUrl['query']['source'] && parsedUrl['query']['motionGif']){
			if(parsedUrl['query']['eventId']){
				eventId = parsedUrl['query']['eventId']; 
			}
			sourceName = parsedUrl['query']['source'];
			motionGif = parsedUrl['query']['motionGif'];
			HomeTelegramBot.sendMessageAll(new Date()+'Event end on '+sourceName+' eventId '+eventId, WARNABLE);
			motion_th.forEach(function(item){
				if(item['id'] === sourceName ){
					HomeTelegramBot.sendLastPhotoAll(item, motionGif, WARNABLE);
				}
			});
		} 
	}
	return 'Ok bella per te!';
}

var motionEvent = function (req, res){
	console.log(req.url);
	parsedUrl=require('url').parse(req.url, true);
	var eventId = '';
	var sourceName = '';
	var thisEvent = moment();
	if(thisEvent.unix() - lastEventTimestamp.unix() < 30){
		return;
	}
	lastEventTimestamp = thisEvent;

	if(parsedUrl['query'] && parsedUrl['query']['source']){
		if(parsedUrl['query']['eventId']){
			eventId = parsedUrl['query']['eventId']; 
		}
		sourceName = parsedUrl['query']['source'];

		HomeTelegramBot.sendMessageAll(new Date()+'motion detected on '+sourceName+' eventId '+eventId, WARNABLE);
		motion_th.forEach(function(item){
			if(item['id'] === sourceName){
				HomeTelegramBot.sendLastPhotosAll(item, WARNABLE);
			}
		});
	} 
	else {
		HomeTelegramBot.sendMessageAll(new Date()+'motion detected on... ');
	}
	
	
	return "Thank You!"
}
var shutDownEvent = function (req, res){
	console.log(req.url);
	if(bot){
		HomeTelegramBot.sendMessageAll(new Date()+'GoodBye cruel world.... ');
	}
	return 'GoodBye';
}
// Configure and start http server
console.log("Start server......");
httpserver.manage('/end_event', logEndEvent);
httpserver.manage('/event', logdEvent);
// httpserver.manage('/add_video', logEvent);
httpserver.manage('/motion', motionEvent);
httpserver.manage('/shutdown', shutDownEvent);
httpserver.start(config['server']['port']);



