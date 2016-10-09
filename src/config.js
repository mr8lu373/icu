var config = {
	"telegram":{
		"token": "",
		"root_credentials": []
	},
	
	"motion_th":[{
		"id": "xxx",
		"name": "name",
		"path": "motion path",
		"last_detect": "last_detect.txt",
		"snap_file": "lastsnap.jpg",
		"video_path": "/var/lib/motion/th1/",
		"last_video": "last_video.txt",
		"enabled": true,
		"credential":{
			"Username": "user",
			"Password": "password"
		}
	}],

	
	"server":{
		"port": 10099
	}
};

module.exports = config;