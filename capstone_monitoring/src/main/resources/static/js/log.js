// log.js - HelioCast 로그 페이지 스크립트

window.addEventListener('DOMContentLoaded', () => {
    setupRealtimeClock();
    setupLogoutButton();
    setupNavigation();
    setupLogTabs();
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

function setupLogTabs() {
    document.querySelectorAll('.log-range-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const type = form.dataset.type;
            const start = form.querySelector('.start-date').value;
            const end = form.querySelector('.end-date').value;
            if (start && end) fetchLogData(type, start, end);
        });
    });
}

function fetchLogData(type, start, end) {
    let url = '', parser;
    switch (type) {
        case 'weather':
            url = `/api/forecast/daily?start=${start}&end=${end}`;
            parser = renderWeatherLogs;
            break;
        case 'measurement':
            url = `/api/measurements?start=${start}T00:00:00&end=${end}T23:59:59`;
            parser = renderMeasurementLogs;
            break;
        case 'arima':
            url = `/api/forecast/arima?start=${start}&end=${end}`;
            parser = renderArimaLogs;
            break;
        case 'sarima':
            url = `/api/forecast/sarima?start=${start}&end=${end}`;
            parser = renderSarimaLogs;
            break;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => parser(data))
        .catch(err => console.error(`${type} 로그 불러오기 실패`, err));
}

function renderWeatherLogs(data) {
    const tbody = document.getElementById('weatherLogBody');
    tbody.innerHTML = '';

    const labels = [];
    const tempAm = [];
    const tempPm = [];
    const rainAm = [];
    const rainPm = [];

    data.forEach(row => {
        labels.push(row.forecastDate);
        tempAm.push(row.forecastTemperatureAmC ?? null);
        tempPm.push(row.forecastTemperaturePmC ?? null);
        rainAm.push(row.forecastPrecipProbAm ?? null);
        rainPm.push(row.forecastPrecipProbPm ?? null);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.forecastDate}</td>
            <td>${row.forecastSkyAm ?? '-'}</td>
            <td>${row.forecastSkyPm ?? '-'}</td>
            <td>${row.forecastPrecipProbAm ?? '-'}%</td>
            <td>${row.forecastPrecipProbPm ?? '-'}%</td>
            <td>${row.forecastTemperatureAmC?.toFixed(1) ?? '-'}</td>
            <td>${row.forecastTemperaturePmC?.toFixed(1) ?? '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    const canvas = document.getElementById('weatherChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.weatherChart instanceof Chart) {
        window.weatherChart.destroy();
    }

    window.weatherChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '오전 기온 (℃)',
                    data: tempAm,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                },
                {
                    label: '오후 기온 (℃)',
                    data: tempPm,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)'
                },
                {
                    label: '오전 강수확률 (%)',
                    data: rainAm,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    yAxisID: 'y1'
                },
                {
                    label: '오후 강수확률 (%)',
                    data: rainPm,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
                x: {
                    title: { display: true, text: '예보 날짜' }
                },
                y: {
                    title: { display: true, text: '기온 (℃)' },
                    beginAtZero: true
                },
                y1: {
                    title: { display: true, text: '강수확률 (%)' },
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}


function renderMeasurementLogs(data) {
    const tbody = document.getElementById('measurementLogBody');
    tbody.innerHTML = '';

    const labels = [];
    const actualPower = [];
    const cumulativePower = [];

    data.forEach(row => {
        const timeLabel = new Date(row.measuredAt).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        labels.push(timeLabel);
        actualPower.push(row.powerMw);
        cumulativePower.push(row.cumulativeMwh);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.measuredAt}</td>
            <td>${row.powerMw}</td>
            <td>${row.cumulativeMwh}</td>
            <td>${row.irradianceWm2}</td>
            <td>${row.temperatureC}</td>
            <td>${row.windSpeedMs}</td>
            <td>${row.forecastIrradianceWm2}</td>
            <td>${row.forecastTemperatureC}</td>
            <td>${row.forecastWindSpeedMs}</td>
        `;
        tbody.appendChild(tr);
    });

    // 기존 데이터에서 유효한 값만 필터링
    const filteredData = labels.map((label, index) => {
        if (actualPower[index] != null && cumulativePower[index] != null) {
            return {
                label,
                actual: actualPower[index],
                cumulative: cumulativePower[index]
            };
        }
        return null;
    }).filter(d => d !== null);

// 필터링된 라벨과 데이터 재구성
    const cleanLabels = filteredData.map(d => d.label);
    const cleanActualPower = filteredData.map(d => d.actual);
    const cleanCumulativePower = filteredData.map(d => d.cumulative);

// 차트 렌더링
    const canvas = document.getElementById('generationChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.generationChart instanceof Chart) {
        window.generationChart.destroy();
    }

    window.generationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cleanLabels,
            datasets: [
                {
                    label: '실측 발전량 (MWh)',
                    data: cleanActualPower,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2
                },
                {
                    label: '누적 발전량 (MWh)',
                    data: cleanCumulativePower,
                    borderColor: 'green',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { title: { display: true, text: '시간' } },
                y: { title: { display: true, text: '발전량 (MWh)' }, beginAtZero: true }
            }
        }
    });

}

async function fetchActualCumulativeMwh(dateStr) {
    const start = `${dateStr}T00:00:00`;
    const end = `${dateStr}T23:59:59`;
    const res = await fetch(`/api/measurements?start=${start}&end=${end}`);
    const data = await res.json();

    // 측정된 시간 중 가장 마지막 값 추출
    const valid = data.filter(row => row.cumulativeMwh != null);
    if (valid.length === 0) return 0;

    const latest = valid.reduce((a, b) =>
        new Date(a.measuredAt) > new Date(b.measuredAt) ? a : b
    );
    return latest.cumulativeMwh;
}

async function renderArimaLogs(data) {
    const tbody = document.getElementById('arimaLogBody');
    tbody.innerHTML = '';

    const labels = [];
    const predicted = [];
    const actual = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const label = `${row.forecastDate} (${i + 1})`;
        labels.push(label);
        predicted.push(row.predictedMwh.toFixed(2));

        const actualMwh = await fetchActualCumulativeMwh(row.forecastDate);
        actual.push(actualMwh.toFixed(2));

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.forecastDate}</td>
            <td>${row.predictedMwh.toFixed(2)}</td>
            <td>${actualMwh.toFixed(2)}</td>
            <td>${row.rmse ?? '-'}</td>
            <td>${row.mae ?? '-'}</td>
            <td>${row.mape ?? '-'}</td>
        `;
        tbody.appendChild(tr);
    }

    const canvas = document.getElementById('arimaChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.arimaChart instanceof Chart) {
        window.arimaChart.destroy();
    }

    window.arimaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '예측 발전량 (MWh)',
                    data: predicted,
                    backgroundColor: 'rgba(0, 123, 255, 0.6)'
                },
                {
                    label: '실제 발전량 (MWh)',
                    data: actual,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)'
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
                x: {
                    title: { display: true, text: '예측일 (샘플순번)' },
                    stacked: false
                },
                y: {
                    title: { display: true, text: '발전량 (MWh)' },
                    beginAtZero: true,
                    stacked: false
                }
            }
        }
    });
}


