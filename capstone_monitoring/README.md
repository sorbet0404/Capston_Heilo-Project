다음은 프로젝트의 `README.md` 전체 예시입니다. 이 파일은 프로젝트의 목적, 기능, 실행 방법, 기술 스택 등을 안내합니다.

---

# ☀️ Capstone 태양광 발전 모니터링 시스템

본 프로젝트는 태양광 발전소의 실측 발전량과 예측 발전량(ARIMA, SARIMA)을 시각화하고 비교 분석할 수 있는 웹 기반 모니터링 시스템입니다.

---

## 📁 프로젝트 구조

```

src/main/resources/static
├── index.html          # 프론트엔드 메인 화면
├── css/style.css       # 스타일시트
└── js/main.js          # 데이터 요청 및 차트 렌더링

```

---

## ✅ 주요 기능

### 1. 실측 + ARIMA 예측
- 시간당 발전량 (MW), 누적 발전량 (MWh)을 선형 그래프로 표시
- ARIMA 예측 발전량은 그래프가 아닌 우측 수치로 표시

### 2. SARIMA 예측
- 예측 기간별 발전량 및 성능 지표(RMSE, MAE, MAPE)를 표로 확인 가능

---

## ⚙️ 실행 방법

### 1. Spring Boot 백엔드 실행
```bash
./gradlew bootRun
````

### 2. 접속 주소

```
http://localhost:5000
```

---

## 🔐 인증 정보

* ID: `admin`
* PW: `solar2025`

모든 API는 `Basic Auth` 인증 필요 (`Authorization: Basic base64(admin:solar2025)`)

---

## 🧪 사용 기술

* Kotlin + Spring Boot 3
* MySQL + Spring Data JPA (Hibernate)
* Chart.js (Frontend 시각화)
* HTML, CSS, JavaScript (Vanilla)

---

## 📌 참고 사항

* `ARIMA` 예측은 시간별 예측값이 없을 경우 직선(평균값)으로 표시됨
* `resources/static`의 정적 파일 수정은 서버 재시작 없이 반영 가능

---

## 👨‍💻 개발자 정보

* 이름: 김인겸
* GitHub: [https://github.com/highbelief](https://github.com/highbelief)
* 소속: 2025년 캡스톤 디자인2

```

추후 추가 예정
```
