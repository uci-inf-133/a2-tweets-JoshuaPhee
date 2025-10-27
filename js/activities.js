function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Num Different Type Activities
	var activityData = parseActivityTypes(tweet_array);
	document.getElementById("numberActivities").innerText = Object.keys(activityData).length;

	//Top Three Common Activities
	var objectTopThree = getThreeCommonAct(activityData);
	document.getElementById("firstMost").innerText = objectTopThree["most"];
	document.getElementById("secondMost").innerText = objectTopThree["second"];
	document.getElementById("thirdMost").innerText = objectTopThree["third"];

	//Longest Shortest Activity Types
	document.getElementById("longestActivityType").innerText = findLongestDistanceAct(activityData);
	document.getElementById("shortestActivityType").innerText = findShortestDistanceAct(activityData)

	//Weekday or Weekend
	document.getElementById("weekdayOrWeekendLonger").innerText = findLongDay(tweet_array);


	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	var firstSchema = createArraySchemaOne(activityData);

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": firstSchema
	  },
	  //TODO: Add mark and encoding
	  "mark": "circle",
	  "encoding": {
		"x": {"field": "a", "type": "nominal", "axis": {"title": "Activities"}},
		"y": {"field": "b", "type": "quantitative", "axis": {"title": "Frequency"}}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});


	var disVisSchema = createDisVisSchema(tweet_array, objectTopThree);
	activity_dist_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the distance by day of the week for all of the three most tweeted-about activities.",
	  "data": {
	    "values": disVisSchema
	  },
	  //TODO: Add mark and encoding
	  "width": 200,
	  "mark": "circle",
	  "encoding": {
		"x": {"field": "a", "type": "nominal", "axis": {"title": "Time (day)", "labelAngle": 0}, "sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]},
		"y": {"field": "b", "type": "quantitative", "axis": {"title": "Distance"}},
		"color": {"field": "activity", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVis', activity_dist_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	var dictAvgData = createDictAvg(tweet_array, objectTopThree);
	var distAvgSchema = createSchemaAvg(dictAvgData, objectTopThree)

	activity_dist_vis_avg_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the average distance by day of the week for all of the three most tweeted-about activities.",
	  "data": {
	    "values": distAvgSchema
	  },
	  //TODO: Add mark and encoding
	  "width": 200,
	  "mark": "circle",
	  "encoding": {
		"x": {"field": "a", "type": "nominal", "axis": {"title": "Time (day)", "labelAngle": 0}, "sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]},
		"y": {"field": "b", "type": "quantitative", "axis": {"title": "Mean of Distance"}},
		"color": {"field": "activity", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', activity_dist_vis_avg_spec, {actions:false});

	document.getElementById("distanceVis").style.display = "none";
	document.getElementById("distanceVisAggregated").style.display = "none";

	document.getElementById("aggregate").addEventListener("click", function() {
		if (document.getElementById("aggregate").innerText == "Show means") {
			document.getElementById("aggregate").innerText = "Show all activities";
			// display mean graph now
			document.getElementById("distanceVis").style.display = "none";
			document.getElementById("distanceVisAggregated").style.display = "block";



		}
		else {
			document.getElementById("aggregate").innerText = "Show means";
			// display distance graph now
			document.getElementById("distanceVisAggregated").style.display = "none";
			document.getElementById("distanceVis").style.display = "block";
		}
	});

}

function createDictAvg(tweet_array, objectTopThree) {
	var topThreeArray = [objectTopThree["most"], objectTopThree["second"], objectTopThree["third"]];
	var dictAvgData = {"Sun": {}, "Mon": {}, "Tue": {}, "Wed": {}, "Thu": {}, "Fri": {}, "Sat": {}};
	var dayWeekObj = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"};

	for (let i = 0; i < tweet_array.length; i++) {

		if (topThreeArray.includes(tweet_array[i].activityType)) {
			var dayOfWeek = dayWeekObj[tweet_array[i].time.getDay()];
			
			if (dictAvgData[dayOfWeek][tweet_array[i].activityType]) {
				dictAvgData[dayOfWeek][tweet_array[i].activityType]["count"] += 1; 
				dictAvgData[dayOfWeek][tweet_array[i].activityType]["distance"] += tweet_array[i].distance;
			}
			else {
				dictAvgData[dayOfWeek][tweet_array[i].activityType] = {"count": 1, "distance": tweet_array[i].distance}
			}
		}
	}
	// console.log("check avg object", dictAvgData);
	return dictAvgData;
}

function createSchemaAvg(dictAvgData, objectTopThree) {
	// dictAvgData looks like this rn
	//{"Sun": {"bike": {"count": 2, "distance": 123}, "run": {"count":, "distance":}}, "Mon": {}, "Tue": {}, "Wed": {}, "Thu": {}, "Fri": {}, "Sat": {}}
	var schemaArray = [];
	var topThree = [objectTopThree["most"], objectTopThree["second"], objectTopThree["third"]];
	// now make {"a": "Sun", "b": 5, "activity": "run"}
	for (let day in dictAvgData) {
		let activities = dictAvgData[day];
		for (let activity in activities) {
			schemaArray.push({"a": day, "b": dictAvgData[day][activity]["distance"]/dictAvgData[day][activity]["count"], "activity": activity});
		}
			
		}
	
	// console.log("SCHEMA ARRAY", schemaArray);
	return schemaArray;
}


// {"a": "sun", "b": 12}
function createDisVisSchema(tweet_array, objectTopThree) {
	var topThreeArray = [objectTopThree["most"], objectTopThree["second"], objectTopThree["third"]];
	var disVisSchema = [];
	// console.log("TOP THREE",topThreeArray);

	for (let i = 0; i < tweet_array.length; i++) {
		if (topThreeArray.includes(tweet_array[i].activityType)) {
			if (tweet_array[i].time.getDay() == 0) {
				disVisSchema.push({"a": "Sun", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 1) {
				disVisSchema.push({"a": "Mon", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 2) {
				disVisSchema.push({"a": "Tue", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 3) {
				disVisSchema.push({"a": "Wed", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 4) {
				disVisSchema.push({"a": "Thu", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 5) {
				disVisSchema.push({"a": "Fri", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
			else if (tweet_array[i].time.getDay() == 6) {
				disVisSchema.push({"a": "Sat", "b": tweet_array[i].distance, "activity": tweet_array[i].activityType});
			}
		}
	}
	// console.log("check schema", disVisSchema);
	return disVisSchema;
}


// array.push({"a": "run", "b": 4})
function createArraySchemaOne (activityData) {
	// activtyData contains data like {"run": {"count": 4, "distance": 1241}, "walk": {"count": 1, "distance": 4}}
	var newValues = [];
	for (let key in activityData) {
		newValues.push({"a": key, "b": activityData[key]["count"]})
	}
	// console.log(newValues);
	return newValues;
}


// in one loop, sort and gather different activity types tracking their count and average 

function parseActivityTypes (tweet_array) {
	var activityData = {}; // {"run": {"count": , "distance": }}
	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].activityType != "unknown") {
			var tweetActivityType = tweet_array[i].activityType;
			if (activityData[tweetActivityType]) {
				activityData[tweetActivityType]["count"] += 1;
				activityData[tweetActivityType]["distance"] += tweet_array[i].distance;
			}
			else {
				activityData[tweetActivityType] = {"count": 1, "distance": tweet_array[i].distance};
			}
		}
	}
	// console.log(activityData);
	return activityData;
}

function getThreeCommonAct (activityData) {
	var mostPopularValue = 0;
	var mostPopularKey = "";

	var secondPopularValue = 0;
	var secondPopularKey = "";

	var thirdPopularValue = 0;
	var thirdPopularKey = "";
	for (let key in activityData) {
		if (activityData[key]["count"] >= mostPopularValue) {
			thirdPopularValue = secondPopularValue;
			thirdPopularKey = secondPopularKey;

			secondPopularKey = mostPopularKey;
			secondPopularValue = mostPopularValue;

			mostPopularKey = key;
			mostPopularValue = activityData[key]["count"];
		}
		else if (activityData[key]["count"] >= secondPopularValue) {
			thirdPopularKey = secondPopularKey;
			thirdPopularValue = secondPopularValue;

			secondPopularKey = key;
			secondPopularValue = activityData[key]["count"];
		}
		else if (activityData[key]["count"] > thirdPopularValue) {
			thirdPopularKey = key;
			thirdPopularValue = activityData[key]["count"];
		}
	}
	var objectTopThree = {"most": mostPopularKey, "second": secondPopularKey, "third": thirdPopularKey};
	return objectTopThree;
}

// Finds if weekends or weekdays have longest avg activity types
function findLongDay(tweet_array) {
	var weekdayCount = 0;
	var weekdayTotalDis = 0;
	var weekendCount = 0;
	var weekendTotalDis = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].time.getDay() == 0 || tweet_array[i].time.getDay() == 6) {
			weekendCount += 1;
			weekendTotalDis += tweet_array[i].distance;
		}
		else {
			weekdayCount += 1;
			weekdayTotalDis += tweet_array[i].distance;
		}
	}
	var weekendAvg = weekendTotalDis/weekendCount;
	var weekdayAvg = weekdayTotalDis/weekdayCount;
	if (weekendAvg > weekdayAvg) {
		return "weekends";
	}
	else {
		return "weekdays";
	}
}

function findLongestDistanceAct(activityData) {
	var longAct = "";
	var longActAvg = 0;
	for (let key in activityData) {
		var currentDist = activityData[key]["distance"];
		var currentCount = activityData[key]["count"];
		if (currentDist / currentCount > longActAvg) {
			longAct = key;
			longActAvg = currentDist/currentCount;
		}

	}
	return longAct;
}

function findShortestDistanceAct(activityData) {
	var shortAct = "";
	var shortActAvg = 0;
	for (let key in activityData) {
		var count = activityData[key]["count"];
		var totalDist = activityData[key]["distance"];
		if (shortAct == "") {
			shortAct = key;
			shortActAvg = totalDist/count;
		}
		else if (shortActAvg > totalDist/count) {
			shortAct = key;
			shortActAvg = totalDist/count;
		}
	}
	return shortAct;
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);

});