var finished = true;
$('#addStock_id').typeahead(
		{
			minLength : 3,
			source : function(query, process) {
				if (!finished) {
					return;
				}
				finished = false;
				$.ajax({
					type : 'GET',
					url : '/typeahead_stockid',
					data : {
						query : query
					},
					dataType : 'json',
					success : function(resp) {
						var data = new Array();
						for ( var i in resp)
							data.push(resp[i].id + '_' + resp[i].desc + '_'
									+ resp[i].price + '_' + resp[i].qty);
						process(data);
						finished = true;
					}
				});
			},
			highlighter : function(item) {
				var parts = item.split('_');
				return parts[0];

			},
			updater : function(item) {
				var parts = item.split('_');
				$('#addStock_desc').val(parts[1]);
				$('#addStock_price').text(parts[2]);
				$('#addStock_qty').text(parts[3]);
				return parts[0];
				;
			},
		});

var finished_d = true;
$('#addStock_desc').typeahead(
		{
			minLength : 3,
			source : function(query, process) {
				if (!finished_d) {
					return;
				}
				finished_d = false;
				$.ajax({
					type : 'GET',
					url : '/typeahead_stockid',
					data : {
						desc : 1,
						query : query
					},
					dataType : 'json',
					success : function(resp) {
						var data = new Array();
						for ( var i in resp)
							data.push(resp[i].id + '_' + resp[i].desc + '_'
									+ resp[i].price + '_' + resp[i].qty);
						process(data);
						finished_d = true;
					}
				});
			},
			highlighter : function(item) {
				var parts = item.split('_');
				return parts[1];

			},
			updater : function(item) {
				var parts = item.split('_');
				$('#addStock_id').val(parts[0]);
				$('#addStock_price').text(parts[2]);
				$('#addStock_qty').text(parts[3]);
				return parts[1];
				;
			},
		});

var slno = 1;
var finished_i = true;
$('#search_invoice_id').typeahead(
		{
			minLength : 3,
			source : function(query, process) {
				if (!finished_i) {
					return;
				}
				finished_i = false;
				$.ajax({
					type : 'GET',
					url : '/typeahead_stockid',
					data : {
						query : query
					},
					dataType : 'json',
					success : function(resp) {
						var data = new Array();
						for ( var i in resp)
							data.push(resp[i].id + '_' + resp[i].desc + '_'
									+ resp[i].price);
						process(data);
						finished_i = true;
					}
				});
			},
			highlighter : function(item) {
				var parts = item.split('_');
				return parts[0];

			},
			updater : function(item) {
				var parts = item.split('_');
				var row = $('<tr></tr>')
				$('<td></td>').text(slno).appendTo(row);
				$('<td>', {
						text : parts[0],
						name : "pid:" + slno
					}).appendTo(row);
				$('<td></td>').text(parts[1]).appendTo(row);
				$('<td>', {
					text : parts[2],
					name : "price:" + slno
				}).appendTo(row);
				$("<td>").append($("<input>", {
					type : "number",
					"step" : "any",
					name : "qty:" + slno,
					"class" : "input-mini"
				})).appendTo(row);
				$("<td>", {
					name : "sub_total:" + slno,
					"class" : "input-mini"
				}).appendTo(row);
				$("#invoice_tbody").append(row)
				slno++;
				bind_keyup();
				return "";
				;
			},
		});
function commaSeparateNumber(val) {
	while (/(\d+)(\d{3})/.test(val.toString())) {
		val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
	}
	return val;
}
function recalc() {
	$("td[name^='sub_total']").calc("qty * price", {
		qty : $("input[name^=qty]"),
		price : $("td[name^=price]")
	},
	// define the formatting callback, the results of the
	// calculation are passed to this function
	function(s) {
		// return the number as a dollar amount
		return "₹" + s.toFixed(2);
	},
	// define the finish callback, this runs after the calculation
	// has been complete
	function($this) {
		// sum the total of the $("[id^=total_item]") selector
		var sum = $this.sum();

		$("#Total_bill").text(
		// round the results to 2 digits
		"₹" + commaSeparateNumber(sum.toFixed(2)));
	});
}
function bind_keyup() {
	$("input[name^=qty]").keyup(function(event) {
		recalc();
	});

};

$("#save_print").on('click', function() {
	array_pid =  $.makeArray($("td[name^=pid]"));
	array_qty =  $.makeArray($("input[name^=qty]"));
	var pids = Array();
	var qtys = Array();
	for(i in array_pid){ pids.push($(array_pid[i]).text());}	
	for(i in array_qty){ qtys.push($(array_qty[i]).val());}	
	pids_qty=""
	for(var i in pids){
		if(i != 0)
			pids_qty = pids_qty + ", "
		pids_qty = pids_qty + pids[i] + "[" + qtys[i] + "]"
	}
	$.ajax({
		type : 'GET',
		url : '/save_invoice',
		data : {
			billno : $("#billNo").text(),
			price  : $("#Total_bill").text().replace(/[₹,]/g, ""),
			pids   : JSON.stringify(pids),
			qtys   : JSON.stringify(qtys),
			pids_qty   : pids_qty
		}}).done(function(){
			window.print();
		}).fail(function() { alert("error !! Call Anenth "); });
});


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40361831-1', 'saj-textiles.appspot.com');
ga('send', 'pageview');
