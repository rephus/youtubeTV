// Youtube code samples: https://developers.google.com/youtube/v3/code_samples/code_snippets

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR =  '.credentials/';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function  authorize(userId, credentials, requestData, callback, nextCallback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  var filename = TOKEN_DIR + "youtube-"+userId+".json";   
  fs.readFile(filename, function(err, token) {

    if (err) {
      console.log("Token doesn't exist, need to login first"); 
      return; 
    } else {
      var time = new Date().getTime(); 
      oauth2Client.credentials = JSON.parse(token);      
      
      if (oauth2Client.credentials.expiry_date < time){
        console.log("Token has already expired, refreshing token");
        //fs.unlink(filename); 
        oauth2Client.refreshToken(oauth2Client.credentials.refresh_token).then(function(tokens, res){
          
          var newToken =  tokens.tokens;
          newToken['refresh_token'] = oauth2Client.credentials.refresh_token;
          storeToken(userId, newToken); 
          oauth2Client.credentials =  newToken; 

          callback(oauth2Client, requestData, nextCallback);
        });
      } else {
        console.log("Got credentials, calling callback ", requestData); 
        callback(oauth2Client, requestData, nextCallback);
      }
     
    }
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(userId, token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  var filename = TOKEN_DIR + "youtube-"+userId+".json"; 
  fs.writeFile(filename, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + filename);
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

router.get('/login', function(req, res) {
  var userId = req.query.user_id; 
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    var credentials = JSON.parse(content); 
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];  
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES, 
      state: userId , 
      prompt: "consent"
      //approval_prompt: "force"
    });
    res.redirect(authUrl);

  });
});

router.get('/login_callback', function(req, res) {
  var code = req.query.code; 
  var userId =  req.query.state; 
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    var credentials = JSON.parse(content); 
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];  
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(userId, token);
      res.redirect('/');
    });
  });
});

router.get('/is_logged', function(req, res) {
  var userId = req.query.user_id;   
  var filename = TOKEN_DIR + "youtube-"+userId+".json";     
  fs.readFile(filename, function(err, token) {
      res.json({'is_logged': err?false:true});
  });

});

router.post('/subscriptions', function(req, res){
  var userId = req.query.user_id;     
  var channels = req.body.channels; 
  console.log("Disabling channels ", channels);
  res.json({});
});

router.get('/subscriptions', function(req, res){
  var userId = req.query.user_id;   
  
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    var getSubscriptionCallback = (auth,subscriptions) => {
      res.json(subscriptions.items); 
    }
    var requestParams = { 'params':  {
      'mine': 'true', 
      'part': 'snippet', 
      'maxResults': 25,
      //pageToken:  nextPageToken,
    }}; 
    authorize(userId, 
      JSON.parse(content),  
      requestParams ,
      getSubscriptions, 
      getSubscriptionCallback
    );
  });

});

router.get('/random', function(req, res, next) {
  var userId = req.query.user_id;   
  
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
    authorize(userId, 
      JSON.parse(content),  
      requestParams ,
      getSubscriptions, 
      getSubscriptionCallback
    );
  });
});

module.exports = router;

