// main.js - HelioCast 대시보드 통합 스크립트 (실시간 시계, 예측/측정 데이터 처리)

window.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'dashboard') {
        setupRealtimeClock();
        setupLogoutButton();
        setupNavigation();
        fetchWeatherForecast();
        fetchShortTermForecast();
        fetchMidTermForecast();
        drawGenerationChart();
        updateSidebarInfo();
        loadNotifications();
    }
});

function setupRealtimeClock() {
    const clock = document.getElementById('clockDisplay');
    setInterval(() => {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clock.textContent = now.toLocaleString('ko-KR', options);
    }, 1000);
}

function setupLogoutButton() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('auth');
        window.location.href = '/login.html';
    });
}

function setupNavigation() {
    document.getElementById('toDashboard')?.addEventListener('click', () => location.href = 'dashboard.html');
    document.getElementById('toPCS')?.addEventListener('click', () => location.href = 'pcs.html'); // ✅ PCS 버튼 처리 추가
    document.getElementById('toLogs')?.addEventListener('click', () => location.href = 'log.html');
}

function fetchShortTermForecast() {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/forecast/arima?start=${today}&end=${today}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('shortTermPredictionBody');
            tbody.innerHTML = '';
            data.forEach(row => {
                const revenue = row.predictedMwh * 1000 * 93.4;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.forecastDate}</td>
                    <td>${row.predictedMwh.toFixed(3)}</td>
                    <td>${Math.round(revenue).toLocaleString()}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('단기 예측 로딩 실패:', err));
}


