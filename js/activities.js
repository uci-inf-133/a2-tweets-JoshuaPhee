function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});


	var objectActivities = getObjectNumAcivities(tweet_array);
	document.getElementById("numberActivities").innerText = Object.keys(objectActivities).length;

	var objectTopThree = getObjectTopThree(objectActivities);

	document.getElementById("firstMost").innerText = objectTopThree["most"];
	document.getElementById("secondMost").innerText = objectTopThree["second"];
	document.getElementById("thirdMost").innerText = objectTopThree["third"];

	document.getElementById("longestActivityType").innerText = findLongestDistanceObject(tweet_array, objectActivities);
	document.getElementById("shortestActivityType").innerText = findShortestDistanceObject(tweet_array, objectActivities);

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

function findLongestDistanceObject(tweet_array, objectActivities) {
	// console.log("LONGEST")
	var longAct = "";
	var longActAvg = 0;
	for (let key in objectActivities) {
		var count = 0;
		var totalDist = 0;
		for (let i = 0; i < tweet_array.length; i++) {
			if (tweet_array[i].activityType == key) {
				totalDist += tweet_array[i].distance;
				count += 1;
			}
		}
		// console.log("Key: ", key, "Avg: ", totalDist/count);
		if (totalDist/count > longActAvg) {
			longAct = key;
			longActAvg = totalDist/count;
		}

	}
	return longAct;
}

function findShortestDistanceObject(tweet_array, objectActivities) {
	// console.log("SHORTEST")
	var shortAct = "";
	var shortActAvg = 0;
	for (let key in objectActivities) {
		var count = 0;
		var totalDist = 0;
		for (let i = 0; i < tweet_array.length; i++) {
			if (tweet_array[i].activityType == key) {
				totalDist += tweet_array[i].distance;
				count += 1;
			}
		}
		// console.log("Key: ", key, "Avg: ", totalDist/count);
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

function getObjectNumAcivities(tweet_array) {
	var diffObject = {};

	for (let i = 0; i < tweet_array.length;i++) {
		const tweetActivityType = tweet_array[i].activityType;
		if (tweetActivityType != "unknown") {
			if (diffObject[tweetActivityType]){
				diffObject[tweetActivityType]++;
			}
			else {
				diffObject[tweetActivityType] = 1;
			}
		}
	}
	return diffObject
}

function getObjectTopThree(diffObject) {
	
	var mostPopularValue = 0;
	var mostPopularKey = "";

	var secondPopularValue = 0;
	var secondPopularKey = "";

	var thirdPopularValue = 0;
	var thirdPopularKey = "";

	for (let key in diffObject) {
		if (diffObject[key] >= mostPopularValue) {
			thirdPopularValue = secondPopularValue;
			thirdPopularKey = secondPopularKey;

			secondPopularKey = mostPopularKey;
			secondPopularValue = mostPopularValue;

			mostPopularKey = key;
			mostPopularValue = diffObject[key];
		}
		else if (diffObject[key] >= secondPopularValue) {
			thirdPopularKey = secondPopularKey;
			thirdPopularValue = secondPopularValue;

			secondPopularKey = key;
			secondPopularValue = diffObject[key];
		}
		else if (diffObject[key] > thirdPopularValue) {
			thirdPopularKey = key;
			thirdPopularValue = diffObject[key];
		}
	}
	var objectTopThree = {"most": mostPopularKey, "second": secondPopularKey, "third": thirdPopularKey};
	return objectTopThree;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});