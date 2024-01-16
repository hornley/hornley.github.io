function opendata(form) {
    var selectedIndex = form.elements['ProjectSelections'].selectedIndex;
    var url = form.elements["ProjectSelections"].options[selectedIndex].value;
    window.open(url);
}