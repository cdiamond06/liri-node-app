// GLOBAL VARIABLES
// -------------------------------------------------------------------
var request = require("request");
var inquirer = require("inquirer");
var spotify = require("spotify");
var express = require('express');
var Twitter = require('twitter');
var tweetKeys = require("./keys.js");
var tweetKeyList = tweetKeys.twitterKeys;
var tweetArray=[];

// twitterKeys = new Twitter ({
//   consumer_key: 'mwxa26SLc0H0gMr1b76swirJw',
//   consumer_secret: 'csEHcaNKZ51Ab3fMYB5auevIVd6HrraXtxSQiePKSZsUCQZaww',
//   access_token_key: '860258458989350914-WisVVofKaGnWpleoHwX5B9btcImh13i',
//   access_token_secret: 'LKeqC4lMIqL6r0qYPLTBORkVd69A6nhVkfennGASoU6Aw',
// });

// Includes the FS package for reading and writing packages
var fs = require("fs");

var call;

var title = "";

var keepGoing;

// FUNCTIONS
// --------------------------------------------------------------------
function start() {

    inquirer.prompt([{
            type: "list",
            message: "What would you like to search for?",
            choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
            name: "pick"
        },

        {
            type: "input",
            message: "Leave blank for my tweets or enter movie name or title",
            name: "name"

        },

        {
            type: "confirm",
            message: "You want to run another search after?",
            name: "confirm",
            default: true
        }
    ]).then(function(user) {
        call = user.pick;
        title = user.name;
        keepGoing = user.confirm;
        // console.log(keepGoing);
        switch (call) {
            // check for movie imdb call 
            case "movie-this":
                if (!title) title = "Mr. Nobody";
                var movieUrl = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&r=json";
                movieCall(movieUrl);
                break;

            case "spotify-this-song":
                if (!title) title = "The Sign Ace of Base";

                spotifyCall(title);
                break;

            case "do-what-it-says":
                readFile();
                break;

            case "my-tweets":
                twitterCall(tweetKeyList);
                // console.log(tweetKeyList);
                break;

            default:
                console.log("Something went wrong");
        };
        restart(keepGoing);
    });
}
// runs what is in random txt
function whatitsays(call, title) {
    if (call === "movie-this") {
        var movieUrl = "http://www.omdbapi.com/?t=" + title;
        movieCall(movieUrl);
        console.log(movieUrl);
        console.log(title);
    } else if (call === "spotify-this-song") {
        spotifyCall(title);
    } else if(call === "my-tweets"){
        twitterCall(tweetKeyList);
    }
}
// reads the random.txt file
function readFile() {
    fs.readFile("random.txt", "utf8", function(err, data) {
        // Break the string down by comma separation and store the contents into the output array.
        if (err) {
            cosole.log(err);
        }
        var output = data.split(",");
        functionCall = output[0];
        title = output[1].replace(/["]/g, '');
        whatitsays(functionCall, title);
    });
}
// adds to log.txt from function calls
function addToLog() {
    fs.appendFile("log.txt", call + ": " + title + "\n", function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("content added to log.txt");
        }
    });

}
// finds the movies
function movieCall(movieUrl) {
    addToLog();
    request(movieUrl, function(error, response, body) {
        console.log("movie Call");
        // console.log(movieUrl);
        // If the request is successful
        if (!error && response.statusCode === 200) {

            console.log("*Title: " + JSON.parse(body).Title);
            console.log("*Year Released: " + JSON.parse(body).Year);
            console.log("*imdb Rating: " + JSON.parse(body).imdbRating);
            console.log("*Country Produced: " + JSON.parse(body).Country);
            console.log("*Language: " + JSON.parse(body).Language);
            console.log("*Plot: " + JSON.parse(body).Plot);
            console.log("*Actors: " + JSON.parse(body).Actors);
                if(JSON.parse(body).Ratings[1].Value){
            console.log("*Rotten Tomatoes: " + JSON.parse(body).Ratings[1].Value);
                }
        }   else {
            console.log(response.statusCode);
        }
    });
} // end of the movieCall function
// finds the songs using spoitfy
function spotifyCall(title) {
    addToLog();
    spotify.search({
        type: 'track',
        query: title
    }, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }
        // console.log(JSON.stringify(data, null, 2));
        console.log("*Artists: " + data.tracks.items[0].artists[0].name);
        console.log("*Song Name: " + data.tracks.items[0].name);
        console.log("*Preview Link: " + data.tracks.items[0].album.artists[0].external_urls.spotify);
        console.log("*Album: " + data.tracks.items[0].album.name);
    });
};

function twitterCall(tweetKeyList) {
    addToLog();
    tweetKeyList.get('statuses/user_timeline', function(error, tweets, response) {
        if (error) throw error;
        for(var i = 0; i < tweets.length; i++){
        var tweetObj={};
        tweetObj.count = i+1;
        tweetObj.name = tweets[i].user.name;
        tweetObj.text = tweets[i].text;
        tweetObj.created = tweets[i].user.created_at;
        tweetArray.push(tweetObj);
        }
        console.log(tweetArray);
    });
}
function restart(bool) {
    bool ? start() : console.log("thank you for asking!");
}

// MAIN PROCESS
// ------------------------------------------------------------------------
start();
