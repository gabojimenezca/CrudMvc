"use strict";

const cells = Array.from(document.querySelectorAll("#numbers li"));
const total = cells.length;
const bingoLetters = "BINGO";
const drum = document.getElementById("drum");
const current = document.getElementById("current");
const count = document.getElementById("count");
const progress = document.getElementById("progress");
const historyList = document.getElementById("history");
const empty = document.getElementById("empty");
const status = document.getElementById("status");
const draw = document.getElementById("draw");
const auto = document.getElementById("auto");
const reset = document.getElementById("reset");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let remaining = freshPool();
let latest = null;
let automatic = false;
let spinning = false;
let revealTimer;
let autoTimer;

function freshPool() {
    return Array.from({ length: total }, (_, index) => index + 1);
}

function updateControls() {
    const finished = remaining.length === 0;
    draw.disabled = spinning || automatic || finished;
    auto.disabled = finished;
    reset.disabled = !spinning && remaining.length === total;
    auto.setAttribute("aria-pressed", String(automatic));
    auto.textContent = automatic ? "Pausar" : "Automático";
}

function stopAuto() {
    automatic = false;
    window.clearTimeout(autoTimer);
}

function drawBall() {
    if (spinning || remaining.length === 0) return;

    window.clearTimeout(autoTimer);
    spinning = true;
    drum.classList.add("spinning");
    current.classList.remove("revealed");
    status.textContent = "Girando el bombo…";
    updateControls();

    revealTimer = window.setTimeout(revealBall, reducedMotion.matches ? 0 : 680);
}

function revealBall() {
    const index = Math.floor(Math.random() * remaining.length);
    const [number] = remaining.splice(index, 1);
    const ballLabel = `${bingoLetters[Math.floor((number - 1) / 15)]} ${number}`;
    const drawnCount = total - remaining.length;

    spinning = false;
    drum.classList.remove("spinning");
    latest?.classList.remove("latest");
    latest = cells[number - 1];
    latest.classList.add("drawn", "latest");
    latest.setAttribute("aria-label", `${number}, extraída`);

    current.textContent = ballLabel;
    current.classList.add("revealed");
    count.textContent = drawnCount;
    progress.style.width = `${drawnCount / total * 100}%`;

    const entry = document.createElement("li");
    entry.textContent = number;
    historyList.append(entry);
    empty.hidden = true;

    if (remaining.length === 0) {
        stopAuto();
        status.textContent = `Salió ${ballLabel}. Sorteo completo.`;
    } else {
        status.textContent = `Salió ${ballLabel}.`;
        if (automatic) autoTimer = window.setTimeout(drawBall, 1250);
    }

    updateControls();
}

draw.addEventListener("click", drawBall);

auto.addEventListener("click", () => {
    if (automatic) {
        stopAuto();
    } else {
        automatic = true;
        drawBall();
    }
    updateControls();
});

reset.addEventListener("click", () => {
    if (!window.confirm("¿Empezar una nueva partida y borrar el historial actual?")) return;

    stopAuto();
    window.clearTimeout(revealTimer);
    remaining = freshPool();
    latest = null;
    spinning = false;
    drum.classList.remove("spinning");
    current.classList.remove("revealed");
    current.textContent = "—";
    count.textContent = "0";
    progress.style.width = "0";
    historyList.replaceChildren();
    empty.hidden = false;
    status.textContent = "Listo para empezar";

    for (const cell of cells) {
        cell.classList.remove("drawn", "latest");
        cell.removeAttribute("aria-label");
    }
    updateControls();
    draw.focus();
});
