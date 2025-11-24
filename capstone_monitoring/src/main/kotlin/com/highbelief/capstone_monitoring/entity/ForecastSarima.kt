package com.highbelief.capstone_monitoring.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

// 이 클래스는 JPA 엔티티이며 DB 테이블과 매핑됨
@Entity
// 이 엔티티는 forecast_sarima 테이블과 매핑됨
@Table(name = "forecast_sarima")
data class ForecastSarima(
    // 기본 키 (자동 증가)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // 예측 시작일 (예: 주간, 월간 예측의 시작일)
    val forecastStart: LocalDate,

    // 예측 종료일 (예: 주간, 월간 예측의 종료일)
    val forecastEnd: LocalDate,

    // SARIMA 모델로 예측된 총 발전량 (예: 해당 기간의 총 MWh)
    val predictedMwh: Float,

    // 실제 측정된 총 발전량 (해당 기간의 실제 MWh, 아직 없으면 null)
    val actualMwh: Float?,

    // 예측 오차 지표 - RMSE (Root Mean Square Error)
    val rmse: Float?,

    // 예측 오차 지표 - MAE (Mean Absolute Error)
    val mae: Float?,

    // 예측 오차 지표 - MAPE (Mean Absolute Percentage Error)
    val mape: Float?,

    // 레코드 생성 시각, 기본값은 현재 시간 (MySQL DATETIME 기준)
    @Column(columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    val createdAt: LocalDateTime? = null
)
