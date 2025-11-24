window.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLogoutButton();
    setupRealtimeClock();
    renderPCSModules();
});

const pcsModules = [];

function renderPCSModules() {
    const moduleGrid = document.getElementById('pcsModuleGrid');
    moduleGrid.innerHTML = '';
    pcsModules.length = 0;

    for (let i = 1; i <= 12; i++) {
        const statusOptions = ['대기', '충전 중', '방전 중', '정비 중'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const power = +(Math.random() * 0.075).toFixed(3);
        const soc = Math.floor(Math.random() * 101); // 충전률 0~100%

        const module = { id: i, status, power, soc };
        pcsModules.push(module);

        const card = createModuleCard(module);
        moduleGrid.appendChild(card);
    }
}

function createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    const isLocked = module.status === '정비 중';

    card.innerHTML = `
    <div class="pcs-card position-relative" data-id="${module.id}">
      ${isLocked ? `<div class="pcs-overlay">
        🛠 정비 중 - 조작 불가<br>
        <input type="text" class="form-control form-control-sm mt-2 code-input" placeholder="코드 입력">
      </div>` : ''}
      <h5>모듈 #${module.id}</h5>
      <p><strong>출력:</strong> ${module.power} MWh</p>
      <p><strong>상태:</strong> <span class="module-status">${module.status}</span></p>
      <p><strong>충전률:</strong> <span class="soc-value">${module.soc}%</span></p>
      <div class="progress mb-2">
        <div class="progress-bar bg-success soc-bar" role="progressbar" style="width: ${module.soc}%;" aria-valuenow="${module.soc}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <button class="btn btn-sm btn-outline-primary charge-btn" ${isLocked ? 'disabled' : ''}>충전 시작</button>
      <button class="btn btn-sm btn-outline-danger ms-2 discharge-btn" ${isLocked ? 'disabled' : ''}>방전 시작</button>
    </div>
  `;

    const statusSpan = card.querySelector('.module-status');
    const socText = card.querySelector('.soc-value');
    const socBar = card.querySelector('.soc-bar');
    const chargeBtn = card.querySelector('.charge-btn');
    const dischargeBtn = card.querySelector('.discharge-btn');
    const codeInput = card.querySelector('.code-input');

    chargeBtn?.addEventListener('click', () => {
        module.status = '충전 중';
        statusSpan.textContent = '충전 중';
        module.soc = Math.min(module.soc + 10, 100);
        socText.textContent = module.soc + '%';
        socBar.style.width = module.soc + '%';
        socBar.setAttribute('aria-valuenow', module.soc);
    });

    dischargeBtn?.addEventListener('click', () => {
        module.status = '방전 중';
        statusSpan.textContent = '방전 중';
        module.soc = Math.max(module.soc - 10, 0);
        socText.textContent = module.soc + '%';
        socBar.style.width = module.soc + '%';
        socBar.setAttribute('aria-valuenow', module.soc);
    });

    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = codeInput.value.trim().toLowerCase();
                if (code === 'complete' || code === 'maintenance') {
                    module.status = '대기';
                    module.power = 0;
                    rerenderCard(card, module);
                } else {
                    codeInput.classList.add('is-invalid');
                    setTimeout(() => codeInput.classList.remove('is-invalid'), 1000);
                }
            }
        });
    }

    return card;
}

function rerenderCard(cardWrapper, module) {
    const newCard = createModuleCard(module);
    cardWrapper.replaceWith(newCard);
}

function setupNavigation() {
    document.getElementById('toDashboard')?.addEventListener('click', () => location.href = 'dashboard.html');
    document.getElementById('toPCS')?.addEventListener('click', () => location.href = 'pcs.html');
    document.getElementById('toLogs')?.addEventListener('click', () => location.href = 'log.html');
}

function setupLogoutButton() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('auth');
        window.location.href = '/login.html';
    });
}

function setupRealtimeClock() {
    const clock = document.getElementById('clockDisplay');
    setInterval(() => {
        const now = new Date();
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        clock.textContent = now.toLocaleString('ko-KR', options);
    }, 1000);
}
