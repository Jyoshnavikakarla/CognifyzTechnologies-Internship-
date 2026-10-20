const storageKey = "fitflow-app-state";

const defaultState = {
  selectedWorkout: "",
  selectedMinutes: 0,
  workoutCompleted: false,
  completedWorkouts: 0,
  totalMinutes: 0,
  bestScore: 0,
  streak: 0,
  lastCompletionDate: "",
  habits: {
    hydration: false,
    sleep: false,
    meditation: false,
    steps: false
  },
  routine: {
    goalName: "",
    focusArea: "",
    workoutTime: ""
  }
};

const state = loadState();

const todayDate = document.querySelector("#todayDate");
const selectedWorkout = document.querySelector("#selectedWorkout");
const habitScore = document.querySelector("#habitScore");
const wellnessScore = document.querySelector("#wellnessScore");
const streakCount = document.querySelector("#streakCount");
const completedWorkouts = document.querySelector("#completedWorkouts");
const totalMinutes = document.querySelector("#totalMinutes");
const bestScore = document.querySelector("#bestScore");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");
const workoutMessage = document.querySelector("#workoutMessage");
const savedRoutineName = document.querySelector("#savedRoutineName");
const routineResult = document.querySelector("#routineResult");
const routineForm = document.querySelector("#routineForm");

function loadState() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return structuredClone(defaultState);
  }

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatToday() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());
}

function completedHabitCount() {
  return Object.values(state.habits).filter(Boolean).length;
}

function calculateScore() {
  const habitPoints = completedHabitCount() * 20;
  const workoutPoints = state.workoutCompleted ? 20 : 0;
  return Math.min(100, habitPoints + workoutPoints);
}

function updateStreakAfterWorkout() {
  const today = todayKey();

  if (state.lastCompletionDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  state.streak = state.lastCompletionDate === yesterdayKey ? state.streak + 1 : 1;
  state.lastCompletionDate = today;
}

function renderRoutine() {
  if (!state.routine.goalName) {
    savedRoutineName.textContent = "Not set";
    routineResult.classList.remove("is-visible");
    routineResult.textContent = "";
    return;
  }

  savedRoutineName.textContent = state.routine.goalName;
  routineResult.classList.add("is-visible");
  routineResult.textContent = `${state.routine.goalName}: ${state.routine.focusArea} at ${state.routine.workoutTime}`;

  document.querySelector("#goalName").value = state.routine.goalName;
  document.querySelector("#focusArea").value = state.routine.focusArea;
  document.querySelector("#workoutTime").value = state.routine.workoutTime;
}

function renderWorkoutCards() {
  document.querySelectorAll(".workout-card").forEach((card) => {
    const isSelected = card.dataset.workout === state.selectedWorkout;
    const button = card.querySelector(".select-workout");

    card.classList.toggle("is-selected", isSelected);
    button.textContent = isSelected ? "Selected" : "Select Plan";
  });
}

function renderHabits() {
  document.querySelectorAll("[data-habit]").forEach((checkbox) => {
    checkbox.checked = Boolean(state.habits[checkbox.dataset.habit]);
  });
}

function renderDashboard() {
  const score = calculateScore();
  const habitsDone = completedHabitCount();

  if (score > state.bestScore) {
    state.bestScore = score;
    saveState();
  }

  todayDate.textContent = formatToday();
  selectedWorkout.textContent = state.selectedWorkout || "None selected";
  habitScore.textContent = `${habitsDone}/4`;
  wellnessScore.textContent = `${score}%`;
  streakCount.textContent = `${state.streak} ${state.streak === 1 ? "day" : "days"}`;
  completedWorkouts.textContent = state.completedWorkouts;
  totalMinutes.textContent = state.totalMinutes;
  bestScore.textContent = `${state.bestScore}%`;
  progressPercent.textContent = `${score}%`;
  progressBar.style.width = `${score}%`;

  renderWorkoutCards();
  renderHabits();
  renderRoutine();
}

document.querySelectorAll(".select-workout").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".workout-card");
    state.selectedWorkout = card.dataset.workout;
    state.selectedMinutes = Number(card.dataset.minutes);
    state.workoutCompleted = false;
    workoutMessage.textContent = `${state.selectedWorkout} selected for today.`;
    saveState();
    renderDashboard();
  });
});

document.querySelector("#completeWorkout").addEventListener("click", () => {
  if (!state.selectedWorkout) {
    workoutMessage.textContent = "Select a workout plan first.";
    return;
  }

  if (state.workoutCompleted) {
    workoutMessage.textContent = "Workout already marked complete for this session.";
    return;
  }

  state.workoutCompleted = true;
  state.completedWorkouts += 1;
  state.totalMinutes += state.selectedMinutes;
  updateStreakAfterWorkout();
  workoutMessage.textContent = `${state.selectedWorkout} completed. Progress updated.`;
  saveState();
  renderDashboard();
});

document.querySelectorAll("[data-habit]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    state.habits[checkbox.dataset.habit] = checkbox.checked;
    saveState();
    renderDashboard();
  });
});

routineForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.routine.goalName = document.querySelector("#goalName").value.trim();
  state.routine.focusArea = document.querySelector("#focusArea").value;
  state.routine.workoutTime = document.querySelector("#workoutTime").value;
  saveState();
  renderDashboard();
});

document.querySelector("#resetApp").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  Object.assign(state, structuredClone(defaultState));
  workoutMessage.textContent = "App data reset.";
  routineForm.reset();
  renderDashboard();
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector("#menu-toggle").checked = false;
  });
});

renderDashboard();
