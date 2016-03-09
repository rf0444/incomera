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
	sdpP.then(function(sdp) {
		selfSdpEl.val(sdp);
	});
	var postedP = sdpP.then(function(sdp) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				method: "POST",
				url: "/sdps",
				data: sdp,
				contentType: false
			}).then(resolve, reject);
		});
	});
	var cid = null;
	postedP.then(function(x) {
		cid = x.id;
	});
	var addRemote = function(sdp) {
		var answer = new RTCSessionDescription({ type: "answer", sdp: sdp });
		con.setRemoteDescription(answer, function() {}, function() {});
	};
	var updateSdpsEl = function(ws) {
		sdpsEl.empty().append(
			ws.map(function(w) {
				var d = new Date(w.time);
				return $("<tr class='sdp-record'></tr>")
					.append($("<td></td>")
						.text(d.toLocaleString() + "." + d.getMilliseconds())
					)
					.append($("<td></td>")
						.append($("<textarea class='form-control' rows='3' readonly></textarea>").val(w.sdp))
					)
				;
			})
		);
	};
	var watchers = [];
	postedP.then(function(x) {
		setInterval(function() {
			$.get("/sdps/" + x.id).then(function(data) {
				var news = data.watchers.filter(function(nw) {
					return watchers.every(function(ow) { return nw.id != ow.id; });
				});
				if (news.length != 0) {
					news.forEach(function(x) {
						addRemote(x.sdp);
					});
				}
				if (news.length != 0 || data.watchers.length != watchers.length) {
					updateSdpsEl(data.watchers);
				}
				watchers = data.watchers;
			});
		}, 3000);
	});
	$(window).on("beforeunload", function() {
		if (cid != null) {
			$.ajax({
				method: "DELETE",
				url: "/sdps/" + cid
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
