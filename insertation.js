elem = document.getElementById("troll-blocker-js-tag")
if(!elem){
  var troll_blocker = chrome.extension.getURL("script/troll-blocker.js");
  var troll_blocker_css = chrome.extension.getURL("css/troll-blocker.css");
  var troll_blocker_script = document.createElement('script');
  var troll_blocker_link = document.createElement('link'); 

  troll_blocker_script.id = 'troll-blocker-js-tag'; 
  troll_blocker_script.src = troll_blocker;

  troll_blocker_link.id='soundalerter-css-tag';
  troll_blocker_link.href = troll_blocker_css;
  troll_blocker_link.rel = "stylesheet";
  troll_blocker_link.type = "text/css";

  //document.write("<script src='"+troll_blocker_script+"' id='troll-blocker-js-tag'></script>");
  
  document.getElementsByTagName('head')[0].appendChild(troll_blocker_script);
  document.getElementsByTagName('head')[0].appendChild(troll_blocker_link);
}