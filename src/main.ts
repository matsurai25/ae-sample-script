/// <reference types="types-for-adobe/aftereffects/2018"/>

(function(){
  var activeItem = app.project.activeItem;
  if ( !(activeItem instanceof CompItem) ) {
    alert('No comp is selected.');
    return;
  };

  var activeLayers = activeItem.selectedLayers;
  for (let i = 0; i < activeLayers.length; i++) {
    const layer = activeLayers[i];
    $.writeln(layer.name)
  }
})();