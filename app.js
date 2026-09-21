/**
 * 🍰 Yonggang Middle School Antigravity Guide App Script
 * Features: Step Navigation, One-Click Prompt Copy, Live Prompt Builder, QR Generator, Checklist Tracker
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initStepNavigation();
  initCopySystem();
  initPromptBuilder();
  initQrGenerator();
  initChecklistTracker();
  initSearchCheatSheet();
});

/* ==========================================================================
   1. Step Navigation System
   ========================================================================== */
function initStepNavigation() {
  const stepButtons = document.querySelectorAll('.step-nav-btn');
  const stepSections = document.querySelectorAll('.step-section');
  const prevBtn = document.getElementById('prev-step-btn');
  const nextBtn = document.getElementById('next-step-btn');
  let currentStep = 'step-0';

  function switchStep(targetStepId) {
    currentStep = targetStepId;

    // Update buttons
    stepButtons.forEach(btn => {
      const step = btn.getAttribute('data-step');
      if (step === targetStepId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });

    // Update sections
    stepSections.forEach(sec => {
      if (sec.id === targetStepId) {
        sec.classList.remove('hidden');
        sec.classList.add('animate-fade-in');
      } else {
        sec.classList.add('hidden');
      }
    });

    // Re-render icons if needed
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Scroll to top of content
    const container = document.getElementById('main-guide-area');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateNavControlButtons();
  }

  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = btn.getAttribute('data-step');
      switchStep(targetStep);
    });
  });

  const stepOrder = [
    'step-0', 'step-1', 'step-2', 'step-3', 
    'step-4', 'step-5', 'step-6', 'step-7', 
    'step-builder', 'step-qr', 'step-faq'
  ];

  function updateNavControlButtons() {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (prevBtn) {
      if (currentIndex <= 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('opacity-40', 'cursor-not-allowed');
      } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('opacity-40', 'cursor-not-allowed');
      }
    }
    if (nextBtn) {
      if (currentIndex >= stepOrder.length - 1) {
        nextBtn.innerHTML = `<span>완료! 🎉</span>`;
      } else {
        const nextStepNum = currentIndex + 1;
        nextBtn.innerHTML = `<span>다음 단계로 이동</span> <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const idx = stepOrder.indexOf(currentStep);
      if (idx > 0) switchStep(stepOrder[idx - 1]);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const idx = stepOrder.indexOf(currentStep);
      if (idx < stepOrder.length - 1) switchStep(stepOrder[idx + 1]);
    });
  }

  // Handle direct hash navigation
  if (window.location.hash) {
    const hashStep = window.location.hash.replace('#', '');
    if (stepOrder.includes(hashStep)) {
      switchStep(hashStep);
    }
  }

  // Quick jump cards from hero
  document.querySelectorAll('.hero-jump-btn').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const target = card.getAttribute('data-target-step');
      if (target && stepOrder.includes(target)) {
        switchStep(target);
      }
    });
  });
}

/* ==========================================================================
   2. One-Click Copy System with Cute Toast
   ========================================================================== */
function initCopySystem() {
  const toast = document.getElementById('copy-toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    const toastMsg = document.getElementById('toast-msg');
    if (toastMsg) {
      toastMsg.textContent = message || '✨ 프롬프트가 복사되었어요! 안티그래비티 대화창에 붙여넣기(Ctrl+V) 하세요!';
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-prompt');
    if (copyBtn) {
      const targetId = copyBtn.getAttribute('data-copy-target');
      let textToCopy = '';

      if (targetId) {
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          textToCopy = targetElem.innerText || targetElem.textContent || targetElem.value;
        }
      } else if (copyBtn.getAttribute('data-prompt-text')) {
        textToCopy = copyBtn.getAttribute('data-prompt-text');
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          showToast(copyBtn.getAttribute('data-toast-msg'));
          // Animate button
          const originalText = copyBtn.innerHTML;
          copyBtn.classList.add('bg-emerald-600', 'text-white');
          copyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-1 inline"></i> 복사 완료!`;
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            if (window.lucide) window.lucide.createIcons();
          }, 1800);
        }).catch(err => {
          console.error('Failed to copy', err);
        });
      }
    }
  });

  window.copyTextDirectly = function(text, customToast) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customToast);
    });
  };
}

