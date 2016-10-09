var TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var fs = require('fs');
var MAX_SEND_DATA = 10;
var CamTelegramBot = function() {
	var options = {
		polling: true
	};
	var chats = [];
	var _rootId = [];
	var bot = null;
	var _motion = null;
	var _token = null;
	var config = null;
	var _warning_disabled = {};
	var handleEcho = _handleEcho;
	var handleSnap = _handleSnap;
	var handleVideo = _handleVideo;
	var auth = function(userId) {
		return _rootId.indexOf(userId) !== -1;
	};
	return {
		start: init_fn,
		sendMessageAll: sendMessageAll_fn,
		sendLastPhotosAll: sendLastPhotosAll_fn,
		sendLastPhotoAll: sendLastPhotoAll_fn,
		handleUpdates: handleUpdates_fn,
		bot: bot
	};

	function handleUpdates_fn() {
		// bot = init_bot();
		// bot.getUpdates(20, 1);
	}

	function getListInFile(path) {
		console.log('open file ' + path);
		var listInFile = [];
		try {
			var listInFileContent = fs.readFileSync(path).toString();
			listInFile = listInFileContent.split('\n');
			console.log(listInFileContent);
			listInFile = listInFile.filter(function(item) {
				return item !== '';
			});
			console.log(listInFile);
		} catch (e) {
			console.log(new Date() + ' > ' + path + ' ' + e);
		}
		return listInFile;
	}

	function sendLastPhotoAll_fn(source, photoName, is_warnable) {
		if (is_warnable === 'undefined') {
			is_warnable = false;
		}
		var img = photoName;
		chats.forEach(function(chatId) {
			if (!is_warnable || !_warning_disabled[chatId]) {
				try {
					if (fs.statSync(img).isFile()) {
						bot.sendMessage(chatId, 'send photo ' + img);
						bot.sendPhoto(chatId, img, {
							caption: 'Event gif from ' + source.name
						});
					} else {
						console.log(new Date() + ' <sendLastPhotoAll_fn> ' + img + ' not found');
					}
				} catch (err) {
					console.log(new Date() + ' <sendLastPhotoAll_fn> ' + img, err);
					bot.sendMessage(chatId, 'No photo ' + img);
				}

			}
		});
	}

	function sendLastDocAll_fn(source, photoName, caption, is_warnable) {
		if (is_warnable === 'undefined') {
			is_warnable = false;
		}
		var img = photoName;
		chats.forEach(function(chatId) {
			if (!is_warnable || !_warning_disabled[chatId]) {
				try {
					if (fs.statSync(img).isFile()) {
						bot.sendMessage(chatId, 'send doc ' + img);
						bot.sendDocument(chatId, img, {
							caption: caption
						});
					} else {
						console.log(new Date() + ' <sendLastDocAll_fn> ' + img + ' not found');
					}
				} catch (err) {
					console.log(new Date() + ' <sendLastDocAll_fn> ' + img, err);
					bot.sendMessage(chatId, 'No Doc ' + img);
				}

			}
		});
	}

	function sendLastPhotosAll_fn(source, is_warnable) {
		if (is_warnable === 'undefined') {
			is_warnable = false;
		}
		var photoListFile = source.path + source.last_detect;
		var photoList = getListInFile(photoListFile);

		var size = photoList.length;

		for (var i = 0; i < size && i < MAX_SEND_DATA; i++) {
			var img = photoList[i];
			console.log('serving ' + img);
			chats.forEach(__sendPhotoForChatId__(chatId));
		}


	}

	function __sendPhotoForChatId__(chatId) {
		if (!is_warnable || !_warning_disabled[chatId]) {
			try {
				if (fs.statSync(img).isFile()) {
					bot.sendMessage(chatId, 'send photo ' + img);
					bot.sendPhoto(chatId, img, {
						caption: 'SendAll from ' + source.name
					});
				} else {
					console.log(new Date() + ' <sendLastPhotosAll_fn> ' + img + ' not found');
				}
			} catch (err) {
				console.log(new Date() + ' <sendLastPhotosAll_fn> ' + img, err);
				bot.sendMessage(chatId, 'No photo ' + img);
			}

		}
	}

	function sendMessageAll_fn(msg_string, is_warnable) {
		if (is_warnable === 'undefined') {
			is_warnable = false;
		}
		if (!chats || !bot) {
			return;
		}

		chats.forEach(function(chatId) {
			if (!is_warnable || !_warning_disabled[chatId]) {
				bot.sendMessage(chatId, msg_string);
			}
		});

	}

	function sendDataAll_fn(msg_string) {
		if (!chats || !bot) {
			return;
		}
		chats.forEach(function(chatId) {
			bot.sendMessage(chatId, msg_string);
		});
	}

	function handleEnableWarning(msg) {
		console.log('------enable warning----------');
		var chatId = msg.chat.id;

		_warning_disabled[chatId] = false;
	}

	function _handleDisableWarning(msg) {
		console.log('------disable warning----------');
		var chatId = msg.chat.id;
		_warning_disabled[chatId] = true;
	}

	function _handleEcho(msg, match) {
		console.log('------echo----------');
		var chatId = msg.chat.id;
		var resp = match[1];
		bot.sendMessage(chatId, resp);
	}

	function _handleVideo(msg) {
		console.log('------video---------');
		var chatId = msg.chat.id;
		var userId = msg.from.id;

		if (!auth(userId)) {
			console.log('No auth for ' + chatId);
			return;
		}
		_motion.forEach(function(item) {
			var videoListFile = item.video_path + item.last_video;

			var videoList = getListInFile(videoListFile);
			// bot.sendMessage(chatId, videoListFile+' looking for video...'+videoList);

			var size = videoList.length;
			console.log("VideoList size " + size);
			if (size) {
				bot.sendMessage(chatId, size + ' video...' + videoList[0]);
				var video = videoList[0];
				bot.sendDocument(chatId, video, {
					caption: item.name
				});
				bot.sendMessage(chatId, 'end');
			}

		});
	}

	function _handleSnap(msg) {
		console.log('------snap----------');
		var chatId = msg.chat.id;
		var userId = msg.from.id;

		if (!auth(userId)) {
			console.log('No auth for ' + chatId);
			return;
		}

		_motion.forEach(function(item) {
			var img = item.path + item.snap_file;
			try {
				if (fs.statSync(img).isFile()) {
					bot.sendPhoto(chatId, img, {
						caption: item.name
					});
				} else {
					console.log(new Date() + ' <handleSnap> ' + img + ' not found');
				}
			} catch (err) {
				console.log(new Date() + ' <handleSnap> ' + img, err);
				bot.sendMessage(chatId, 'No photo ' + img);
			}

			// fs.stat(img, function(err, stat) {
			// 	if(err == null) {
			// 		bot.sendPhoto(chatId, img, {caption: item['name']});
			// 	} else {
			// 		console.log('Some error: ', err.code);
			// 		bot.sendMessage(chatId, 'No snap for '+ item['name']);
			// 	}
			// });

		});
	}

	function handleMotion(msg, match) {
		var option = match[0];
		var service_action = 'start';
		if (option === 'off') {
			service_action = 'stop';
		}
		var execution_script = config.working_dir + "/../script/motion_" + service_action + ".sh";
		exec(execution_script,
			function(error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
			});
	}

	function _handleSetdMail(msg, match) {
		console.log(msg, match);
		var option = match[0];
		__setMailNotificationStatus__(option == 'on');
	}

	function __setMailNotificationStatus__(status) {
		console.log('__setMailNotificationStatus__');
		_motion.forEach(function(item) {
			var host = item.host;
			var loginUrl = "http://" + host + "/login.fcgi";
			var setStatusUrl = "http://" + host + "/smtp_and_ftp_save.fcgi";
			//post login
			var login_data = item.credential;
			request.post(loginUrl,
				login_data,
				function(error, response, body) {
					console.log(response, error);
					if (!error && response.statusCode == 200) {
						console.log(body);
					}
				});
			

		});
		//get cookie & token
		//post set status
	}

	function init_bot() {
		console.log('Init bot');
		var _bot = new TelegramBot(_token, options);
		_bot.onText(/\/echo (.*)/, handleEcho);
		_bot.onText(/\/snap/, handleSnap);
		_bot.onText(/\/video/, handleVideo);
		_bot.onText(/\/enable/, handleEnableWarning);
		_bot.onText(/\/disable/, _handleDisableWarning);
		_bot.onText(/\/mail_cam (on|off)/, _handleSetdMail);
		_bot.onText(/\/motion (on|off)/, handleMotion);
		return _bot;
	}

	function init_fn(token, rootId, motion, handler, config) {
		_rootId = rootId;
		_motion = motion;
		_token = token;
		console.log(config);
		_rootId.forEach(function(item) {
			chats.push(item);
		});
		if (handler !== null && handler !== 'undefined') {
			for (var handle in handler) {
				if (this[handle.name]) {
					this[handle.name] = handle.fn;
				}
			}
		}
		bot = init_bot();
		bot.getMe().then(function(me) {
			console.log('Hi my name is %s!', me.username);
		});
		chats.forEach(function(chatId) {
			bot.sendMessage(chatId, 'Hi! :D');
		});

	}
};
module.exports = new CamTelegramBot();