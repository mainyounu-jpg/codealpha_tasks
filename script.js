let display = document.getElementById("display");
let historyList = document.getElementById("historyList");

/* SOUND */
const clickSound = new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3");

function playSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

/* BASIC */
function append(val) {
  playSound();
  display.value += val;
}

function clearDisplay() {
  playSound();
  display.value = "";
}

function deleteLast() {
  playSound();
  display.value = display.value.slice(0, -1);
}

/* SCIENTIFIC */
function scientificFunc(func) {
  playSound();
  display.value += func;
}

/* CALCULATE */
function calculate() {
  try {
    let result = eval(display.value);
    
    // HISTORY SAVE
    let li = document.createElement("li");
    li.textContent = display.value + " = " + result;
    historyList.prepend(li);

    display.value = result;
  } catch {
    display.value = "Error";
  }
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("light");
}

/* SCIENTIFIC TOGGLE */
function toggleScientific() {
  document.getElementById("scientific").classList.toggle("hidden");
}

/* KEYBOARD */
document.addEventListener("keydown", (e) => {
  if (!isNaN(e.key) || "+-*/.%".includes(e.key)) {
    append(e.key);
  } else if (e.key === "Enter") {
    calculate();
  } else if (e.key === "Backspace") {
    deleteLast();
  } else if (e.key === "Escape") {
    clearDisplay();
  }
});