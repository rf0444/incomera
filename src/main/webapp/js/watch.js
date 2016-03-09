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
		$.get("/sdps/" + cid).then(function(x) { resolve(x.recorder.sdp); }, reject);
	});
	sdpP.then(function(sdp) {
		sdpEl.val(sdp);
	});
	var selfSdpP = sdpP.then(function(sdp) {
		var offer = new RTCSessionDescription({ type: "offer", sdp: sdp });
		return new Promise(function(resolve, reject) {
			con.setRemoteDescription(offer, function() { resolve(); }, reject);
		});
	}).then(function() {
		return new Promise(function(resolve, reject) {
			con.addEventListener("icecandidate", function (e) {
				if (!e.candidate) {
					resolve(con.localDescription.sdp);
				}
			});
			con.createAnswer(function(desc) {
				con.setLocalDescription(desc, function() {}, reject);
			}, reject);
		});
	});
	var wid = null;
	selfSdpP.then(function(sdp) {
		selfSdpEl.val(sdp);
		$.ajax({
			method: "POST",
			url: "/sdps/" + cid,
			data: sdp,
			contentType: false
		}).then(function(x) {
			wid = x.id;
		});
	});
	$(window).on("beforeunload", function() {
		if (wid != null) {
			$.ajax({
				method: "DELETE",
				url: "/sdps/" + cid + "/" + wid
			});
		}
	});
	$("button.fullscreen").on("click", function() {
		var el = videoEl.get(0);
		var request = el.requestFullScreen || el.mozRequestFullScreen || el.webkitRequestFullScreen;
		request.bind(el)();
	});
	window.con = con;
});