function fetchMidTermForecast() {
    const today = new Date();
    const start = today.toISOString().split('T')[0];
    const end = new Date(today.getTime() + 6 * 86400000).toISOString().split('T')[0];

    fetch(`/api/forecast/sarima?start=${start}&end=${end}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('midTermPredictionBody');
            tbody.innerHTML = '';
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.forecastStart} ~ ${row.forecastEnd}</td>
                    <td>${row.predictedMwh.toFixed(2)}</td>
                    <td>${row.actualMwh != null ? row.actualMwh.toFixed(2) : '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('중기 예측 로딩 실패:', err));
}

function drawGenerationChart() {
    const today = new Date();
    const start = today.toISOString().split('T')[0] + 'T00:00:00';
    const end = today.toISOString().split('T')[0] + 'T23:59:59';

    fetch(`/api/measurements?start=${start}&end=${end}`)
        .then(res => res.json())
        .then(data => {
            const now = new Date();
            const seenHours = new Set();
            const filtered = data.filter(d => {
                const t = new Date(d.measuredAt);
                const hour = t.getHours();
                const isFuture = t > now;
                const isDuplicate = seenHours.has(hour);
                const hasValidData = d.powerMw != null || d.irradianceWm2 != null;
                if (isFuture || isDuplicate || !hasValidData) return false;
                seenHours.add(hour);
                return true;
            });

            const ctx = document.getElementById('generationChart').getContext('2d');
            const labels = filtered.map(d => new Date(d.measuredAt).getHours() + '시');
            const values = filtered.map(d => d.powerMw ?? 0);
            const irradiance = filtered.map(d => d.irradianceWm2 ?? null);
            const cumulated = values.reduce((acc, val, i) => {
                acc.push((acc[i - 1] || 0) + val);
                return acc;
            }, []);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '시간당 발전량 (MWh)',
                            data: values,
                            borderColor: 'orange',
                            backgroundColor: 'rgba(255,165,0,0.1)',
                            tension: 0.3,
                            yAxisID: 'y'
                        },
                        {
                            label: '누적 발전량 (MWh)',
                            data: cumulated,
                            borderColor: 'green',
                            backgroundColor: 'rgba(0,128,0,0.1)',
                            tension: 0.3,
                            yAxisID: 'y'
                        },
                        {
                            label: '일사량 (W/m²)',
                            data: irradiance,
                            borderColor: 'blue',
                            backgroundColor: 'rgba(0,123,255,0.1)',
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: '발전량 (MWh)' }
                        },
                        y1: {
                            beginAtZero: true,
                            position: 'right',
                            title: { display: true, text: '일사량 (W/m²)' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        })
        .catch(err => console.error('발전량 차트 로딩 실패:', err));
}

function updateSidebarInfo() {
    const today = new Date();
    const start = today.toISOString().split('T')[0] + 'T00:00:00';
    const end = today.toISOString().split('T')[0] + 'T23:59:59';

    fetch(`/api/measurements?start=${start}&end=${end}`)
        .then(res => res.json())
        .then(data => {
            const now = new Date();
            const total = data
                .filter(d => new Date(d.measuredAt) <= now && d.powerMw != null)
                .reduce((sum, d) => sum + d.powerMw, 0);

            const revenue = total * 93400;

            // 실시간 사용량: 누적 발전량의 40~80% 범위로 현실적 차감
            const usageRatio = 0.4 + Math.random() * 0.4;
            const usage = total * usageRatio;


            document.getElementById('totalGeneration').textContent = total.toFixed(2) + ' MWh';
            document.getElementById('estimatedProfit').textContent = revenue.toLocaleString() + ' KRW';
            document.getElementById('currentUsage').textContent = usage.toFixed(2) + ' MWh';
            document.getElementById('systemStatus').textContent = '정상 작동 중';
        });
}


function loadNotifications() {
    const list = document.getElementById('notificationList');
    list.innerHTML = '';
    const notifications = [
        '📅 6/2 09:00 데이터 수집 완료',
        '⚠️ 6/1 15:00 예보 미수신',
        '✅ 예측 모델 최적화 적용'
    ];
    notifications.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        list.appendChild(li);
    });
}

function getIconPath(sky) {
    const nameMap = {
        '맑음': 'sun.svg',
        '구름 많음': 'cloudy.svg',
        '흐림': 'cloud.svg',
        '비': 'rain.svg',
        '눈': 'snow.svg',
        '안개': 'fog.svg',
        '소나기': 'shower.svg',
        '흐리고 비': 'cloud-rain.svg',
        '흐리고 눈': 'cloud-snow.svg',
        '구름조금': 'sun-cloud.svg',
        '천둥': 'thunder.svg'
    };
    return `/img/weather-icons/${nameMap[sky] || 'sun.svg'}`;
}

function fetchWeatherForecast() {
    fetch('/api/forecast')
        .then(res => res.json())
        .then(data => {
            const cardsContainer = document.getElementById('weeklyWeatherCards');
            cardsContainer.innerHTML = '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const filteredData = data.filter(item => {
                const forecastDate = new Date(item.forecastDate);
                forecastDate.setHours(0, 0, 0, 0);
                return forecastDate >= today;
            }).sort((a, b) => new Date(a.forecastDate) - new Date(b.forecastDate)).slice(0, 7);

            filteredData.forEach(item => {
                const date = new Date(item.forecastDate);
                const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
                const card = document.createElement('div');
                card.className = 'card weather-card shadow-sm border-primary';
                card.innerHTML = `
                    <div class="card-body p-2">
                        <h6 class="card-title">${weekday}</h6>
                        <img src="${getIconPath(item.forecastSkyPm)}" alt="하늘" class="weather-icon" />
                        <p class="mb-0">🌡 ${item.forecastTemperaturePmC.toFixed(1)}°C</p>
                        <p class="mb-0">☁ ${item.forecastSkyPm}</p>
                        <p class="mb-0">☔ ${item.forecastPrecipProbPm}%</p>
                    </div>
                `;
                card.addEventListener('click', () => showWeatherDetail(item));
                cardsContainer.appendChild(card);
            });
        });
}

function showWeatherDetail(item) {
    const tbody = document.getElementById('weatherDetailBody');
    const summary = document.getElementById('weatherSummary');
    const title = document.getElementById('weatherModalTitle');

    tbody.innerHTML = '';
    const date = new Date(item.forecastDate);
    const weekday = date.toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' });
    title.textContent = `📅 ${weekday} 일기예보 상세`;
    summary.textContent = `오전 ${item.forecastSkyAm}, 오후 ${item.forecastSkyPm}, 평균 강수확률 ${(item.forecastPrecipProbAm + item.forecastPrecipProbPm) / 2}%`;

    const rows = [
        ['오전', item.forecastTemperatureAmC, item.forecastSkyAm, item.forecastPrecipProbAm],
        ['오후', item.forecastTemperaturePmC, item.forecastSkyPm, item.forecastPrecipProbPm]
    ];

    rows.forEach(([time, temp, sky, rain]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${time}</td>
            <td>${temp.toFixed(1)}</td>
            <td><img src="${getIconPath(sky)}" class="weather-icon me-2" />${sky}</td>
            <td>${rain}%</td>
        `;
        tbody.appendChild(tr);
    });

    const modal = new bootstrap.Modal(document.getElementById('weatherDetailModal'));
    modal.show();
}