package com.highbelief.capstone_monitoring.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

// 이 클래스는 JPA 엔티티로 선언되며 DB 테이블과 매핑됨
@Entity
// 이 엔티티는 forecast_arima 테이블에 매핑됨
@Table(name = "forecast_arima")
data class ForecastArima(
    // 기본 키 (ID), 자동 증가 전략 사용
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // 예측 대상 날짜 (일 단위)
    val forecastDate: LocalDate,

    // ARIMA 모델로 예측한 발전량 (단위: MWh)
    val predictedMwh: Float,

    // 실제 측정된 발전량 (예측 당시에는 null일 수 있음)
    val actualMwh: Float?,

    // 예측 정확도를 평가하는 RMSE (Root Mean Square Error)
    val rmse: Float?,

    // 예측 정확도를 평가하는 MAE (Mean Absolute Error)
    val mae: Float?,

    // 예측 정확도를 평가하는 MAPE (Mean Absolute Percentage Error)
    val mape: Float?,

    // 레코드 생성 시각, 기본값은 현재 시간 (MySQL DATETIME 기준)
    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    val createdAt: LocalDateTime? = null
)
