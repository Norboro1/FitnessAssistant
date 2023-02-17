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

//get workouts from local storage, or create array using example workout and save to local storage.
var workouts = JSON.parse(localStorage.getItem('workouts'));


if(!workouts){
    workouts = [];
    workouts.push(chestDay);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}


var workoutCardsEl = $("#workoutCards");
var addWorkoutButtonEl = $("#addWorkoutButton");
var saveWorkoutButtonEl = $("#saveWorkoutButton");
var addExerciseButtonEl = $("#addExcerciseButton");
var removeExerciseButtonEl = $("#removeExerciseButton");
var finalDeleteButton = $("#finalDelete");

// Declare variables to keep track of amount of exercises on the form, and which workout the user has selected to delete.
var exerciseCount = 1;
var deleteChoice;
//Hides the remove exercise button on add workout form by default so user cannot delete all exercises from the form
removeExerciseButtonEl.hide();

//Same Youtube IFrame Player API code from script.js, refer to comments there
// 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
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

//Same Youtube Data API code from script.js, refer to comments there
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

//function to load and render workouts to the page from workouts array, as well as render the Add Workout button.
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
            var linkButton = $("<button class='link-button' data-attr-workout=\'"+workouts[i].exercises[x].exercise +"\' data-open='youtubePlayer'>");
            linkButton.text("Video");
            line.text(workouts[i].exercises[x].sets + "X " +workouts[i].exercises[x].exercise + " " + workouts[i].exercises[x].reps + " reps");
            line.append(linkButton);
            section.append(line);
        }

        var deleteButton = $("<button class='button radius delete' data-open='deleteWorkoutModal'>").text("X")
        header.append(deleteButton);

        card.append(header, section);
        workoutCardsEl.append(card);
    }

    var buttonCard = $("<div class='card radius bordered shadow cell small-2'>");
    var buttonCardDiv = $("<div class='card-section button-card'>");
    var buttonCardButton = $("<button class='button' id='addWorkoutButton' data-open='addWorkoutModal'>").text('+');

    buttonCardDiv.append(buttonCardButton);
    buttonCard.append(buttonCardDiv);
    workoutCardsEl.append(buttonCard);
    
}

function handleClientLoad(){
    gapi.load("client");
    loadClient();
}

//Same as event listener in script.js to load embedded youtube video from "Video" link button.
workoutCardsEl.on('click', 'button', async function(){
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

//Event listener which loads and renders a new exercise line on the add workout form, up to 8 before hiding the button to do so.
addExerciseButtonEl.click(function(event){
    event.preventDefault();

    var excerciseLine = $("<div class='grid-x grid-padding-x  align-justify' id='exercise"+exerciseCount+"'>");
    var sets = $("<div class='medium-2 cell'>");
    var setsLabel = $("<label>").text('Sets');
    var selectSets = $("<select id='select"+exerciseCount+"'>");
    for(i=1; i<5; i++){
        var selectOption = $("<option value="+i+">").text(i);
        selectSets.append(selectOption);
    }
    setsLabel.append(selectSets);
    sets.append(setsLabel);

    var exerciseDiv = $("<div class='medium-8 cell'>");
    var exerciseLabel = $("<label>").text('Exercise');
    var exerciseInput = $("<input type='text' placeholder='Hammer Curls' id='exerciseName"+exerciseCount+"' required />");

    exerciseLabel.append(exerciseInput);
    exerciseDiv.append(exerciseLabel);

    var reps = $("<div class='medium-2 cell'>");
    var repsLabel = $("<label>").text('Reps');
    var repsInput = $("<input type='text' placeholder='7-10' id='reps"+exerciseCount+"' required />");

    repsLabel.append(repsInput);
    reps.append(repsLabel);
    excerciseLine.append(sets, exerciseDiv, reps);
    $("#formExercises").append(excerciseLine);

    exerciseCount++;
    if(exerciseCount == 2){
        removeExerciseButtonEl.show();
    }
    if(exerciseCount >= 8){
        addExerciseButtonEl.hide();
    }
});

//Event listener which removes the last exercise line from the add workout form down to 1 before the button is hidden.
removeExerciseButtonEl.click(function(event){
    event.preventDefault();
    console.log($(this).siblings(0).children().last());
    $(this).siblings(0).children().last().remove();

    exerciseCount--;
    if(exerciseCount < 2){
        removeExerciseButtonEl.hide();
    }
})

//Event listener on form submit to save input to workouts array and localstorage. Yes I used an alert incase the user enters a workout name that already exists
//bite me, there are already so many Modals in this app Dx
$("#workoutForm").submit(function(event){
    for(i in workouts){
        if ($("#workoutName").val().toLowerCase() == workouts[i].name.toLowerCase()){
            window.alert('This workout name matches an existing workout. Please make it unique.');
            event.preventDefault();
            return;
        }
    }


    var newWorkout = {
        name: $("#workoutName").val(),
        exercises: []
    }

    for(i=0;i<exerciseCount;i++){
        console.log("sets: " + $("#select"+i).val()+" / exercise: " + $("#exerciseName"+i).val() + " / reps: " + $("#reps"+i).val());
        var thisExercise = {
            sets: $("#select"+i).val(),
            exercise: $("#exerciseName"+i).val(),
            reps: $("#reps"+i).val()
        }

        newWorkout.exercises.push(thisExercise);
    }

    workouts.push(newWorkout);
    console.log(workouts);

    localStorage.setItem('workouts', JSON.stringify(workouts));
    location.reload();
});

//same as script.js, stops video on closing modal
$("#youtubePlayer").on('closed.zf.reveal', function(){
    stopVideo();
})

//init and THEN event listener for delete buttons on workout cards which saves the workouts, filtered by the one they selected to delete, until they accept the modal prompt, 
//choose a different workout to delete, or refresh the page.
loadWorkouts();

$(".delete").click(function(){
    var thisWorkoutName = $(this).siblings('h4', 0).text();
    console.log(thisWorkoutName);
    deleteChoice = workouts.filter(function (el){
        return el.name !== thisWorkoutName;
    });

    console.log(deleteChoice);
});

finalDeleteButton.click(function(){
    workouts = deleteChoice;
    localStorage.setItem('workouts', JSON.stringify(workouts));
    location.reload();
});