/* ==========================================================================
   3. Interactive Prompt Builder (선생님 맞춤형 프롬프트 생성기)
   ========================================================================== */
function initPromptBuilder() {
  const gradeInput = document.getElementById('builder-grade');
  const subjectInput = document.getElementById('builder-subject');
  const unitInput = document.getElementById('builder-unit');
  const questionTypeInput = document.getElementById('builder-qtype');
  const customQuestionInput = document.getElementById('builder-custom-q');
  const rubricInput = document.getElementById('builder-rubric');
  const themeInput = document.getElementById('builder-theme');
  const resultBox = document.getElementById('builder-output-text');
  const generateBtn = document.getElementById('btn-generate-prompt');

  // Preset subject templates
  const presets = {
    'korean': {
      grade: '중학교 2학년',
      subject: '국어',
      unit: '문학 작품의 감상과 비평',
      qtype: '서술형 1문항 피드백',
      question: '소설 속 주인공의 심경 변화와 그 계기가 된 사건 2가지를 서술하시오.',
      rubric: '주인공의 심경 변화를 뚜렷하게 제시(4점), 계기가 된 사건 2가지 명시(6점)',
      theme: '따뜻한 감성의 원목/베이지 베이커리'
    },
    'english': {
      grade: '중학교 3학년',
      subject: '영어',
      unit: 'Lesson 4. Environmental Protection',
      qtype: '영어 문장 작성 및 문법/어휘 피드백',
      question: 'Write 3 sentences about what you can do to protect the environment at school using "should" or "have to".',
      rubric: '조건(조동사 should 또는 have to) 충족 여부, 올바른 시제와 철자, 실천 가능한 행동 3가지 서술',
      theme: '산뜻하고 밝은 민트/스카이블루'
    },
    'science': {
      grade: '중학교 2학년',
      subject: '과학',
      unit: '물질의 특성 - 용해도와 재결정',
      qtype: '서술형 1문항 개념 피드백',
      question: '질산칼륨과 염화나트륨 혼합물을 분리하는 재결정 원리를 용해도 곡선의 차이를 들어 서술하시오.',
      rubric: '온도에 따른 용해도 차이 언급, 냉각 시 석출 원리 설명, 핵심 과학 용어 사용',
      theme: '깔끔하고 차분한 모던 에메랄드'
    },
    'home': {
      grade: '중학교 2학년',
      subject: '기술·가정',
      unit: '청소년의 영양과 식사',
      qtype: '서술형 1문항 실생활 적용 피드백',
      question: '청소년기 성장을 위해 6대 영양소 중 단백질과 칼슘의 기능 및 이를 섭취할 수 있는 대표 급원식품을 2가지씩 서술하시오.',
      rubric: '단백질과 칼슘의 체내 기능 명확성, 실생활 급원식품의 적절성',
      theme: '달콤한 디저트 베이커리 감성(첨부 이미지 스타일)'
    },
    'math': {
      grade: '중학교 2학년',
      subject: '수학',
      unit: '일차함수와 그래프',
      qtype: '풀이 과정 서술형 피드백',
      question: '두 점 (1, 3), (3, 7)을 지나는 일차함수의 기울기를 구하고 풀이 과정을 논리적으로 서술하시오.',
      rubric: '기울기의 정의(x의 증가량에 대한 y의 증가량의 비율) 적용, 계산 과정의 정확성',
      theme: '정돈된 모눈종이 파스텔 블루'
    },
    'social': {
      grade: '중학교 1학년',
      subject: '사회',
      unit: '기후 환경과 인간 생활',
      qtype: '서술형 탐구 피드백',
      question: '열대 우림 기후 지역 주민들의 전통 가옥 형태의 특징 2가지와 그렇게 지은 자연환경적 이유를 서술하시오.',
      rubric: '고상 가옥/경사 급한 지붕 특징 명시(5점), 지열·습기 차단 및 빗물 배수 이유 제시(5점)',
      theme: '따뜻한 햇살 옐로우 & 어스 브라운'
    }
  };

  function updateOutput() {
    if (!resultBox) return;

    const grade = gradeInput ? gradeInput.value.trim() || '중학교 2학년' : '중학교 2학년';
    const subject = subjectInput ? subjectInput.value.trim() || '가정' : '가정';
    const unit = unitInput ? unitInput.value.trim() || '영양소' : '영양소';
    const qtype = questionTypeInput ? questionTypeInput.value : '서술형 1문항 피드백';
    const question = customQuestionInput ? customQuestionInput.value.trim() || '선생님이 낸 서술형 문항' : '선생님이 낸 서술형 문항';
    const rubric = rubricInput ? rubricInput.value.trim() || '핵심 개념 2가지 포함, 논리적 설명' : '핵심 개념 2가지 포함';
    const theme = themeInput ? themeInput.value : '디저트 베이커리';

    const fullPrompt = `${grade} 학생이 사용하는 [${subject}] 과목의 '${unit}' 단원 서술형 연습 웹앱을 만들어줘.

[화면 구성 및 대상]
· 학생이 크롬북(디벗)이나 스마트폰으로 접속해 사용하는 반응형 웹 화면이야.
· 화면에 문제 1개, 학생이 생각을 적는 넓은 답안 입력창, 큼직한 [피드백 받기] 버튼을 배치해줘.
· 글씨와 버튼을 큼직하고 터치하기 쉽게 만들어줘.

[학습 내용]
· 문제 내용: "${question}"
· 채점/피드백 기준: "${rubric}"

[AI 기능 및 보안]
· 버튼을 누르면 서버 함수(Serverless Function)에서 Gemini API를 호출하여 학생 답안을 읽고 친절한 중학생 눈높이 말투로 피드백해줘:
  1) 잘 쓴 점 2가지 (칭찬과 격려)
  2) 보완할 점 및 다시 생각해 볼 힌트 2가지 (정답을 바로 주지 말고 유도)
  3) 한 줄 총평 및 [피드백 복사하기] 버튼
· [보안 필수] Gemini API 키는 클라이언트 화면 코드에 절대 노출하지 말고, 서버 환경변수 GEMINI_API_KEY 로만 읽어줘.
· 로컬 테스트용 .env 예시 파일(.env.example)을 만들어주고, 내가 어디에 키를 입력하면 되는지 안내해줘.

[배포 준비]
· Netlify에 배포할 수 있도록 서버 함수는 netlify/functions 폴더 구조로 작성해줘.

[디자인 분위기]
· ${theme} 느낌으로 둥글둥글하고 아늑하며 귀여운 카드로 꾸며줘.
· 학생 개인정보(이름, 학번, 이메일 등)는 일체 입력받거나 저장하지 마.`;

    resultBox.textContent = fullPrompt;
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', updateOutput);
  }

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const p = presets[presetKey];
      if (p) {
        if (gradeInput) gradeInput.value = p.grade;
        if (subjectInput) subjectInput.value = p.subject;
        if (unitInput) unitInput.value = p.unit;
        if (customQuestionInput) customQuestionInput.value = p.question;
        if (rubricInput) rubricInput.value = p.rubric;
        updateOutput();

        // Highlighting animation
        if (resultBox) {
          resultBox.parentElement.classList.add('pulse-yellow');
          setTimeout(() => {
            resultBox.parentElement.classList.remove('pulse-yellow');
          }, 1200);
        }
      }
    });
  });

  // Initial trigger
  updateOutput();
}

