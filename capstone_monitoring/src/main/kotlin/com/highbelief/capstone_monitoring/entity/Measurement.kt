package com.highbelief.capstone_monitoring.entity

import jakarta.persistence.*
import java.time.LocalDateTime

// JPA 엔티티 선언: 이 클래스는 DB 테이블과 매핑됨
@Entity
// 매핑될 테이블 이름은 measurement
@Table(name = "measurement")
data class Measurement(
    // 기본 키: 자동 증가되는 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // 실측 시각 (측정된 데이터의 타임스탬프)
    @Column(name = "measured_at")
    val measuredAt: LocalDateTime,

    // 측정된 순간 발전 출력 (단위: MW, 순간값)
    @Column(name = "power_mw")
    val powerMw: Float?,

    // 누적 발전량 (단위: MWh)
    @Column(name = "cumulative_mwh")
    val cumulativeMwh: Float?,

    // 측정된 일사량 (단위: W/m²)
    @Column(name = "irradiance_wm2")
    val irradianceWm2: Float?,

    // 측정된 기온 (단위: °C)
    @Column(name = "temperature_c")
    val temperatureC: Float?,

    // 측정된 풍속 (단위: m/s)
    @Column(name = "wind_speed_ms")
    val windSpeedMs: Float?,

    // 예보된 일사량 (단위: W/m²)
    @Column(name = "forecast_irradiance_wm2")
    val forecastIrradianceWm2: Float?,

    // 예보된 기온 (단위: °C)
    @Column(name = "forecast_temperature_c")
    val forecastTemperatureC: Float?,

    // 예보된 풍속 (단위: m/s)
    @Column(name = "forecast_wind_speed_ms")
    val forecastWindSpeedMs: Float?,

    // 레코드 생성 시각, 기본값은 현재 시간 (MySQL DATETIME 형식)
    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    val createdAt: LocalDateTime? = null
)
