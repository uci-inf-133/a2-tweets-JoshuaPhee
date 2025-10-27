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

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": tweet_array
	  }
	  //TODO: Add mark and encoding
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
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
	console.log(activityData);
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