package com.highbelief.capstone_monitoring.repository

import com.highbelief.capstone_monitoring.entity.DailyWeatherForecast
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface DailyWeatherForecastRepository : JpaRepository<DailyWeatherForecast, Long> {

    // 특정 날짜의 날씨 예보 데이터를 조회
    fun findByForecastDate(date: LocalDate): DailyWeatherForecast?

    // 모든 예보를 forecastDate 기준 내림차순으로 정렬하여 반환 (가장 최근 예보가 먼저 옴)
    fun findAllByOrderByForecastDateDesc(): List<DailyWeatherForecast>

    // start와 end 날짜 사이에 해당하는 예보 리스트 반환
    fun findByForecastDateBetween(start: LocalDate, end: LocalDate): List<DailyWeatherForecast>
}
