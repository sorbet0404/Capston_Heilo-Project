import pandas as pd
import matplotlib.pyplot as plt
import joblib
from sklearn.metrics import mean_squared_error, mean_absolute_error
import numpy as np

# 1. 테스트 데이터 불러오기 및 전처리
# 발전량 테스트 데이터를 CSV로부터 로드하여 시간 인덱스로 변환하고 결측치 처리
df = pd.read_csv("test.csv", encoding='utf-8', na_values=['-'])
df['datetime'] = pd.to_datetime(df['날짜'].astype(str) + ' ' + df['시간'], format='%Y%m%d %H시')
df.set_index('datetime', inplace=True)
df['오늘 누적(kWh)'] = df['오늘 누적(kWh)'].astype(float)

# 실제 누적 발전량 시계열 생성 (결측값 제외)
y_test_full = df['오늘 누적(kWh)'].dropna()

# 2. 학습된 ARIMA/SARIMA 모델 불러오기
arima_model = joblib.load('arima_model.pkl')
sarima_model = joblib.load('sarima_model.pkl')

# 3. 예측 기간 정의 (1일, 6일)
day_len = 24
arima_len = day_len * 1    # 익일 예측용
sarima_len = day_len * 6   # 2~7일 예측용

# 4. 실제 테스트 대상 구간 설정
y_test_arima = y_test_full[:arima_len].dropna()
y_test_sarima = y_test_full[arima_len:arima_len + sarima_len].dropna()

# 5. 예측 수행 (ARIMA 및 SARIMA)
arima_pred = arima_model.predict(n_periods=len(y_test_arima))
sarima_pred = sarima_model.predict(n_periods=len(y_test_sarima))

# 6. MAPE 계산 함수 (0에 가까운 값 제외 처리)
def safe_mape(y_true, y_pred, threshold=1e-6):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = np.abs(y_true) > threshold
    if np.sum(mask) == 0:
        return np.nan
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

# 7. 성능 평가 함수 정의 (RMSE, MAE, MAPE)
def evaluate_model(name, y_true, y_pred):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    mape = safe_mape(y_true, y_pred)
    print(f"[{name} 성능]")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE : {mae:.2f}")
    print(f"MAPE: {mape:.2f}%\n")
    return {'모델': name, 'RMSE': rmse, 'MAE': mae, 'MAPE': mape}

# 8. 평가 수행 및 결과 저장
darima = evaluate_model("ARIMA (익일)", y_test_arima, arima_pred)
dsarma = evaluate_model("SARIMA (2~7일)", y_test_sarima, sarima_pred)

results_df = pd.DataFrame([darima, dsarma])
results_df.to_csv("성능지표_용도별.csv", index=False)

# 9. 예측 결과 시계열 저장
df_arima = pd.DataFrame({
    '실제 발전량': y_test_arima.values,
    'ARIMA 예측': arima_pred
}, index=y_test_arima.index)

df_sarima = pd.DataFrame({
    '실제 발전량': y_test_sarima.values,
    'SARIMA 예측': sarima_pred
}, index=y_test_sarima.index)

df_arima.to_csv("예측_ARIMA_익일.csv")
df_sarima.to_csv("예측_SARIMA_2~7일.csv")

# 10. 시각화 및 그래프 이미지 저장
plt.rcParams['font.family'] = 'Malgun Gothic'  # 한글 폰트 설정
plt.rcParams['axes.unicode_minus'] = False

# ARIMA 예측 결과 시각화
plt.figure(figsize=(14, 6))
plt.plot(y_test_arima.index, y_test_arima, label='실제 발전량 (ARIMA)', color='black')
plt.plot(y_test_arima.index, arima_pred, label='ARIMA 예측', linestyle='--')
plt.title('ARIMA 익일 예측 결과')
plt.xlabel('시간')
plt.ylabel('발전량 (kWh)')
plt.legend()
plt.tight_layout()
plt.savefig("ARIMA_예측그래프.png", dpi=300)
plt.show()

# SARIMA 예측 결과 시각화
plt.figure(figsize=(14, 6))
plt.plot(y_test_sarima.index, y_test_sarima, label='실제 발전량 (SARIMA)', color='black')
plt.plot(y_test_sarima.index, sarima_pred, label='SARIMA 예측', linestyle='--')
plt.title('SARIMA 중단기 예측 결과 (2~7일)')
plt.xlabel('시간')
plt.ylabel('발전량 (kWh)')
plt.legend()
plt.tight_layout()
plt.savefig("SARIMA_예측그래프.png", dpi=300)
plt.show()
