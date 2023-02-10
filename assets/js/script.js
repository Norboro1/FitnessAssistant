const token = 'f56350323de774e7aaf1d605e1cb07985f350a92'
$(document).foundation();

var todayEl=$("#today");
var today = dayjs();

todayEl.text(today.format('dddd, MMM D'));

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

