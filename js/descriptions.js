function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	var writtenArray = [];
	for (let i = 0; i < runkeeper_tweets.length; i++) {
		if (runkeeper_tweets[i]["text"].includes("-")) {
			writtenArray.push(new Tweet(runkeeper_tweets[i]["text"], runkeeper_tweets[i]["created_at"]));
		}
	}
	// console.log(writtenArray);
}


function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	document.getElementById("textFilter").addEventListener("input", function() {
		var checkInput = document.getElementById("textFilter").value;
		console.log(checkInput);
		




	})
	
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});