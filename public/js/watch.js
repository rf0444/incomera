navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
$(function() {
	var videoEl = $("video.watch");
	var cid = location.search.substring(1);
	var cons = {};
	var wsUrl = "ws" + location.protocol.substring(4) + "//" + location.hostname + "/watches/" + cid + "/socket"
	var ws = new WebSocket(wsUrl);
	ws.addEventListener("message", function(e) {
		var data = JSON.parse(e.data);
		switch (data.type) {
			case "offer":
				var con = new RTCPeerConnection({ "iceServers": [] });
				con.addEventListener("addstream", function(e) {
					var url = window.URL.createObjectURL(e.stream);
					videoEl.each(function(i, dom) {
						dom.src = url;
						dom.play();
					});
				});
				con.addEventListener("removestream", function() {
					videoEl.each(function(i, dom) {
						dom.pause();
						dom.src = "";
					});
				});
				var offer = new RTCSessionDescription({ type: "offer", sdp: data.sdp });
				con.setRemoteDescription(offer, function() {
					con.addEventListener("icecandidate", function (e) {
						if (!e.candidate) {
							var sdp = con.localDescription.sdp;
							ws.send(JSON.stringify({ type: "answer", sdp: sdp, to: data.from }));
						}
					});
					con.createAnswer(function(desc) {
						con.setLocalDescription(desc, function() {}, function() {});
					}, function() {});
				}, function() {});
				window.con = con;
				break;
			default:
				break;
		}
	});
	ws.addEventListener("open", function(e) {
		ws.send(JSON.stringify({ type: "request" }));
	});
	$("button.fullscreen").on("click", function() {
		var el = videoEl.get(0);
		var request = el.requestFullScreen || el.mozRequestFullScreen || el.webkitRequestFullScreen;
		request.bind(el)();
	});
});
