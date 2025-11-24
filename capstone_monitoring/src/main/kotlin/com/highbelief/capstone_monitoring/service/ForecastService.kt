package com.highbelief.capstone_monitoring.service

import com.highbelief.capstone_monitoring.entity.ForecastArima
import com.highbelief.capstone_monitoring.entity.ForecastSarima
import com.highbelief.capstone_monitoring.repository.ForecastArimaRepository
import com.highbelief.capstone_monitoring.repository.ForecastSarimaRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

// ForecastService는 예측 관련 비즈니스 로직을 담당하는 서비스 계층 컴포넌트임을 나타냄
@Service
class ForecastService(
    // ARIMA 예측 데이터를 처리하는 리포지토리 주입
    private val arimaRepo: ForecastArimaRepository,

    // SARIMA 예측 데이터를 처리하는 리포지토리 주입
    private val sarimaRepo: ForecastSarimaRepository
) {

    // ARIMA 예측 데이터를 조회하는 서비스 메서드
    // forecastDate가 start ~ end 사이에 있는 예측 결과를 반환
    fun getArimaForecasts(start: LocalDate, end: LocalDate): List<ForecastArima> =
        arimaRepo.findByForecastDateBetween(start, end)

    // SARIMA 예측 데이터를 조회하는 서비스 메서드
    // forecastStart ≥ start AND forecastEnd ≤ end 조건에 해당하는 예측 결과를 반환
    fun getSarimaForecasts(start: LocalDate, end: LocalDate): List<ForecastSarima> =
        sarimaRepo.findByForecastStartGreaterThanEqualAndForecastEndLessThanEqual(start, end)
}
