//loads Foundation elements
$(document).foundation();
//declare API key, Example workout, and jquery variables for elements.
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

//get workouts and schedule from localstorage, if it doesn't exist, creates empty array or array with example workout, and sets to localstorage
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

//The following through line 78 is code from Youtube's IFrame player API that creates an embedded video player on the page.
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

//This loads the gapi client necessary to use Youtube's Data API
function loadClient() {
    gapi.client.setApiKey(youtubeKey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err);
            });
  }

//Runs Youtube Data API Search function using parameter + " form" and returns the Video ID of the first result.
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

//Function to load and render workouts onto the page from the workouts array.
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

//Function to load and render the schedule buttons based on the schedule array.
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

//Function to render content in the Workout modal displaying workout info when user clicks it from the schedule.
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

//Event listener on the schedule that either pops up the Workout Selector Modal for the day selected or the workout modal if a workout was added to the schedule and clicked.
workoutScheduleEl.on('click', 'button', function(){
    daySelected = $(this).parent().attr('data-attr-day')
    selectedDayEl.text(daySelected);

    if($(this).attr('data-open') == 'workoutModal'){
        loadWorkoutModal($(this).text());
    }
});

//Event listener on submitting the schedule form that will add the day and workout selected to the schedule.
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

//Event listener to clear the schedule and reload page
clearScheduleButton.click(function(){
    schedule = [];
    localStorage.setItem('schedule', JSON.stringify(schedule));
    location.reload();
})

//Event listener for video links in the workout modal which uses Youtube API and the name of the exercise to then create and load an embedded video player
//With the video ID obtained from the execute function. If there is already a player active it deletes it, to prevent bugs or doubling up.
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

//Event listener for when the youtubePlayer modal is closed to stop playing the Video.
$("#youtubePlayer").on('closed.zf.reveal', function(){
    stopVideo();
})

//initializes page
loadWorkouts();
loadSchedule();

