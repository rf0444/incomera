navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
$(function() {
	var videoRowEl = $(".video-row");
	var videoEl = $("video.rec");
	var cameraSelectRowEl = $(".camera-select-row");
	var cameraSelectEl = $(".camera-select");
	var connectButtonEl = $(".connect");
	navigator.mediaDevices.enumerateDevices().then(function(ds) {
		var vs = ds.filter(function(d) { return d.kind == "videoinput"; });
		cameraSelectEl.empty()
			.append(
				vs.map(function(v) {
					return $("<option></option>").val(v.deviceId).text(v.label);
				})
			)
		;
	});
	var streamP = new Promise(function(resolve, reject) {
		connectButtonEl.on("click", function() {
			var deviceId = cameraSelectEl.val();
			if (!deviceId) {
				alert("使うカメラを選んでくれ。");
			} else {
				var opt = {
					video: {
						optional: [
							{ sourceId: deviceId }
						]
					},
					audio: true
				};
				navigator.getUserMedia(opt, resolve, reject);
			}
		});
	})
	streamP.then(function(stream) {
		cameraSelectRowEl.remove();
		videoRowEl.show();
		var url = window.URL.createObjectURL(stream);
		videoEl.each(function(i, dom) {
			dom.src = url;
			dom.play();
		});
	});
	streamP.then(function(stream) {
		var cons = {};
		var wsUrl = "ws" + location.protocol.substring(4) + "//" + location.hostname + "/camera"
		var ws = new WebSocket(wsUrl);
		ws.addEventListener("message", function(e) {
			var data = JSON.parse(e.data);
			console.log(data);
			switch (data.type) {
				case "request":
					var con = new RTCPeerConnection({ "iceServers": [] });
					con.addStream(stream);
					con.addEventListener("icecandidate", function (e) {
						if (!e.candidate) {
							var sdp = con.localDescription.sdp;
							ws.send(JSON.stringify({ type: "offer", sdp: sdp, to: data.from }));
						}
					});
					con.createOffer(function(desc) {
						con.setLocalDescription(desc, function() {}, function() {});
					}, function() {});
					cons[data.from] = con;
					break;
				case "answer":
					var answer = new RTCSessionDescription({ type: "answer", sdp: data.sdp });
					cons[data.from].setRemoteDescription(answer, function() {}, function() {});
					break;
				default:
					break;
			}
		});
		window.cons = cons;
	});
	$("button.fullscreen").on("click", function() {
		var el = videoEl.get(0);
		var request = el.requestFullScreen || el.mozRequestFullScreen || el.webkitRequestFullScreen;
		request.bind(el)();
	});
});
