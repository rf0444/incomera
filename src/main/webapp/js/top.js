$(function() {
	var tbody = $("tbody.sdps");
	var toRecord = function(sdp) {
		var d = new Date(sdp.time);
		var url = "/watch.html?t=" + sdp.time;
		return $("<tr class='sdp-record'></tr>")
			.append($("<td></td>")
				.append($("<a class='btn btn-info btn-block'></a>")
					.prop("href", url)
					.text(d.toLocaleString() + "." + d.getMilliseconds())
				)
			)
			.append($("<td></td>")
				.append($("<a class='btn btn-info btn-block'></a>")
					.prop("href", url)
					.text(sdp.text)
				)
			)
		;
	};
	$.get("/sdps").then(function(sdps) {
		tbody.empty().append(
			sdps.map(toRecord)
		);
	});
});
