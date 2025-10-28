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
	return writtenArray;
}


function addEventHandlerForSearch(writtenArray) {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	document.getElementById("textFilter").addEventListener("input", function() {
		var checkInput = document.getElementById("textFilter").value;
		document.getElementById("searchText").innerText = checkInput;

		if (checkInput === "") {
			document.getElementById("tweetTable").innerHTML = "";
			document.getElementById("searchCount").innerText = 0;
		}
		else {
			document.getElementById("searchCount").innerText = 0;
			document.getElementById("tweetTable").innerHTML = "";
			var count = 1;
			for (let i = 0; i<writtenArray.length; i++) {
				if (writtenArray[i].written && writtenArray[i].activityType !== "unknown") {
					if (writtenArray[i].text.includes(checkInput)) {
						var getTable = document.getElementById("tweetTable");
						var newRow = document.createElement("tr");

						var rowNum = document.createElement("td");
						rowNum.scope = "row";
						rowNum.textContent = count;

						var rowActivity = document.createElement("td");
						rowActivity.textContent = writtenArray[i].activityType;

						const urlregex = /https:\/\/[^\s]+/;
						var rowText = document.createElement("td");
						let tweetText = writtenArray[i].text;
						tweetText = tweetText.replace(urlregex, (url) => {
							return `<a href="${url}" ${url}</a>`
						})

						rowText.innerHTML = tweetText;

						newRow.append(rowNum);
						newRow.append(rowActivity);
						newRow.append(rowText);

						getTable.appendChild(newRow);
						count += 1;
					}
				}
			}
			document.getElementById("searchCount").innerText = count - 1;
		}

	})
	
}

function checkNumTweets(text) {
	var count = 0;

	return count;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	document.getElementById("searchCount").innerText = 0;
	document.getElementById("searchText").innerText = "";
	loadSavedRunkeeperTweets().then(parseTweets).then(addEventHandlerForSearch);
});