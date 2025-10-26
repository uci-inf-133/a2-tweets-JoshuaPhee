function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!

	//note only work on these lines
	document.getElementById('numberTweets').innerText = tweet_array.length;	// note this works as a guide for how to use DOM for other '???'
	// use getSource() and replace 

	var numCompleted = getCompletedEvents(tweet_array);
	var allCompletedQuery = document.querySelectorAll('.completedEvents');
	allCompletedQuery.forEach(element => {
		element.innerText = numCompleted;
	});


	document.querySelector('.completedEventsPct').innerText = (numCompleted/tweet_array.length).toFixed(2) + "%";

	var numLive = getLiveEvents(tweet_array);
	document.querySelector('.liveEvents').innerText = numLive;
	document.querySelector('.liveEventsPct').innerText = (numLive/tweet_array.length).toFixed(2) + "%";
	
	var numAchieved = getAchievedEvents(tweet_array);
	document.querySelector('.achievements').innerText = numAchieved;
	document.querySelector('.achievementsPct').innerText = (numAchieved/tweet_array.length).toFixed(2) + "%";

	var numMisc = getMiscEvents(tweet_array);
	document.querySelector('.miscellaneous').innerText = numMisc;
	document.querySelector('.miscellaneousPct').innerText = (numMisc/tweet_array.length).toFixed(2) + "%";
	
	var numWritten = getWritten(tweet_array);
	document.querySelector('.written').innerText = numWritten;
	document.querySelector('.writtenPct').innerText = (numWritten/numCompleted).toFixed(2) + "%";
}

function getCompletedEvents(tweet_array) {
	let total_complete = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].source == "completed_event") {
			total_complete += 1;
		}
	}
	return total_complete;
}

function getLiveEvents(tweet_array) {
	let total_complete = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].source == "live_event") {
			total_complete += 1;
		}
	}
	return total_complete
}

function getAchievedEvents(tweet_array) {
	let total_complete = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].source == "achievement") {
			total_complete += 1;
		}
	}
	return total_complete;
}

function getMiscEvents(tweet_array) {
	let total_complete = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].source == "miscellaneous") {
			total_complete += 1;
		}
	}
	return total_complete;
}

function getWritten(tweet_array) {
	let total_written = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].written) {
			total_written += 1;
		}
	}
	return total_written;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});