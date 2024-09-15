var screenWidth = window.innerWidth > 0 ? window.innerWidth : screen.width;
var isLikelyMobile = screenWidth < 550;

var body = document.querySelector("body");
var textarea = document.querySelector("textarea");
var div = document.querySelector("div");
var input = document.querySelector("input");
textarea.focus();

var selectionText = "";
var selectionsCount = 0;
var selections = [];

var rememberedText = localStorage.getItem("simple-notepad");
var yes = !rememberedText || confirm("Restore previous?");
if (!yes) yes = !confirm("Are you sure you want to \nCLEAR/DELETE previous?");
textarea.value = yes && rememberedText ? rememberedText : "";
updateTextareaStyles();
updateDivText();
textarea.classList.add("ready-to-edit");

if (textarea.value.startsWith('futhark\n')) {
  document.body.classList.add('futhark');
}

textarea.addEventListener("keydown", function () {
  updateTextareaStyles();
});
textarea.addEventListener("keyup", function () {
  updateTextareaStyles();
});

input.addEventListener("keyup", function (e) {
  if (
    e.key === "Enter" ||
    e.keyCode === 13 ||
    e.key === "Escape" ||
    e.keyCode === 27
  ) {
    if (input.value) replaceSelections();
    selectionText = "";
    selectionsCount = 0;
    selections = [];
    input.value = "";
    updateTextareaStyles();
    updateDivText();
    input.style.display = "none";
    textarea.focus();
  }
});

function updateTextareaStyles() {
  updateTextareaWidth();
  updateTextareaPosition();
  updateDivOverlayShape();
}

function updateTextareaWidth() {
  var minWidth = isLikelyMobile ? 30 : 0;
  textarea.setAttribute(
    "cols",
    1 +
    Math.max(
      minWidth,
      Math.max.apply(
        null,
        textarea.value.split("\n").map(function (line) {
          return line.length;
        })
      )
    )
  );
}

function updateDivOverlayShape() {
  var positionInfo = textarea.getBoundingClientRect();
  div.style.width = textarea.offsetWidth + "px";
  div.style.left = Math.round(positionInfo.x);
  div.style.top = Math.round(positionInfo.y);

  var haveTextareaOverflow = textarea.offsetWidth > body.offsetWidth;
  div.style.position = haveTextareaOverflow ? "absolute" : "";
  div.style.left = haveTextareaOverflow ? 0 : "";
  div.style.paddingLeft = textarea.style.paddingLeft;
}

function updateTextareaPosition() {
  var haveTextareaOverflow = textarea.offsetWidth > body.offsetWidth;
  textarea.style.position = haveTextareaOverflow ? "absolute" : "";
  textarea.style.left = haveTextareaOverflow ? 0 : "";
}

textarea.addEventListener("click", function () {
  updateDivText();
});

