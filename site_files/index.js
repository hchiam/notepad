var textarea = document.querySelector("textarea");
textarea.focus();

var rememberedText = localStorage.getItem("simple-notepad");
var yes = !rememberedText || confirm("Restore previous?");
textarea.value = yes && rememberedText ? rememberedText : "";

textarea.addEventListener("keyup", function () {
  localStorage.setItem("simple-notepad", textarea.value);
});

window.addEventListener("beforeunload", function (e) {
  localStorage.setItem("simple-notepad", textarea.value);
});
