var http = require('http');
var dispatcher = require('httpdispatcher');
var server = null;
//Lets use our dispatcher
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}
var ManagerHttpServer = function(){
	var inner_server = {
		start: function(port){
			server = http.createServer(handleRequest);
			server.listen(port, function(){
				 console.log("Server listening on: http://localhost:%s", port);
			});
		},
		manage: function(url, cb){
			dispatcher.onGet(url, function(req, res){
				var result = cb(req);
				res.writeHead(200, {'Content-Type': 'text/plain'});
	    		res.end(result);
			});
		}
	};
	return inner_server;
};
module.exports = new ManagerHttpServer();