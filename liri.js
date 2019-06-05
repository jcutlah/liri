require("dotenv").config();
var fs = require('fs');
var keys = require('./keys.js');
var inquirer = require('inquirer');
var axios = require('axios');
var Spotify = require('node-spotify-api');
var moment = require('moment');

var omdbKey = keys.otherKeys.omdb_key;
var bandsKey = keys.otherKeys.bands_key;
// console.log(searchTerm);
var command;
// console.log(keys);

function bandsInTown(band){
    console.log('Looking up concerts for ' + band + '...');
    axios.get('https://rest.bandsintown.com/artists/'+band+'/events?app_id='+bandsKey).then(function (response) {
        // handle success
        // console.log(response.data);
        let shows = response.data;
        // console.log(typeof shows);
        console.log(`I've found the following upcoming shows for ${band}:`);
        console.log('');
        for (i=0;i<shows.length;i++){
            // console.log(shows[i]);
            let show = shows[i];
            let venueName = show.venue.name;
            let location = show.venue.city + ", " + show.venue.region;
            let date = show.datetime;
            console.log('');
            console.log("Venue: " + venueName);
            console.log("Location: " + location);
            console.log("Date: " + moment(date).format("MM-DD-YYYY"));
            console.log('-------------------------------------------------------------');
        }
        if (shows.length === 0){
            // console.log(response);
            console.log(`I'm sorry, it looks like there are no upcoming shows for ${band}`);
        }
        for (var key in response.data){
            // console.log(key);
        }
    }).catch(function (error) {
        // handle error
        console.log("Hmm, I didn't understand that. Try a different search maybe?");
    }).finally(function () {
        // always executed
        reinitPrompt();
    });
}
function movie(movie){
    console.log('running movie()');
    axios.get(`http://www.omdbapi.com/?apikey=${omdbKey}&t=${movie}`).then(function(response){
        // console.log(response);
        let movieInfo = response.data;
        console.log(movieInfo.Title);
        console.log("Year released: " + movieInfo.Year);
        console.log("     " + movieInfo.Plot);
    }).catch(function(err){
        console.log(err);
    }).finally(function(){
        reinitPrompt();
    });
}
function randomLiri(){
    console.log('running randomLiri()');
    let liriFaveList = fs.readFile('./random.txt', {encoding: 'utf-8'}, (err,data) => {
        if (err) throw err;
        let liriFaves = data.split(',');
        let randoFave = liriFaves[Math.floor(Math.random() * liriFaves.length)];
        console.log(randoFave);
        let command = cleanSpaces(randoFave.split(':')[0]);
        let search = cleanSpaces(randoFave.split(':')[1]);
        console.log(`###${command}###`);
        searchEngine(command, search);
    });
}
function cleanSpaces(string){
    let leadingSpace = /^\s+/;
    let trailingSpace = /\s+$/;
    console.log(`cleaning spaces for ${string}`);
    let cleanString = string.replace(leadingSpace,'').replace(trailingSpace,'');
    console.log(cleanString);
    return cleanString;
}
function spotifyThis(song){
    console.log('Searching Spotify for ' + song + '...');
    var spotify = new Spotify(keys.spotify);
    spotify.search({ 
        type: 'track', 
        query: song,
        limit: 5
    }).then(function(response) {
        var songs = response.tracks.items;
        // console.log(songs);
        if (songs.length <= 4){
            console.log("I found " + songs.length + " potential matches for '"+song+"'.")
        } else {
            console.log("Here are the first 20 matches I found for that search.")
        }
        for(i=0;i<songs.length;i++){
            console.log(' ');
            console.log('Song: ' + songs[i].name);
            console.log('Artist: ' + songs[i].artists[0].name);
            console.log('Album: ' + songs[i].album.name);
            console.log('Open in Spotify: ' + songs[i].external_urls.spotify);
            console.log("---------------------------------------------------------")
        }
    }).catch(function(err){
        console.log(err);
        console.log(`I'm sorry, ${song} doesn't look like anything to me.`);
    }).finally(function(){
        reinitPrompt();
    });
}
function getSearchTerm(command){
    console.log(command);
    inquirer.prompt([{
        type: 'input',
        name: 'term',
        message: "Please enter your search"
    }]).then(answers => {
        // console.log(answers.term);
        let term = answers.term;
        searchEngine(command, term);
    });
}
function initPrompt(){
    console.log('');
    console.log('');
    inquirer.prompt([
        {
            type: 'list',
            name: 'command',
            message: 'What would you like to search?',
            choices: [
                {
                    name: "See where a band or artist is playing.",
                    value: 'band'
                },
                {
                    name: "Look up information about a song.",
                    value: 'song'
                },
                {
                    name: "Look up information about a movie.",
                    value: 'movie'
                },
                {
                    name: "Do what Liri wants.",
                    value: 'random'
                }
            ]
        }
    ]).then(answers => {
        // console.log(JSON.stringify(answers, null, '  '));
        command = answers.command;
        if (command === "random"){
            randomLiri();
        } else {
            getSearchTerm(command);
        }
        // console.log(command);
        
      });
}
function reinitPrompt(){
    console.log('');
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'reinit',
            message: 'Anything else you\'d like to search for?',
            
        }
    ]).then(answers => {
        if (answers.reinit){
            initPrompt()
        } else {
            console.log("Thank you, have a nice day.");
        }
    })
}
function searchEngine(command, term){
    switch(command){
        case 'band':
            bandsInTown(term)
            break;
        case 'song':
            spotifyThis(term)
            break;
        case 'movie':
            movie(term)
            break;
    }
}
initPrompt();


