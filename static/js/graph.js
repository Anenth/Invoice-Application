var chart;
var chartData = [ {
	year : 2005,
	income : 23.5,
	expenses : 18.1
}, {
	year : 2006,
	income : 26.2,
	expenses : 22.8
}, {
	year : 2007,
	income : 30.1,
	expenses : 23.9
}, {
	year : 2008,
	income : 29.5,
	expenses : 25.1
}, {
	year : 2006,
	income : 26.2,
	expenses : 22.8
}, {
	year : 2007,
	income : 30.1,
	expenses : 23.9
}, {
	year : 2008,
	income : 29.5,
	expenses : 25.1
}, {
	year : 2006,
	income : 26.2,
	expenses : 22.8
}, {
	year : 2007,
	income : 30.1,
	expenses : 23.9
}, {
	year : 2008,
	income : 29.5,
	expenses : 25.1
}, {
	year : 2009,
	income : 24.6,
	expenses : 25.0
} ];


function drawChart(type,type_no,query){
	chart = new AmCharts.AmSerialChart();

	chart.autoMarginOffset = 0;
	chart.marginRight = 0;
	
	$.ajax({
		type : 'GET',
		url : '/report_chart',
		data : {
			query : query,
			type  : type_no
		},
		dataType : 'json'
	}).done(function(){
		
	});
	chart.dataProvider = chartData;
	chart.categoryField = "type";
	chart.startDuration = 1;

	// AXES
	// category
	var categoryAxis = chart.categoryAxis;
	categoryAxis.gridPosition = "start";

	// value
	// in case you don't want to change default settings of value axis,
	// you don't need to create it, as one value axis is created automatically.
	// GRAPHS
	// column graph
	var graph1 = new AmCharts.AmGraph();
	graph1.type = "column";
	graph1.lineColor = "#5475d3";
	graph1.title = "Income";
	graph1.valueField = "income";
	graph1.lineAlpha = 0;
	graph1.fillAlphas = 0.85;
	chart.addGraph(graph1);

	// line
	var graph2 = new AmCharts.AmGraph();
	graph2.type = "line";
	graph2.title = "Expenses";
	graph2.valueField = "expenses";
	graph2.lineThickness = 2;
	graph2.bullet = "round";
	chart.addGraph(graph2);

	// LEGEND
	var legend = new AmCharts.AmLegend();
	chart.addLegend(legend);

	// WRITE
	chart.write("chartdiv");
}