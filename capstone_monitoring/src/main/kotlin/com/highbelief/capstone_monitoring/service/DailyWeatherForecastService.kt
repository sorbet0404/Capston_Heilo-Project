package com.highbelief.capstone_monitoring.service

import com.highbelief.capstone_monitoring.entity.DailyWeatherForecast
import com.highbelief.capstone_monitoring.repository.DailyWeatherForecastRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service // Spring이 이 클래스를 서비스 빈으로 등록 (의존성 주입 대상)
class DailyWeatherForecastService(
    private val repository: DailyWeatherForecastRepository // 생성자 주입
) {

    // 저장된 모든 예보 데이터를 forecastDate 기준 내림차순으로 반환
    fun getAllForecasts(): List<DailyWeatherForecast> =
        repository.findAllByOrderByForecastDateDesc()

    // 특정 날짜의 예보가 존재하는 경우 반환, 없으면 null
    fun getForecastByDate(date: LocalDate): DailyWeatherForecast? =
        repository.findByForecastDate(date)

    // 특정 날짜 범위에 해당하는 예보들을 조회 (start 이상, end 이하 범위 포함)
    fun getForecastsBetween(start: LocalDate, end: LocalDate): List<DailyWeatherForecast> =
        repository.findByForecastDateBetween(start, end)

}
