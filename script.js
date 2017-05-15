var caller = document.getElementById('caller'),
    loader = document.getElementById('loader'),
	anwserCall = document.getElementById('anwserCall');
function getQueryStringParam(param) {
  var url = window.location.toString();
	  url.match(/\?(.+)$/);
 
 var params = RegExp.$1;
	  params = params.split("&");

 var queryStringList = {};

 for(var i = 0; i < params.length; i++) {

	var tmp = params[i].split("=");
    queryStringList[tmp[0]] = unescape(tmp[1]);
  
  }
  
  return queryStringList[param];
}
function myFunction() {
	if (getQueryStringParam("roomid") && getQueryStringParam("roomid") != "undefined") {
		setTimeout(function(){ 
			loader.style.display = 'none';          
			anwserCall.style.display = 'block';  
		}, 3000);

	}
	else{
		setTimeout(function(){ 
			loader.style.display = 'none';          
			caller.style.display = 'block';  
	}, 3000);
  }
}

			// ......................................................
            // .......................UI Code........................
            // ......................................................
			
			
			
            document.getElementById('open-room').onclick = function() {
                connection.open(document.getElementById('room-id').value, function() {
                    showRoomURL(connection.sessionid);
                });
            };
            // ......................................................
            // ..................RTCMultiConnection Code.............
            // ......................................................
            var connection = new RTCMultiConnection();
			
			// Using getScreenId.js to capture screen from any domain
            // You do NOT need to deploy Chrome Extension YOUR-Self!!
            connection.getScreenConstraints = function(callback) {
                getScreenConstraints(function(error, screen_constraints) {
                    if (!error) {
                        screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                        callback(error, screen_constraints);
                        return;
                    }
                    throw error;
                });
            };
			
			
            // by default, socket.io server is assumed to be deployed on your own URL
            connection.socketURL = '/';
            // comment-out below line if you do not have your own socket.io server
            // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
			
            connection.socketMessageEvent = 'video-conference-demo';
			
            connection.session = {
                audio: true,
                video: true
            };
			
            connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            };
			
            connection.videosContainer = document.getElementById('videos-container');
			
			
			
            connection.onstream = function(event) {
			    
				if(document.getElementById(event.streamid)) {
                    var existing = document.getElementById(event.streamid);
                    existing.parentNode.removeChild(existing);
                }
				
                var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
				
                if(event.stream.isScreen === true) {
                    width = connection.videosContainer.clientWidth - 20;
                }
				
				var mediaElement = getMediaElement(event.mediaElement, {
                    title: event.userid,
                    buttons: ['mute-audio', 'mute-video','full-screen','stop'],
                    width: width,
                    showOnMouseEnter: false
                });
                connection.videosContainer.appendChild(mediaElement);
				
				
				
				
                setTimeout(function() {
                    mediaElement.media.play();
                }, 5000);
				
                mediaElement.id = event.streamid;
				
				
				//TODO
				
				if(event.type == 'local'){
			     	mediaElement.classList.add("small-video");
				}else{
					mediaElement.classList.add("full-video");
				}
            };
            connection.onstreamended = function(event) {
                var mediaElement = document.getElementById(event.streamid);
                if(mediaElement) {
                    mediaElement.parentNode.removeChild(mediaElement);
                }
            };
            
            // ......................................................
            // ......................Handling Room-ID................
            // ......................................................
            function showRoomURL(roomid) {
                var roomHashURL = '#' + roomid;
                var roomQueryStringURL = '?roomid=' + roomid;
                
            }
            (function() {
                var params = {},
                    r = /([^&=]+)=?([^&]*)/g;
                function d(s) {
                    return decodeURIComponent(s.replace(/\+/g, ' '));
                }
                var match, search = window.location.search;
                while (match = r.exec(search.substring(1)))
                    params[d(match[1])] = d(match[2]);
                window.params = params;
            })();
            var roomid = '';
            if (localStorage.getItem(connection.socketMessageEvent)) {
                roomid = localStorage.getItem(connection.socketMessageEvent);
            } else {
                roomid = connection.token();
            }
            document.getElementById('room-id').value = roomid;
            document.getElementById('room-id').onkeyup = function() {
                localStorage.setItem(connection.socketMessageEvent, this.value);
            };
            var hashString = location.hash.replace('#', '');
            if(hashString.length && hashString.indexOf('comment-') == 0) {
              hashString = '';
            }
            var roomid = params.roomid;
            if(!roomid && hashString.length) {
                roomid = hashString;
            }
            if(roomid && roomid.length) {
                document.getElementById('room-id').value = roomid;
                localStorage.setItem(connection.socketMessageEvent, roomid);
                // auto-join-room
                (function reCheckRoomPresence() {
                    connection.checkPresence(roomid, function(isRoomExists) {
                        if(isRoomExists) {
                            connection.join(roomid);
                            return;
                        }
                        setTimeout(reCheckRoomPresence, 5000);
                    });
                })();
                disableInputButtons();
            }
            // to make it one-to-one
            connection.maxParticipantsAllowed = 1;
            connection.onRoomFull = function(roomid) {
              connection.closeSocket();
              connection.attachStreams.forEach(function(stream) {
                stream.stop();
              });
            };