textarea.addEventListener("keyup", function (e) {
  if (textarea.value.startsWith('futhark\n')) {
    document.body.classList.add('futhark');
    textarea.value = 'futhark\n' + translateToFuthark(textarea.value.replace(/^futhark\n/, ''))
  } else {
    document.body.classList.remove('futhark');
  }
  localStorage.setItem("simple-notepad", textarea.value);
  multiSelect();
  updateDivText();
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
      var filename = "notepad" + getTimeStamp() + ".txt";
      var type = "text/plain;charset=utf-8";
      download(data, filename, type);
    } else if (
      (e.key === "d" || e.keyCode === 68) &&
      (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
    ) {
      e.preventDefault();
      selectionsCount++;
    } else if (e.key === "Escape" || e.keyCode === 27) {
      selections = [];
      selectionsCount = 0;
      selectionText = "";
      input.style.display = "none";
      textarea.focus();
    }
    multiSelect();
    updateDivText();
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

function getTimeStamp() {
  var date = new Date();
  var year = date.getFullYear();
  var month = pad(date.getMonth());
  var day = pad(date.getDate());
  var hours = pad(date.getHours());
  var minutes = pad(date.getMinutes());
  var seconds = pad(date.getSeconds());
  return "_" + year + month + day + hours + minutes + seconds;
}

function pad(number) {
  return String(number).padStart(2, 0);
}

function updateDivText() {
  var text = textarea.value;
  div.innerHTML = annotateDivText(text);
}

function annotateDivText(text) {
  if (selectionText === "") return text;

  var runningIndex = 0;
  var textPieces = [];
  for (var i = 0; i < selections.length; i++) {
    var start = selections[i][0];
    var end = selections[i][1];
    textPieces.push(text.substring(runningIndex, start));
    textPieces.push(text.substring(start, end));
    runningIndex = end;
  }
  if (runningIndex < text.length) {
    textPieces.push(text.substring(runningIndex, text.length));
  }
  return textPieces
    .map(function (v, i) {
      if (i % 2 === 0) {
        return v.replace(/ /g, "_");
      } else {
        return (
          '<span style="background:black;outline:solid lime;">' + v + "</span>"
        );
      }
    })
    .join("")
    .replace(/\n/g, "<br>");
}

function multiSelect() {
  if (selectionsCount === 0) return;

  multiEditInput();

  var match = selectionText;
  selections = [[textarea.selectionStart, textarea.selectionEnd]];
  match = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  selectionText = match;
  for (var i = 1; i < selectionsCount; i++) {
    var lastSelectionEnd = selections[selections.length - 1][1];
    getNextMatch(lastSelectionEnd, match);
  }
}

function multiEditInput() {
  input.style.display = "block";
}

function getNextMatch(selectionStart, match) {
  var lastSelectionStart = selections[selections.length - 1][0];
  var nextMatchRelativeIndex = textarea.value
    .slice(selectionStart)
    .indexOf(match);
  if (nextMatchRelativeIndex >= 0) {
    var nextSelectionStart = nextMatchRelativeIndex + selectionStart;
    if (nextSelectionStart !== lastSelectionStart) {
      selections.push([nextSelectionStart, nextSelectionStart + match.length]);
    }
  }
}

function replaceSelections() {
  var text = textarea.value;
  var runningIndex = 0;
  var textPieces = [];
  for (var i = 0; i < selections.length; i++) {
    var start = selections[i][0];
    var end = selections[i][1];
    textPieces.push(text.substring(runningIndex, start));
    textPieces.push(text.substring(start, end));
    runningIndex = end;
  }
  if (runningIndex < text.length) {
    textPieces.push(text.substring(runningIndex, text.length));
  }
  textarea.value = textPieces
    .map(function (v, i) {
      if (i % 2 === 0) {
        return v;
      } else {
        return input.value;
      }
    })
    .join("");
}


const futharkMap = {
  a: 'ᚨ',
  b: 'ᛒ',
  d: 'ᛞ',
  e: 'ᛖ',
  f: 'ᚠ',
  g: 'ᚷ',
  h: 'ᚺ',
  i: 'ᛁ',
  j: 'ᛃ',
  k: 'ᚲ',
  l: 'ᛚ',
  m: 'ᛗ',
  n: 'ᚾ',
  o: 'ᛟ',
  p: 'ᛈ',
  r: 'ᚱ',
  s: 'ᛊ',
  t: 'ᛏ',
  u: 'ᚢ',
  w: 'ᚹ',
  y: 'ᛇ',
  z: 'ᛉ',
}

function translateToFuthark(text) {
  text = text.toLowerCase();
  /* look ahead:
  th:'ᚦ',
  ng:'ᛜ',
  */
  text = text
    .replace(/[tᛏ][hᚺ]/g, 'ᚦ')
    .replace(/[nᚾ][gᚷ]/g, 'ᛜ');

  let translation = '';
  for (let letter of text) {
    translation += letter in futharkMap ? futharkMap[letter] : letter;
  }

  return translation;
}