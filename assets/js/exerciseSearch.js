$(document).foundation();
var searchButtonEl = $("#searchButton");
var selectedMuscleEl = $("#selectedMuscle");
var cardContainerEl = $("#cardContainer");


function fetchExercises(muscle){
    fetch('https://api.api-ninjas.com/v1/exercises?muscle='+muscle,{
        method: 'GET',
        headers: { 'X-Api-Key': 'spjQj99sWzMNjH9CAJCGCQ==0gLFt2HDIgGvt3ea'},
        contentType: 'application/json'
    }).then(function(response){
        if(response.ok){
            return response.json();
        }
    }).then(function(data){
        console.log(data);
        for(i in data){
            var card = $("<div class='card radius cell small-3' >");
            var cardHeader = $("<div class='card-divider'>");
            var headerText = $("<h3>").text(data[i].name);
            
            cardHeader.append(headerText);
            
            var cardSection = $("<div class='card-section customSection'>");
            var equipment = $("<p>");
            var equipmentB = $("<b>").text("Equipment: "); 
            var equipmentText = $("<span>").text(data[i].equipment);
            
            equipment.append(equipmentB, equipmentText);
            cardSection.append(equipment);

            var difficulty = $("<p>");
            var difficultyB = $("<b>").text("Difficulty: "); 
            var difficultyText = $("<span>").text(data[i].difficulty);

            difficulty.append(difficultyB, difficultyText);
            cardSection.append(difficulty);

            var cardDivider = $("<div class='card-divider customDivider'>");
            var instructions = $("<div class='dropdown-pane' data-position='top' data-alignment='center' id='instructions-dropdown"+i+"' data-dropdown>").text(data[i].instructions);
            var instructionsButton = $("<button class='button radius exerciseInfoButton' type='button' data-toggle='instructions-dropdown"+i+"'>").text("Instructions");
            
            cardDivider.append(instructionsButton, instructions);

            card.append(cardHeader, cardSection, cardDivider);

            cardContainerEl.append(card);
        }
        $(document).foundation();
    });
}

searchButtonEl.click(function(event){
    event.preventDefault();
    fetchExercises(selectedMuscleEl.val());
})
