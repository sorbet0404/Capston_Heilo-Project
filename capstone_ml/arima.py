import pandas as pd
import numpy as np
import pmdarima as pm
from pmdarima import auto_arima
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
import joblib
import matplotlib.pyplot as plt

# 🔹 1. 데이터 불러오기 (CSV 파일에서 읽기)
# 발전량 시계열 데이터 로드 (기상청 CSV 등)
df = pd.read_csv("목포대_태양광_예측_2024_2025.csv", encoding='utf-8')  # cp949도 가능

# 🔹 2. 날짜/시간 처리
# 날짜 문자열을 datetime으로 변환하고, 시간 열에서 '시' 제거 후 시간 형식 문자열로 처리
df['날짜'] = pd.to_datetime(df['날짜'], format='%Y%m%d')
df['시간'] = df['시간'].str.replace('시', '').astype(int).astype(str)
df['datetime'] = pd.to_datetime(df['날짜'].dt.strftime('%Y-%m-%d') + ' ' + df['시간'] + ':00')

# 🔹 3. datetime을 인덱스로 설정
df.set_index('datetime', inplace=True)

# 🔹 4. 누적 발전량 컬럼 전처리
# '-' 기호를 NaN으로 처리하고, 결측값이 있는 행 제거
df['오늘 누적(kWh)'] = pd.to_numeric(df['오늘 누적(kWh)'], errors='coerce')
df.dropna(subset=['오늘 누적(kWh)'], inplace=True)

# 예측 대상 시계열 추출
series = df['오늘 누적(kWh)']

# 🔹 5. 학습/테스트 데이터 분리 (최근 7일치 테스트)
train = series[:-24*7]  # 이전 구간으로 학습
test = series[-24*7:]   # 최근 7일 예측용 테스트 데이터

# 🔹 6. ARIMA 모델 학습 (비계절성)
print("\n=== ARIMA 모델 ===")
arima_model = auto_arima(train,
                         seasonal=False,        # 비계절성 설정
                         stepwise=True,         # 자동 파라미터 탐색
                         suppress_warnings=True)  # 경고 억제

arima_model.fit(train)
arima_forecast = arima_model.predict(n_periods=len(test))

# 🔹 7. ARIMA 성능 평가
arima_rmse = np.sqrt(mean_squared_error(test, arima_forecast))
arima_mae = mean_absolute_error(test, arima_forecast)
arima_mape = mean_absolute_percentage_error(test, arima_forecast) * 100

print(f"ARIMA RMSE: {arima_rmse:.2f}")
print(f"ARIMA MAE: {arima_mae:.2f}")
print(f"ARIMA MAPE: {arima_mape:.2f}%")

# 🔹 8. ARIMA 예측 시각화
plt.figure(figsize=(12, 5))
plt.plot(test.index, test, label='실제값')
plt.plot(test.index, arima_forecast, label='ARIMA 예측', linestyle='--')
plt.title('ARIMA 예측 결과')
plt.xlabel('시간')
plt.ylabel('누적 발전량 (kWh)')
plt.legend()
plt.grid(True)
plt.show()

# 🔹 9. SARIMA 모델 학습 (계절성 포함)
print("\n=== SARIMA 모델 ===")
sarima_model = auto_arima(train,
                          seasonal=True,         # 계절성 사용
                          m=24,                  # 하루 주기 (24시간)
                          stepwise=True,
                          suppress_warnings=True)

sarima_model.fit(train)
sarima_forecast = sarima_model.predict(n_periods=len(test))

# 🔹 10. SARIMA 성능 평가
sarima_rmse = np.sqrt(mean_squared_error(test, sarima_forecast))
sarima_mae = mean_absolute_error(test, sarima_forecast)
sarima_mape = mean_absolute_percentage_error(test, sarima_forecast) * 100

print(f"SARIMA RMSE: {sarima_rmse:.2f}")
print(f"SARIMA MAE: {sarima_mae:.2f}")
print(f"SARIMA MAPE: {sarima_mape:.2f}%")

# 🔹 11. SARIMA 예측 시각화
plt.figure(figsize=(12, 5))
plt.plot(test.index, test, label='실제값')
plt.plot(test.index, sarima_forecast, label='SARIMA 예측', linestyle='--')
plt.title('SARIMA 예측 결과')
plt.xlabel('시간')
plt.ylabel('누적 발전량 (kWh)')
plt.legend()
plt.grid(True)
plt.show()

# 🔹 12. 학습된 모델 저장 (joblib 사용)
joblib.dump(arima_model, 'arima_model.pkl')
joblib.dump(sarima_model, 'sarima_model.pkl')

print("\n✅ 모델 저장 완료: 'arima_model.pkl', 'sarima_model.pkl'")
