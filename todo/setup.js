document.getElementById("text").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        saveItem();
    }
});

document.getElementById("datePicker").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        saveItem();
    }
});

document.getElementById("checkBox").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        saveItem();
    }
});

document.getElementById("checkBox").addEventListener("click", function(event) {
    loadItems();
});