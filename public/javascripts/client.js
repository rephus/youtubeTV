function onPlayerReady(event) {
  event.target.playVideo();
  console.log("Player ready"); 
}

function onPlayerStateChange(event) {
  /*YT.PlayerState.UNSTARTED
    YT.PlayerState.ENDED
    YT.PlayerState.PLAYING
    YT.PlayerState.PAUSED
    YT.PlayerState.BUFFERING
    YT.PlayerState.CUED*/
  console.log("Player state change " + event.data) ; 
  if (event.data == YT.PlayerState.ENDED) loadRandomVideo();
  //player.stopVideo();
}

var loadRandomVideo = () => {
  //Remove old iframe if exists and reload div
  $('.videoWrapper').html(     
     '<div id="player"></div>'
  );
  const url = '/random';
  $.getJSON(url, function(result){
    var videoId = result.contentDetails.videoId; 
    console.log("Loaded video " + videoId); 

    $("#channel").html(result.snippet.channelTitle); 
    $("#video").html(result.snippet.title); 
    
    var youtubeUrl = "https://www.youtube.com/embed/"+videoId+"?autoplay=true&enablejsapi=1&version=3";
    //$('#player').attr('src',youtubeUrl);  
    var player = new YT.Player('player', {
      height: '360',
      width: '640',
      videoId: videoId,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });

  });
}

$( document ).ready(function() {
  loadRandomVideo(); 
  $('#next').click(loadRandomVideo); 
  
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function onYouTubeIframeAPIReady() {
    loadRandomVideo();     
  }

});

$('#login').click(function() {
  //TODO Login
});