/* ==========================================================================
   4. Real-time QR Code Generator for Classroom Blackboard
   ========================================================================== */
function initQrGenerator() {
  const qrInput = document.getElementById('qr-url-input');
  const generateQrBtn = document.getElementById('btn-make-qr');
  const qrContainer = document.getElementById('qrcode-display');
  const qrDownloadBtn = document.getElementById('btn-download-qr');
  const sampleUrlBtn = document.getElementById('btn-sample-url');

  let currentQr = null;

  function makeQr() {
    if (!qrInput || !qrContainer) return;
    let url = qrInput.value.trim();
    if (!url) {
      url = 'https://yonggang-quiz.netlify.app';
      qrInput.value = url;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      qrInput.value = url;
    }

    qrContainer.innerHTML = '';
    
    // Check if QRCode library loaded
    if (typeof QRCode !== 'undefined') {
      currentQr = new QRCode(qrContainer, {
        text: url,
        width: 230,
        height: 230,
        colorDark: "#2D6A4F",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });

      if (qrDownloadBtn) {
        qrDownloadBtn.classList.remove('hidden');
      }
    } else {
      qrContainer.innerHTML = `
        <div class="p-4 bg-amber-50 rounded-xl text-amber-800 text-sm">
          QR 라이브러리를 불러오는 중입니다...
        </div>`;
    }
  }

  if (generateQrBtn) {
    generateQrBtn.addEventListener('click', makeQr);
  }

  if (qrInput) {
    qrInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') makeQr();
    });
  }

  if (sampleUrlBtn) {
    sampleUrlBtn.addEventListener('click', () => {
      if (qrInput) {
        qrInput.value = 'https://my-school-quiz.netlify.app';
        makeQr();
      }
    });
  }

  if (qrDownloadBtn) {
    qrDownloadBtn.addEventListener('click', () => {
      const img = qrContainer.querySelector('img') || qrContainer.querySelector('canvas');
      if (img) {
        let imgSrc = '';
        if (img.tagName.toLowerCase() === 'img') {
          imgSrc = img.src;
        } else {
          imgSrc = img.toDataURL('image/png');
        }
        const link = document.createElement('a');
        link.download = '용강중-수업앱-QR코드.png';
        link.href = imgSrc;
        link.click();
      }
    });
  }

  // Generate default sample on load
  setTimeout(makeQr, 400);
}

