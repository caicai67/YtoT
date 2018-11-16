var fs = require('fs');
var tumblr = require('tumblr.js');

var postData = JSON.parse(fs.readFileSync("Post.json"));
console.log(postData);
var creds = JSON.parse(fs.readFileSync("tumblr_client_secret.json"));
var client = tumblr.createClient(creds.secretStuff);

var myPost = client.createVideoPost('kpopndrop.tumblr.com', {type: 'video', provider: 'youtube', caption: formatPostCaption(postData), tags: postData.tags + "," + postData.title + "," + postData.artist, embed: postData.url, state: 'queue', format: 'html'}, function (err, data) {
    console.log(err);
});


function formatPostCaption(postData) {
	var postHTML = `<h2>"` + postData.title + `” by <i>` + postData.artist + `</i></h2>
	<p><b>Released `  + postData.date + `</b></p>
	<p>`+ postData.blurb + `</p>
	<p><small><i>Disclaimer: I am not associated with anyone involved in creating these videos nor with the youtube accounts that host them. 
	I am only a fan finding and sharing videos I have enjoyed. 
	For official information, please refer to the original video by selecting the "YouTube" link at the bottom of the video.</i></small></p>`
	return postHTML;
}