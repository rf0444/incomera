$(function() {
	var watchesEl = $(".watches");
	var toRecord = function(watch) {
		var d = new Date(watch.started);
		var url = "/watch.html?" + watch.id;
		return $("<a class='btn btn-primary btn-lg btn-block'></a>")
			.prop("href", url)
			.text(d.toLocaleString() + "." + d.getMilliseconds() + " ～")
		;
	};
	$.get("/watches").then(function(watches) {
		watchesEl.empty().append(
			watches.map(toRecord)
		);
	});
});
