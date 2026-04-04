var player = {};

function start() {
  let start = {
    points: [[[new OmegaNum(10)]]],
    lastTick: Date.now(),
    timePlayed: 0,
    generators: [[[[]]]],
    highestGenerator: [[[new OmegaNum(10)]]],
    power: [[[null]]],
    timeInRun: [[[new OmegaNum(0)]]],
    highestPrestige: new OmegaNum(0),
    autoBuyMax: [[[]]],
    autoRelativeGain: [[[]]],
  };
  return start;
}
function save() {
  localStorage.setItem("prestigeCubed", btoa(JSON.stringify(player)));
}
function fixSave() {
  let defaultData = start();

  fixData(defaultData, player);
}

function fixData(defaultData, newData) {
  for (item in defaultData) {
    if (defaultData[item] == null) {
      if (newData[item] === undefined) newData[item] = null;
    } else if (Array.isArray(defaultData[item])) {
      if (newData[item] === undefined) newData[item] = defaultData[item];
      else fixData(defaultData[item], newData[item]);
    } else if (defaultData[item] instanceof OmegaNum) {
      // Convert to Decimal
      if (newData[item] === undefined) newData[item] = defaultData[item];
      else newData[item] = new OmegaNum(newData[item]);
    } else if (!!defaultData[item] && typeof defaultData[item] === "object") {
      if (newData[item] === undefined || typeof defaultData[item] !== "object")
        newData[item] = defaultData[item];
      else fixData(defaultData[item], newData[item]);
    } else {
      if (newData[item] === undefined) newData[item] = defaultData[item];
    }
  }
}
function load() {
  let get = localStorage.getItem("prestigeCubed");

  if (get === null || get === undefined) {
    player = start();
  } else {
    player = Object.assign(
      start(),
      JSON.parse(decodeURIComponent(escape(atob(get))))
    );
    fixSave();
  }
  app = new Vue({
    el: "#app",
    data: {
      player,
      OmegaNum,
    },
  });
}
setInterval(function () {
  save();
}, 5000);
window.onload = function () {
  load();
  mainLoop(1)
};

function exportSave() {
  let str = btoa(JSON.stringify(player));
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(el);
  alert("Save successfully copied to clipboard!");
}

function importSave(imported = undefined) {
  if (imported === undefined) imported = prompt("Paste your save here!");
  player = JSON.parse(atob(imported));
  save();
  window.location.reload();
}
function hardReset() {
  if (
    confirm(
      "Are you sure? It will reset everything and you will not get any reward!"
    )
  ) {
    player = start();
    window.location.reload();
    save();
  }
}