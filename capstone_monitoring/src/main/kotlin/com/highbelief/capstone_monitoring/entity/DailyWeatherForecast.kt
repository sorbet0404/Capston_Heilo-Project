package com.highbelief.capstone_monitoring.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity // 이 클래스가 JPA 엔티티(데이터베이스 테이블에 매핑됨)임을 나타냄
@Table(
    name = "daily_weather_forecast", // 매핑될 테이블 이름
    uniqueConstraints = [UniqueConstraint(columnNames = ["forecast_date"])] // forecast_date는 유니크 제약 조건
)
data class DailyWeatherForecast(

    @Id // 기본 키(primary key) 필드
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB가 자동으로 증가시켜주는 방식 (MySQL의 AUTO_INCREMENT)
    val id: Long = 0,

    @Column(name = "forecast_date", nullable = false) // 날짜별로 중복 없이 예보 저장
    val forecastDate: LocalDate, // 예보 날짜 (ex: 2025-06-01)

    val location: String, // 예보 지역 (ex: 서울, 부산 등)

    @Column(name = "forecast_temperature_am_c")
    val forecastTemperatureAmC: Float? = null, // 오전 시간대의 기온 (섭씨)

    @Column(name = "forecast_temperature_pm_c")
    val forecastTemperaturePmC: Float? = null, // 오후 시간대의 기온 (섭씨)

    @Column(name = "forecast_precip_prob_am")
    val forecastPrecipProbAm: Float? = null, // 오전 시간대의 강수 확률 (0~100%)

    @Column(name = "forecast_precip_prob_pm")
    val forecastPrecipProbPm: Float? = null, // 오후 시간대의 강수 확률

    @Column(name = "forecast_temperature_min_c")
    val forecastTemperatureMinC: Float? = null, // 하루 중 최저 기온

    @Column(name = "forecast_temperature_max_c")
    val forecastTemperatureMaxC: Float? = null, // 하루 중 최고 기온

    @Column(name = "forecast_precip_prob")
    val forecastPrecipProb: Float? = null, // 평균 강수 확률

    @Column(name = "forecast_sky_am")
    val forecastSkyAm: String? = null, // 오전 하늘 상태 (예: 맑음, 흐림, 구름 많음 등)

    @Column(name = "forecast_sky_pm")
    val forecastSkyPm: String? = null, // 오후 하늘 상태

    @Column(name = "created_at")
    val createdAt: LocalDateTime? = null // 데이터 생성 시각 (DB에서 자동 설정됨)
)
