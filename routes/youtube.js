// Youtube code samples: https://developers.google.com/youtube/v3/code_samples/code_snippets

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR =  '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, requestData, callback, nextCallback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      //TODO add callbacks here
      console.log("get new token"); 
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log("Got credentials, calling callback ", requestData); 
      
      callback(oauth2Client, requestData, nextCallback);
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
  token.expiry_date = 1894842636000; //Set expiry to 2030
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}
// Sample nodejs code for subscriptions.list

function playlistItemsListByPlaylistId(auth, requestData, callback) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  service.playlistItems.list(parameters, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(response);
    callback(response.data); 
  });
}


function playlistsListByChannelId(auth, requestData, callback) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;

  service.playlists.list(parameters, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    callback(auth,response.data); 
  });
}

function getSubscriptions(auth, requestData, callback) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.subscriptions.list(parameters, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      callback(auth,response.data); 
    });
  }
  
                   
var express = require('express');
var router = express.Router();

var randomArray = (array) => {
  return array[Math.floor(Math.random()*array.length)];
  
}

/* GET home page. */
router.get('/random', function(req, res, next) {

    // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    //authorize(JSON.parse(content), getChannel);
    
    var getPlaylistItemsCallback = (playlistItems) => {
      var randomVideo = randomArray(playlistItems.items); 
      console.log("Loading video ", randomVideo.snippet.title); 
      
       var videoId = randomVideo.contentDetails.videoId; 
        res.json(randomVideo); 
    }
    var getPlaylistsCallback = (auth, playlists) => {
      var randomPlaylist = randomArray(playlists.items); 
      var playlistId = randomPlaylist.id; 
      console.log("Loading playlist ", randomPlaylist.snippet.title); 
      
      var parameters = {'params': 
      { playlistId: playlistId,
        maxResults:  25,
        part: 'snippet,contentDetails'
      }};
      playlistItemsListByPlaylistId(auth, parameters, getPlaylistItemsCallback); 
  
    }
    var getSubscriptionCallback = (auth,subscriptions) => {
      var randomSub = randomArray(subscriptions.items);
      var channelId = randomSub.snippet.resourceId.channelId; 
      console.log("Loading channel playlist " + randomSub.snippet.title); 
      var parameters = {'params': {
        'maxResults': 25,
        'channelId': channelId,
        'part': "snippet"
      }}
      playlistsListByChannelId(auth, parameters, getPlaylistsCallback);
        //res.json(subscriptions); 
    }
    var requestParams = { 'params':  {
      'mine': 'true', 
      'part': 'snippet', 
      'maxResults': 25,
      //pageToken:  nextPageToken,
    }}; 
    authorize(JSON.parse(content),  
      requestParams ,
      getSubscriptions, 
      getSubscriptionCallback
    );
  });
});

module.exports = router;

