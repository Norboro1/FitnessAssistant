const token = 'f56350323de774e7aaf1d605e1cb07985f350a92'
$(document).foundation();
var youtubeKey = 'AIzaSyBYb7dCrNGQqPVCzFFXT0zP84WvbHj-3_Q';
var chestDay = {
    name: 'Chest Day',
    exercises: [{
    sets: 3,
    exercise: "Bench Press",
    reps: '7-10'
},
{
    sets: 4,
    exercise: "Dumbbell Press",
    reps: '7-10'
},
{
    sets: 4,
    exercise: "High cable flys",
    reps: '10-15'
}]
}

var editWorkoutsButton = $("#editWorkouts");
var workoutCardsEl = $("#workoutCards");
var workoutSelectorEl = $("#workoutSelector");
var selectedDayEl = $("#selectedDay");
var workoutScheduleEl = $("#workoutSchedule");
var scheduleFormEl = $("#scheduleForm");
var clearScheduleButton = $("#clearSchedule");
var workoutModalEl = $("#workoutModal");
var todayEl=$("#today");
var today = dayjs();
var daySelected;

var workouts = JSON.parse(localStorage.getItem('workouts'));
var schedule = JSON.parse(localStorage.getItem('schedule'));

if(!schedule){
    schedule = [];
    localStorage.setItem('schedule', JSON.stringify(schedule));
}

if(!workouts){
    workouts = [];
    workouts.push(chestDay);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

todayEl.text(today.format('dddd, MMM D'));

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}
// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}

function loadClient() {
    gapi.client.setApiKey(youtubeKey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err);
            });
  }

function execute(workout) {
return gapi.client.youtube.search.list({
    "part": [
      "snippet"
    ],
    "maxResults": 1,
    "q": workout + " form",
    "videoDuration": "short",
    "type": "video"
})
     .then(function(response) {
             // Handle the results here (response.result has the parsed body).
             console.log("Response", response);
             var videoLink = /*youtubeLink +*/ response.result.items[0].id.videoId;
             return videoLink;
           },
           function(err) { console.error("Execute error", err);
           window.alert('Could not Load Video. Likely Quota exceeded.');
           location.reload();
         });
}

function handleClientLoad(){
    gapi.load("client");
    loadClient();
}

//var imageEl = $("#image")

/*fetch("https://wger.de/api/v2/exercise/?muscles=1")
.then(function(result){
    return result.json()
}).then(function(data){
    console.log(data.results);
    fetch("https://wger.de/api/v2/exerciseinfo/"+data.results[0].id)
    .then(function(result){
        return result.json()
    }).then(function(data){
        console.log(data);
        imageEl.attr('src', data.images[0].image);
    });
});*/

function loadWorkouts() {

    for(i in workouts){
        var card = $("<div class='card radius bordered shadow cell shrink'>");
        var header = $("<div class='card-divider'>");
        var headerText = $("<h4>");
        var section = $("<div class='card-section'>");

        headerText.text(workouts[i].name);
        header.append(headerText);

        for(x in workouts[i].exercises){
            var line = $("<p>");
            line.text(workouts[i].exercises[x].sets + "X " +workouts[i].exercises[x].exercise + " " + workouts[i].exercises[x].reps + " reps");
            section.append(line);
        }

        card.append(header, section);
        workoutCardsEl.append(card);

        var selectOption = $("<option>").text(workouts[i].name);

        workoutSelectorEl.append(selectOption);
    }
}

function loadSchedule(){
    for(i=0; i<7; i++){
        var tableDay = $("#day"+i)
        console.log(tableDay.attr('data-attr-day'));

        for(x in schedule){
            if(tableDay.attr('data-attr-day') == schedule[x].day){
                tableDay.empty();
                var workoutScheduleButton = $("<button class='button expanded rounded scheduleButton' data-open='workoutModal'>").text(schedule[x].workout);
                tableDay.append(workoutScheduleButton);
            }
        }
    }
}

function loadWorkoutModal(nameChoice){
    workoutModalEl.empty();

    var selectedWorkout = workouts.filter(function(el){
        return el.name == nameChoice;
    })[0];

    var card = $("<div class='card radius bordered shadow cell shrink'>");
    var header = $("<div class='card-divider'>");
    var headerText = $("<h4>").text(selectedWorkout.name);
    var section = $("<div class='card-section'>");

    header.append(headerText);

    for(i in selectedWorkout.exercises){
        var line = $("<p>");
        var linkButton = $("<button class='link-button' data-attr-workout=\'"+selectedWorkout.exercises[i].exercise +"\' data-open='youtubePlayer'>");
        linkButton.text("Video");
        line.text(selectedWorkout.exercises[i].sets + "X " +selectedWorkout.exercises[i].exercise + " " + selectedWorkout.exercises[i].reps + " reps");
        line.append(linkButton);
        section.append(line);
    }

    card.append(header, section);

    workoutModalEl.append(card);
}

editWorkoutsButton.click(function(){
    window.location = '../../workouts.html';
});

workoutScheduleEl.on('click', 'button', function(){
    daySelected = $(this).parent().attr('data-attr-day')
    selectedDayEl.text(daySelected);

    if($(this).attr('data-open') == 'workoutModal'){
        loadWorkoutModal($(this).text());
    }
});

scheduleFormEl.submit(function(event){
    var dayChoice = {
        day: daySelected,
        workout: workoutSelectorEl.val()
    }

    for(i in schedule){
        if (schedule[i].day == daySelected){
            schedule.splice(i, 1);
        }
    }

    schedule.push(dayChoice);
    localStorage.setItem('schedule', JSON.stringify(schedule));
})

clearScheduleButton.click(function(){
    schedule = [];
    localStorage.setItem('schedule', JSON.stringify(schedule));
    location.reload();
})

workoutModalEl.on('click', 'button', async function(){
    if($(this).attr('data-attr-workout')){
        var linkTest = await execute($(this).attr('data-attr-workout'));
        console.log(linkTest);

        if(player){
            player.destroy();
        }

        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: linkTest,
            playerVars: {
              'playsinline': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
    } 
})

$("#youtubePlayer").on('closed.zf.reveal', function(){
    stopVideo();
})

loadWorkouts();
loadSchedule();