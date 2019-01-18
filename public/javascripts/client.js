/**
 * Get or create userId to authenticate users agains the server
 */
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
var userId = localStorage.getItem("userId");
if (!userId) {
  userId = guid(); 
  localStorage.setItem("userId", userId);
}


/**
 * Send to the server the list of channels that we don't want to 
 * show on the random selection of videos
 */
var updateChannels = () => {
  var disabledSubsciptions = $(".subscription.not_active");
  var channels = []; 
  for (var i =0 ; i <disabledSubsciptions.length; i++){
    var channel = disabledSubsciptions[i].id; 
    channels.push(channel); 
  }  
  $.ajax({
    type: "POST",
    url: '/subscriptions?user_id='+userId,
    traditional: true,
    data: {'channels': channels, 'foo': 'bar'}
  });
}

/**
 * Get all subscriptions from the user so he can 
 * select which subscriptions want to disable from the random
 */
var loadSubscriptions = () => {
  $.getJSON('/subscriptions?user_id='+userId, function(result){
    var $div = $("#subscriptions");
    for (var i = 0 ; i < result.length; i++) {
      var subscription = result[i];
      var thumbnail = subscription.snippet.thumbnails.default.url; 
      var title = subscription.snippet.title;
      var channelId = subscription.snippet.resourceId.channelId; 
      var $button = $("<a href='#' id='"+channelId+"' class='subscription active'><img src='"+thumbnail+"'/> "+title+"</a>")
      $button.click(function(){
        $(this).toggleClass("active");
        $(this).toggleClass("not_active");

        updateChannels(); 
      });
      $div.append($button); 
    }
  });
}
/**
 * Get a random video from the subscriptions
 */
var loadRandomVideo = () => {
  //Remove old iframe if exists and reload div
  $('.videoWrapper').html(     
     '<div id="player"></div>'
  );
  const url = '/random?user_id='+userId;
  $.getJSON(url, function(result){
    var videoId = result.contentDetails.videoId; 
    $("#channel").html(result.snippet.channelTitle); 
    $("#video").html(result.snippet.title); 
    
    var youtubeUrl = "https://www.youtube.com/embed/"+videoId+"?autoplay=true&enablejsapi=1&version=3";
    //$('#player').attr('src',youtubeUrl);  
    var player = new YT.Player('player', {
      height: '360',
      width: '640',
      videoId: videoId,
      events: {
        'onReady': function(event){event.target.playVideo()},
        'onStateChange': function onPlayerStateChange(event) {
          if (event.data == YT.PlayerState.ENDED) loadRandomVideo();
        }
      }
    });
  });
}

$( document ).ready(function() {

  $('#login').attr('href', '/login?user_id='+userId); 
  $.getJSON('/is_logged?user_id='+userId, function(result){
      if(result.is_logged) {
        $('.is_logged').show();
        $('.not_logged').hide();

        loadRandomVideo(); 
        //loadSubscriptions(); 
      } else {
        $('.is_logged').hide();
        $('.not_logged').show();
      }
  });

  $('#next').click(loadRandomVideo); 

  function onYouTubeIframeAPIReady() {
    loadRandomVideo();     
  }

});
