/// <reference types="types-for-adobe/aftereffects/2018"/>

(function(){
  var AC = app.project.activeItem;
  if (AC instanceof CompItem) {
  } else {
    alert("No comp is selected.");
    return false;
  };

  var AL = AC.selectedLayers;
  for (let i = 0; i < AL.length; i++) {
    const layerF = AL[i];
    $.writeln(layerF.name)
  }
})();