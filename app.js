import { GLOSSARY, DEEP_DIVES, FILINGS } from "./data.js";

const STEP_TITLES = {
  1: "1분 핵심 요약",
  2: "궁극적 목적과 3대 사업재편",
  3: "전 서면 4대 필승 논리",
  4: "5단계 공방 일지",
  5: "제출 서면 전문 및 공유"
};

/* ==========================================================================
   1. 5-View Step Navigation (Method 2: Tabbed Mobile Viewport)
   ========================================================================== */
let currentStep = 1;
const views = Array.from(document.querySelectorAll(".step-view"));
const navButtons = Array.from(document.querySelectorAll("[data-nav-step]"));
const progressFill = document.getElementById("progress-fill");
const headerStepBadge = document.getElementById("header-step-badge");
const mainContent = document.getElementById("main-content");

function goToStep(stepNumber, { pushHash = true, focusMain = false } = {}) {
  const step = Math.max(1, Math.min(5, Number(stepNumber) || 1));
  currentStep = step;

  views.forEach((view, idx) => {
    view.hidden = idx + 1 !== step;
  });

  navButtons.forEach((btn) => {
    const isCurrent = Number(btn.dataset.navStep) === step;
    if (isCurrent) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  progressFill.style.setProperty("--progress", `${step * 20}%`);
  headerStepBadge.textContent = `${step} / 5 단계`;
  document.title = `${STEP_TITLES[step]} | 우정사업본부 원청교섭 브리핑`;

  if (pushHash && location.hash !== `#step-${step}`) {
    history.replaceState(null, "", `#step-${step}`);
  }

  window.scrollTo({ top: 0, behavior: "instant" });
  if (focusMain) {
    const activeHeading = document.querySelector(`#view-${step} h1`);
    if (activeHeading) {
      activeHeading.setAttribute("tabindex", "-1");
      activeHeading.focus({ preventScroll: true });
    } else {
      mainContent.focus({ preventScroll: true });
    }
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    goToStep(btn.dataset.navStep, { focusMain: true });
  });
});

document.addEventListener("click", (e) => {
  const goBtn = e.target.closest("[data-go-step]");
  if (goBtn) {
    goToStep(goBtn.dataset.goStep, { focusMain: true });
  }
});

// Initialize from URL hash if shared to a specific step
const hashMatch = location.hash.match(/^#step-([1-5])$/);
goToStep(hashMatch ? Number(hashMatch[1]) : 1, { pushHash: false });

window.addEventListener("hashchange", () => {
  const m = location.hash.match(/^#step-([1-5])$/);
  if (m) goToStep(Number(m[1]), { pushHash: false });
});

/* ==========================================================================
   2. View 1: Easy 3 Q&A Card Deck (1 card visible at a time)
   ========================================================================== */
let currentQa = 0;
const qaPills = Array.from(document.querySelectorAll("[data-qa-target]"));
const qaPanels = Array.from(document.querySelectorAll("[data-qa-panel]"));
const qaCounter = document.getElementById("qa-counter");
const qaPrevBtn = document.getElementById("qa-prev-btn");
const qaNextBtn = document.getElementById("qa-next-btn");

function showQa(index) {
  currentQa = (index + qaPanels.length) % qaPanels.length;
  qaPills.forEach((pill, i) => {
    pill.setAttribute("aria-pressed", String(i === currentQa));
  });
  qaPanels.forEach((panel, i) => {
    panel.hidden = i !== currentQa;
  });
  qaCounter.textContent = `${currentQa + 1} / ${qaPanels.length}`;
}

qaPills.forEach((pill) => {
  pill.addEventListener("click", () => showQa(Number(pill.dataset.qaTarget)));
});
qaPrevBtn?.addEventListener("click", () => showQa(currentQa - 1));
qaNextBtn?.addEventListener("click", () => showQa(currentQa + 1));

/* ==========================================================================
   3. View 3: Accessible Tabbed Interface for 4 Pillars
   ========================================================================== */
const pillarTablist = document.querySelector(".pillar-tablist");
const pillarTabs = Array.from(document.querySelectorAll("[data-pillar]"));
const pillarPanels = Array.from(document.querySelectorAll("[data-pillar-panel]"));

function selectPillar(index, { moveFocus = false } = {}) {
  const targetIdx = Math.max(0, Math.min(pillarTabs.length - 1, index));
  pillarTabs.forEach((tab, i) => {
    const selected = i === targetIdx;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) {
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
      if (moveFocus) tab.focus();
    }
  });
  pillarPanels.forEach((panel, i) => {
    panel.hidden = i !== targetIdx;
  });
}

pillarTabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => selectPillar(idx));
});

pillarTablist?.addEventListener("keydown", (e) => {
  const activeIdx = pillarTabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  if (e.key === "ArrowRight") {
    e.preventDefault();
    selectPillar((activeIdx + 1) % pillarTabs.length, { moveFocus: true });
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    selectPillar((activeIdx - 1 + pillarTabs.length) % pillarTabs.length, { moveFocus: true });
  } else if (e.key === "Home") {
    e.preventDefault();
    selectPillar(0, { moveFocus: true });
  } else if (e.key === "End") {
    e.preventDefault();
    selectPillar(pillarTabs.length - 1, { moveFocus: true });
  }
});

