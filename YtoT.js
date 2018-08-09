//main file - executes other files in order


var fs = require('fs');
const execSync = require('child_process').execSync;

var getData = execSync('node GetDataFromYT.js').toString();
console.log(getData);

var createPostData = execSync('node ConvertData.js').toString();
console.log(createPostData);

var postToTumbler = execSync('node PostToTumblr.js').toString();
console.log(postToTumbler);
