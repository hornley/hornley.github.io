function navBar() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

function BugWarsGameResolutionCheck() {
  if (window.screen.height !== 1080 && window.screen.width !== 1920) {
    if (confirm("Incompatible resolution!")) {
      window.location.href = "/Game/"

    }
  }
}

function HomeLogo() {
  window.location.href = "/"
}