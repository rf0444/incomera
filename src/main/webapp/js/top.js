$(function() {
	var sdpsEl = $("tbody.sdps");
	var toRecord = function(sdp) {
		var d = new Date(sdp.time);
		var url = "/watch.html?" + sdp.id;
		return $("<tr class='sdp-record'></tr>")
			.append($("<td></td>")
				.append($("<a></a>")
					.prop("href", url)
					.text(d.toLocaleString() + "." + d.getMilliseconds())
				)
			)
			.append($("<td></td>")
				.append($("<textarea class='form-control' rows='3' readonly></textarea>").val(sdp.sdp))
			)
		;
	};
	$.get("/sdps").then(function(sdps) {
		sdpsEl.empty().append(
			sdps.map(toRecord)
		);
	});
});
