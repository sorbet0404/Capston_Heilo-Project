// index.js – 홈 화면 전용 스크립트

window.addEventListener('DOMContentLoaded', () => {
    setupRealtimeClock();
    setupNavigation();               // ✅ 이 줄을 추가
    loadTodayWeatherIcon();
    updateSidebarInfo();
    updateForecastGeneration();      // ✅ 예측 발전량 추가
    setupLogoutButton();
});

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

// 시계 표시
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

// 날씨 아이콘 경로
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

// 날씨 로딩
function loadTodayWeatherIcon() {
    fetch('/api/forecast')
        .then(res => res.json())
        .then(data => {
            const today = new Date().toISOString().split('T')[0];
            const todayForecast = data.find(item => item.forecastDate === today);
            if (todayForecast) {
                const icon = getIconPath(todayForecast.forecastSkyPm);
                document.getElementById('todayWeatherIcon').src = icon;
            }
        })
        .catch(err => console.error('날씨 정보 로딩 실패:', err));
}

// 실시간 소비량 업데이트
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
            const usageRatio = 0.4 + Math.random() * 0.4;
            const usage = total * usageRatio;

            document.getElementById('totalGeneration').textContent = total.toFixed(2) + ' MWh';
            document.getElementById('estimatedProfit').textContent = revenue.toLocaleString() + ' KRW';
            document.getElementById('currentUsage').textContent = usage.toFixed(2) + ' MWh';
        });
}

// ✅ 예측 발전량 로딩 함수
function updateForecastGeneration() {
    const today = new Date().toISOString().split('T')[0];

    fetch(`/api/forecast/arima?start=${today}&end=${today}`)
        .then(res => res.json())
        .then(data => {
            const forecastElement = document.getElementById('forecastGeneration');
            const forecast = data.find(entry => entry.forecastDate === today);
            if (forecast && forecast.predictedMwh !== undefined) {
                forecastElement.textContent = `${forecast.predictedMwh.toFixed(2)} MWh`;
            } else {
                forecastElement.textContent = "데이터 없음";
            }
        })
        .catch(err => {
            console.error('예측 발전량 로딩 실패:', err);
            const el = document.getElementById('forecastGeneration');
            if (el) el.textContent = "데이터 오류";
        });
}

