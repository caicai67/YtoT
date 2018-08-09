// Performs all Youtube API operations
// 1. gets and exports the info of the video at the top of the playlist
// 2. moves the video from the source playlist (kpop blog) to the trash playlist (used in kpop blog)


var fs = require('fs');
var readline = require('readline');
var {
    google
} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
// you will be automatically walked through adding new credentials the next time this is run
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('yt_client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), executeApplication);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 *
 *
 **/
function executeApplication(auth) {
    var service = google.youtube('v3');
    var channel = getChannel(auth, service);
    //getPlaylist(auth, service,'UCJNDTPFnEqQthxanDxH5DJQ')
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth, service) {
    //console.log(auth);
    //console.log(service);
    service.channels.list({
        auth: auth,
        part: 'snippet,contentDetails,statistics',
        forUsername: 'caicai67'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var channels = response.data.items;
        if (channels.length == 0) {
            console.log('No channel found.');
        } else {
            console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                'it has %s views.',
                channels[0].id,
                channels[0].snippet.title,
                channels[0].statistics.viewCount);
            getPlaylist(auth, service, channels[0].id);
        }
    });
}

function getPlaylist(auth, service, channelID) {
    //console.log(auth);
    //console.log(service);
    //console.log(channelID);
    service.playlists.list({
        auth: auth,
        channelId: channelID,
        maxResults: '50',
        part: 'snippet,contentDetails'

    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var playlists = response.data.items;
        if (playlists.length == 0) {
            console.log('No playlist found.');
        } else {
        	//console.log(playlists);
        	// playlists.forEach(function(pl){
        	// 	console.log(pl.snippet.title);
        	// });
            var toBlog = playlists.find(function(pl){
            	return pl.snippet.title == "Kpop Blog"
            });
            var usedInBlog = playlists.find(function(pl){
                return pl.snippet.title == "used in kpop blog"
            });
            console.log(toBlog.id);
            getPlaylistItem(auth, service, toBlog.id, usedInBlog.id);
        }
    });
}

function getPlaylistItem(auth, service, sourcePlaylistID, trashPlaylistID) {
	service.playlistItems.list({
		auth: auth,
		playlistId: sourcePlaylistID,
		maxResults: '50',
		part: 'snippet,contentDetails'
	}, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var videos = response.data.items;
        if (videos.length == 0) {
            console.log('No video found.');
        } else {
        	//console.log(playlists);
        	videos.forEach(function(vid){
        		console.log(vid.snippet.title);
        	});
        	var todaysVid = videos[0];
        	//console.log(todaysVid);
        	var videoId = todaysVid.snippet.resourceId.videoId;
        	console.log(videoId);
            // var toBlog = playlists.find(function(pl){
            // 	return pl.snippet.title == "Kpop Blog"
            // })
            getVideo(auth, service, videoId);
            moveVideo(auth, service, videoId, todaysVid.id, trashPlaylistID);
        }
        
	});
}

function moveVideo(auth, service, videoId, playlistItemId, trashPlaylistID){

    //add the video to the trash playlist
    service.playlistItems.insert({
        auth: auth,
        resource: {
          "snippet": {
            "playlistId": trashPlaylistID,
            "resourceId": {
              "kind": "youtube#video",
              "videoId": videoId
            }
          }
        },
        part: 'snippet, contentDetails'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log("Video added to \'used in kpop blog\'");
    });

    //remove the video from the source playlist
    service.playlistItems.delete({
        auth: auth,
        id: playlistItemId
    }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        console.log("Video removed from \'Kpop Blog\'");
      });
}

function getVideo(auth, service, videoId){
	service.videos.list({
		auth: auth,
		id: videoId,
		maxResults: '3',
		part: 'snippet,contentDetails'
	}, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var video = response.data.items;
        if (video.length == 0) {
            console.log('No video found.');
        } else if (video.length > 1) {
        	console.log('More than one video with this ID exists')
        } else {
        	//console.log(playlists);
        	video = video[0]
        	//console.log(video);
        	sendVidDataToFile(video);
        }
	});

}

function sendVidDataToFile(video) {
	var fs = require("fs");
	var fileContent = JSON.stringify(video, null, 4);

	fs.writeFile("VideoData.json", fileContent, (err) => {
	    if (err) {
	        console.error(err);
	        return;
	    };
	    console.log("File has been created");
	});

}