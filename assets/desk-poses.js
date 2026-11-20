/* A four-pose Blender render for each object. Native links also work without it. */
const desk = document.querySelector(".desk-plane");
const overlay = desk.querySelector(".desk-poses");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const atlases = new Map();
const count = 4;
let hovered = null;
let focused = null;
let active = null;
let pose = 0;
let timer;

function wanted() {
  return reduceMotion.matches ? null : hovered || focused;
}

function prepare(link) {
  if (!link || reduceMotion.matches || atlases.has(link)) return;
  const image = new Image();
  const state = { image, ready: false };
  atlases.set(link, state);
  image.onload = () => {
    state.ready = true;
    if (wanted() === link) schedule(0);
  };
  image.src = link.dataset.poses;
}

function schedule(delay) {
  clearTimeout(timer);
  timer = setTimeout(advance, delay);
}

function advance() {
  const target = wanted();
  if (active && active !== target && pose > 0) {
    pose--;
  } else {
    if (!target || !atlases.get(target)?.ready) {
      overlay.hidden = true;
      active = null;
      pose = 0;
      return;
    }
    if (active !== target) {
      active = target;
      pose = 0;
      overlay.style.backgroundImage = 'url("' + atlases.get(active).image.src + '")';
    }
    pose = Math.min(count, pose + 1);
  }
  overlay.hidden = pose === 0;
  if (pose > 0) {
    const column = (pose - 1) % 2;
    const row = Math.floor((pose - 1) / 2);
    overlay.style.backgroundPosition = column * 100 + "% " + row * 100 + "%";
  }
  if (active !== target || pose < count) schedule(50);
}

function changed() {
  prepare(wanted());
  schedule(0);
}

for (const link of desk.querySelectorAll(".desk-link")) {
  link.addEventListener("pointerenter", event => {
    if (event.pointerType === "touch") return;
    hovered = link;
    changed();
  });
  link.addEventListener("pointerleave", () => {
    if (hovered === link) hovered = null;
    changed();
  });
  link.addEventListener("focus", () => {
    if (link.matches(":focus-visible")) focused = link;
    changed();
  });
  link.addEventListener("blur", () => {
    if (focused === link) focused = null;
    changed();
  });
}
reduceMotion.addEventListener("change", () => {
  if (reduceMotion.matches) {
    clearTimeout(timer);
    overlay.hidden = true;
    active = null;
    pose = 0;
  } else changed();
});
