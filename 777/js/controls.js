// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

// // Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//     output.innerHTML = this.value;
// }

$(function() {
    $("#slider").slider({
        value: 2,
        min: 1,
        max: 10,
        step: 0.1,
        slide: function(event, ui) {
            $("#idwpower").val("$" + ui.value);
        }
    });
    $("#idwpower").val("$" + $("#slider").slider("value"));
});