/* ==========================================================================
   5. Teacher Checklist Tracker & Progress (with Confetti)
   ========================================================================== */
function initChecklistTracker() {
  const checkboxes = document.querySelectorAll('.dessert-checkbox');
  const progressText = document.getElementById('progress-percentage');
  const progressBar = document.getElementById('progress-bar-inner');
  const heroProgressText = document.getElementById('hero-progress-text');
  const STORAGE_KEY = 'yonggang_antigravity_checklist_v1';

  let savedState = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedState = JSON.parse(raw);
  } catch (e) {
    console.warn('localStorage disabled');
  }

  checkboxes.forEach(cb => {
    const id = cb.getAttribute('data-check-id');
    if (id && savedState[id]) {
      cb.checked = true;
    }

    cb.addEventListener('change', () => {
      savedState[id] = cb.checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
      } catch (e) {}
      updateProgress();
    });
  });

  function updateProgress() {
    const total = checkboxes.length;
    if (total === 0) return;
    let checkedCount = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) checkedCount++;
    });

    const percent = Math.round((checkedCount / total) * 100);

    if (progressText) progressText.textContent = `${percent}%`;
    if (heroProgressText) heroProgressText.textContent = `${percent}% 달성`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    // Confetti on 100%
    if (percent === 100 && typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF758C', '#40916C', '#FFB300', '#3A86FF', '#C8E6C9']
      });
    }
  }

  updateProgress();
}

/* ==========================================================================
   6. Search & Quick Cheat Sheet Filter
   ========================================================================== */
function initSearchCheatSheet() {
  const searchInput = document.getElementById('faq-search-input');
  const items = document.querySelectorAll('.searchable-card');

  if (!searchInput || items.length === 0) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
}
