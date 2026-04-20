let db, songs = [], index = 0, shuffle = false, repeat = false, recent = [];

const audio = document.getElementById("audio");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playlistDiv = document.getElementById("playlist");
const recentDiv = document.getElementById("recent");
const playlistsDiv = document.getElementById("playlists");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

// ================= DB =================
const req = indexedDB.open("MusicDB", 1);

req.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
};

req.onsuccess = e => {
  db = e.target.result;
  loadSongs();
};

function loadSongs() {
  const tx = db.transaction("songs", "readonly");
  const store = tx.objectStore("songs");

  store.getAll().onsuccess = e => {
    songs = e.target.result;
    renderSongs();
    if (songs.length) loadSong(0);
  };
}

// ================= ADD SONG =================
function addSong(file) {
  const r = new FileReader();
  r.onload = () => {
    db.transaction("songs", "readwrite").objectStore("songs").add({
      title: file.name,
      artist: prompt("Artist?") || "Unknown",
      data: r.result,
      favorite: false
    });
    setTimeout(loadSongs, 200);
  };
  r.readAsDataURL(file);
}

fileInput.onchange = e => [...e.target.files].forEach(addSong);

// ================= PLAYER =================
function loadSong(i) {
  if (!songs[i]) return;
  index = i;
  audio.src = songs[i].data;
  title.textContent = songs[i].title;
  artist.textContent = songs[i].artist;
  addRecent(songs[i]);
}

function playPause() {
  const b = document.getElementById("playBtn");
  if (audio.paused) {
    audio.play();
    b.textContent = "⏸";
    startWave();
  } else {
    audio.pause();
    b.textContent = "▶️";
  }
}

function nextSong() {
  if (shuffle) index = Math.floor(Math.random() * songs.length);
  else index = (index + 1) % songs.length;

  loadSong(index);
  audio.play();
}

function prevSong() {
  index = (index - 1 + songs.length) % songs.length;
  loadSong(index);
  audio.play();
}

// ================= BUTTON STATES =================
function toggleShuffle() {
  shuffle = !shuffle;
  document.getElementById("shuffleBtn").classList.toggle("active", shuffle);
}

function toggleRepeat() {
  repeat = !repeat;
  document.getElementById("repeatBtn").classList.toggle("active", repeat);
}

function toggleFavorite() {
  let s = songs[index];
  s.favorite = !s.favorite;

  db.transaction("songs", "readwrite").objectStore("songs").put(s);
  renderSongs();
}

// ================= RECENT =================
function addRecent(song) {
  recent.unshift(song);
  recent = recent.slice(0, 5);
  renderRecent();
}

function renderRecent() {
  recentDiv.innerHTML = "";
  recent.forEach(s => {
    let d = document.createElement("div");
    d.textContent = s.title;
    d.onclick = () => {
      audio.src = s.data;
      audio.play();
    };
    recentDiv.appendChild(d);
  });
}

// ================= PLAYLIST =================
let playlists = {};

function createPlaylist() {
  let name = document.getElementById("playlistName").value;
  if (!name) return;
  playlists[name] = [];
  renderPlaylists();
}

function renderPlaylists() {
  playlistsDiv.innerHTML = "";
  for (let p in playlists) {
    let d = document.createElement("div");
    d.textContent = p;
    playlistsDiv.appendChild(d);
  }
}

// ================= SONG LIST =================
function renderSongs() {
  playlistDiv.innerHTML = "";

  songs.forEach((s, i) => {
    let d = document.createElement("div");
    d.textContent = s.title + (s.favorite ? " ❤️" : "");

    d.onclick = () => {
      loadSong(i);
      audio.play();
    };

    playlistDiv.appendChild(d);
  });
}

// ================= SEARCH =================
document.getElementById("search").oninput = e => {
  let val = e.target.value.toLowerCase();
  playlistDiv.innerHTML = "";

  songs
    .filter(s => s.title.toLowerCase().includes(val))
    .forEach((s, i) => {
      let d = document.createElement("div");
      d.textContent = s.title;
      d.onclick = () => {
        loadSong(i);
        audio.play();
      };
      playlistDiv.appendChild(d);
    });
};

// ================= REPEAT =================
audio.onended = () => {
  if (repeat) audio.play();
  else nextSong();
};

// ================= WAVE =================
const canvas = document.getElementById("wave");
const ctx = canvas.getContext("2d");

function startWave() {
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
      let h = Math.random() * 50;
      ctx.fillRect(i * 7, 50 - h, 4, h);
    }

    if (!audio.paused) requestAnimationFrame(draw);
  }
  draw();
}

// ================= PROGRESS + TIME =================
audio.ontimeupdate = () => {
  if (!audio.duration) return;

  progress.value = (audio.currentTime / audio.duration) * 100 || 0;

  document.getElementById("currentTime").textContent = formatTime(audio.currentTime);

  const remaining = audio.duration - audio.currentTime;
  document.getElementById("remainingTime").textContent = "-" + formatTime(remaining);
};

progress.addEventListener("change", () => {
  if (!audio.duration) return;
  audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener("loadedmetadata", () => {
  progress.value = 0;
});

function formatTime(time) {
  let min = Math.floor(time / 60);
  let sec = Math.floor(time % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}
volume.addEventListener("input", () => {
    audio.volume = volume.value;
  });
  audio.volume = 0.7;
volume.value = 0.7;  