async function renderSarimaLogs(data) {
    const tbody = document.getElementById('sarimaLogBody');
    tbody.innerHTML = '';

    const labels = [];
    const predicted = [];
    const actual = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const label = `${row.forecastStart} ~ ${row.forecastEnd} (${i + 1})`;
        labels.push(label);
        predicted.push(row.predictedMwh.toFixed(2));

        const forecastDate = row.forecastEnd.split('T')[0];  // 또는 forecastStart
        const actualMwh = await fetchActualCumulativeMwh(forecastDate);
        actual.push(actualMwh.toFixed(2));

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.forecastStart} ~ ${row.forecastEnd}</td>
            <td>${row.predictedMwh.toFixed(2)}</td>
            <td>${actualMwh.toFixed(2)}</td>
            <td>${row.rmse ?? '-'}</td>
            <td>${row.mae ?? '-'}</td>
            <td>${row.mape ?? '-'}</td>
        `;
        tbody.appendChild(tr);
    }

    const canvas = document.getElementById('sarimaChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.sarimaChart instanceof Chart) {
        window.sarimaChart.destroy();
    }

    window.sarimaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '예측 발전량 (MWh)',
                    data: predicted,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)'
                },
                {
                    label: '실제 발전량 (MWh)',
                    data: actual,
                    backgroundColor: 'rgba(108, 117, 125, 0.7)'
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
                x: {
                    title: { display: true, text: '예측 기간' },
                    stacked: false
                },
                y: {
                    title: { display: true, text: '발전량 (MWh)' },
                    beginAtZero: true,
                    stacked: false
                }
            }
        }
    });
}

