var textarea = document.querySelector("textarea");
textarea.focus();

/**

## TODO

- #1: if yes, read text file: <https://codepen.io/hchiam/pen/xxLWbop>
- #3: add saving upon closing

 */

var rememberedText = localStorage.getItem("simple-notepad");
var yes = confirm("Restore previous?");
textarea.value = yes && rememberedText ? rememberedText : "";

textarea.addEventListener("keyup", function () {
  localStorage.setItem("simple-notepad", textarea.value);
});

window.addEventListener("beforeunload", function (e) {
  localStorage.setItem("simple-notepad", textarea.value);
  var confirmationMessage = "o/";

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Webkit, Safari, Chrome
});
