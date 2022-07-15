var textarea = document.querySelector("textarea");
textarea.focus();

var rememberedText = localStorage.getItem("simple-notepad");
var yes = !rememberedText || confirm("Restore previous?");
textarea.value = yes && rememberedText ? rememberedText : "";
updateTextareaWidth();
textarea.classList.add("ready-to-edit");

textarea.addEventListener("keydown", function () {
  updateTextareaWidth();
});

function updateTextareaWidth() {
  textarea.setAttribute(
    "cols",
    1 +
      Math.max(
        0,
        Math.max.apply(
          null,
          textarea.value.split("\n").map(function (line) {
            return line.length;
          })
        )
      )
  );
}

textarea.addEventListener("keyup", function () {
  localStorage.setItem("simple-notepad", textarea.value);
});

window.addEventListener("beforeunload", function (e) {
  localStorage.setItem("simple-notepad", textarea.value);
});

document.addEventListener(
  "keydown",
  function (e) {
    if (
      (e.key === "s" || e.keyCode === 83) &&
      (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
    ) {
      e.preventDefault();
      var data = textarea.value;
      var filename = "notepad.txt";
      var type = "text/plain;charset=utf-8";
      download(data, filename, type);
    }
  },
  false
);

function download(data, filename, type) {
  var file = new Blob([data], { type: type });

  var isIE10OrLater = window.navigator.msSaveOrOpenBlob;
  if (isIE10OrLater) {
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else {
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
