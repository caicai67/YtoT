//this file takes in a youtube video's data and exports it to a custom JSON file

var fs = require('fs');

fs.readFile("VideoData.json", (err, data) => {
	if (err) throw err;
	var videoInfo = JSON.parse(data)
	var postObject = {
		"artist": parseArtist(videoInfo.snippet.title),
		"title": parseTitle(videoInfo.snippet.title),
		"blurb": "",
		"date": formatDate(videoInfo.snippet.publishedAt),
		"tags": "kpop, korean pop, k-pop, music video, mv, " + getYear(videoInfo.snippet.publishedAt),
		"url": "https://youtu.be/" + videoInfo.id
	};
	fs.writeFile("Post.json", JSON.stringify(postObject, null, 4), (err) => {
	    if (err) {
	        console.error(err);x
	        return;
	    };
	    console.log("File has been created");
	});
});

function parseArtist(videoTitle) {
	var noMVnoK = removeMVString(videoTitle);
	var substrings = splitWords(noMVnoK);
	var artist = getLongestArtistString(substrings);
	return artist;
}

function removeMVString(ytString) {
	var stringsToRemove = /[Mm][Vv]|[Mm]\/[Vv]|Official/g;
	return ytString.replace(stringsToRemove, "");
}

function splitWords(ytString) {
	//any special characters (excluding spaces or apostrophies) and any apostrophies before ar after a space
	var regEx = /\s*[^A-Za-z0-9\.\s\']\s*|\s*\'\s+|\s+\'\s*/g;
	var parsed = ytString.split(regEx);
	console.log(parsed);
	var cleanAndParsed = [];
	var stringsToDelete = /\[\w\s\]|[Ff]eat\.|[Pp]erformance\s[Vv]er|[Ss]pecial\s[Cc]lip|[Vv]er\.|[Vv]ersion|[Pp]rod\./g;
	for(i = 0; i < parsed.length; i++) {
		if (parsed[i] !== "" && !parsed[i].match(stringsToDelete) ) {
			console.log(parsed[i]);
			cleanAndParsed.push(parsed[i]);
		}
	}
	return cleanAndParsed;
}

function getLongestArtistString(substrings) {
	var artistsOnly = substrings.slice(0,substrings.length-1);
	var longest = artistsOnly[0];
	for (i = 1; i < artistsOnly.length; i++) {
		longest = (longest.length > artistsOnly[i].length ? longest : artistsOnly[i]);
	}
	return longest;
}

function parseTitle(videoTitle) {
	var noMVnoK = removeMVString(videoTitle);
	var substrings = splitWords(noMVnoK);
	var title = substrings[substrings.length-1];
	return title;
}

function formatDate(unformatted) {
	var millis = Date.parse(unformatted);
	var fullDate = new Date(millis);
	var formatted = fullDate.toLocaleString("en-us", { month: "long", day: "numeric", year: "numeric" });
	return formatted;
}

function getYear(unformatted) {
	var millis = Date.parse(unformatted);
	var fullDate = new Date(millis);
	var formatted = fullDate.getFullYear();
	return formatted;
}