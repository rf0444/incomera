navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
$(function() {
	var sdpsEl = $("tbody.sdps");
	var selfSdpEl = $(".self-sdp-data");
	var videoEl = $("video.rec");
	var con = new RTCPeerConnection({ "iceServers": [] });
	var streamP = new Promise(function(resolve, reject) {
		navigator.getUserMedia({ video: true, audio: true }, resolve, reject);
	});
	streamP.then(function(stream) {
		var url = window.URL.createObjectURL(stream);
		videoEl.each(function(i, dom) {
			dom.src = url;
			dom.play();
		});
	});
	var sdpP = streamP.then(function(stream) {
		con.addStream(stream);
		return new Promise(function(resolve, reject) {
			con.addEventListener("icecandidate", function (e) {
				if (!e.candidate) {
					resolve(con.localDescription.sdp);
				}
			});
			con.createOffer(function(desc) {
				con.setLocalDescription(desc, function() {}, reject);
			}, reject);
		});
	});
	var cid = null;
	sdpP.then(function(sdp) {
		selfSdpEl.val(sdp);
		$.ajax({
			method: "POST",
			url: "/sdps",
			data: sdp,
			contentType: false
		}).then(function(x) {
			cid = x.id;
		});
	});
	$(window).on("beforeunload", function() {
		if (cid != null) {
			$.ajax({
				method: "DELETE",
				url: "/sdps/" + cid
			});
		}
	});
});