/* ==========================================================================
   4. View 4: Native Details Accordion Expand/Collapse All
   ========================================================================== */
const timelineList = document.getElementById("timeline-list");
const toggleAllBtn = document.getElementById("toggle-all-timeline");
const timelineItems = timelineList ? Array.from(timelineList.querySelectorAll("details")) : [];

function syncToggleAllState() {
  if (!toggleAllBtn || timelineItems.length === 0) return;
  const allOpen = timelineItems.every((d) => d.open);
  toggleAllBtn.setAttribute("aria-expanded", String(allOpen));
  toggleAllBtn.textContent = allOpen ? "모두 접기" : "전체 펼치기";
}

toggleAllBtn?.addEventListener("click", () => {
  const shouldOpen = toggleAllBtn.getAttribute("aria-expanded") !== "true";
  timelineItems.forEach((d) => {
    d.open = shouldOpen;
  });
  syncToggleAllState();
});

// toggle does not bubble, hence capture listener per accordion guidance
document.addEventListener(
  "toggle",
  (e) => {
    if (e.target.matches("#timeline-list details")) {
      syncToggleAllState();
    }
  },
  { capture: true }
);

/* ==========================================================================
   5. Native <dialog> Modals (Deep Dives, 4 Filings, Glossary) + Fallback
   ========================================================================== */
const sheetDialog = document.getElementById("sheet-dialog");
const sheetTitle = document.getElementById("sheet-title");
const sheetBody = document.getElementById("sheet-body");
const sheetSwitcher = document.getElementById("sheet-doc-switcher");
const sheetPills = Array.from(document.querySelectorAll("[data-switch-filing]"));

const glossaryDialog = document.getElementById("glossary-dialog");
const glossaryTermTitle = document.getElementById("glossary-term-title");
const glossaryTermDesc = document.getElementById("glossary-term-desc");

function openDeepDiveModal(key) {
  const item = DEEP_DIVES[key];
  if (!item) return;
  sheetSwitcher.hidden = true;
  sheetTitle.textContent = item.title;
  sheetBody.innerHTML = item.html;
  sheetBody.scrollTop = 0;
  sheetDialog.showModal();
}

function renderFiling(key) {
  const doc = FILINGS[key];
  if (!doc) return;
  sheetSwitcher.hidden = false;
  sheetTitle.textContent = `${doc.label} (${doc.date})`;
  sheetBody.innerHTML = doc.html;
  sheetBody.scrollTop = 0;
  sheetPills.forEach((pill) => {
    pill.setAttribute("aria-pressed", String(pill.dataset.switchFiling === key));
  });
}

function openFilingModal(key) {
  renderFiling(key);
  if (!sheetDialog.open) {
    sheetDialog.showModal();
  }
}

function openGlossaryModal(termKey) {
  const entry = GLOSSARY[termKey];
  if (!entry) return;
  glossaryTermTitle.textContent = entry.term;
  glossaryTermDesc.textContent = entry.desc;
  glossaryDialog.showModal();
}

document.addEventListener("click", (e) => {
  const deepBtn = e.target.closest("[data-open-deep]");
  if (deepBtn) {
    openDeepDiveModal(deepBtn.dataset.openDeep);
    return;
  }

  const filingBtn = e.target.closest("[data-open-filing]");
  if (filingBtn) {
    openFilingModal(filingBtn.dataset.openFiling);
    return;
  }

  const switchPill = e.target.closest("[data-switch-filing]");
  if (switchPill) {
    renderFiling(switchPill.dataset.switchFiling);
    return;
  }

  const termBtn = e.target.closest("[data-term]");
  if (termBtn) {
    openGlossaryModal(termBtn.dataset.term);
  }
});

// Fallback for browsers without native closedby="any" support (Safari/iOS)
if (!("closedBy" in HTMLDialogElement.prototype)) {
  const isOutsideDialog = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener("pointerdown", (e) => {
      pressedOutside = isOutsideDialog(e, dialog);
    });
    dialog.addEventListener("pointerup", (e) => {
      if (pressedOutside && isOutsideDialog(e, dialog)) {
        dialog.close();
      }
      pressedOutside = false;
    });
  }
}

/* ==========================================================================
   6. Share Link CTA & Accessible Toast
   ========================================================================== */
const shareBtn = document.getElementById("share-btn");
const toastEl = document.getElementById("toast");
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

shareBtn?.addEventListener("click", async () => {
  const shareUrl = location.href.split("#")[0];
  const shareData = {
    title: "우정사업본부 원청 직접교섭 시정신청 브리핑",
    text: "우체국물류지원단 물류노동조합의 원청 직접교섭 투쟁 경과와 핵심 근거를 확인하세요.",
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    showToast("현재 페이지 주소가 복사되었습니다. 카카오톡에 붙여넣어 공유하세요.");
  } catch {
    showToast("브라우저 주소창의 URL을 복사해 동료 조합원에게 공유해 주세요.");
  }
});
