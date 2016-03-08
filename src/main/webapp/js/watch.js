navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
$(function() {
	var sdpEl = $(".sdp-data");
	var selfSdpEl = $(".self-sdp-data");
	var videoEl = $("video.watch");
	var con = new RTCPeerConnection({ "iceServers": [] });
	var cid = location.search.substring(1);
	con.addEventListener("addstream", function(e) {
		console.log(e);
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
	var sdpP = new Promise(function(resolve, reject) {
		$.get("/sdps/" + cid).then(function(x) { resolve(x.sdp); }, reject);
	});
	sdpP.then(function(sdp) {
		var offer = new RTCSessionDescription({ type: 'offer', sdp: sdp });
		return new Promise(function(resolve, reject) {
			con.setRemoteDescription(offer, function() { resolve(sdp); }, reject);
		});
	}).then(function(sdp) {
		sdpEl.val(sdp);
	});
});