package com.highbelief.capstone_monitoring.dto

// 특정 기간(period)에 대한 측정 요약 정보를 담는 DTO
data class MeasurementSummaryDTO(
    // 요약 대상 기간 (예: "2025-05-01", "2025-05", "2025" 등)
    val period: String,

    // 해당 기간의 총 발전량 (단위: MWh)
    val totalMwh: Double,

    // 해당 기간의 평균 일사량 (단위: W/m² 또는 kWh/m² depending on source)
    val avgIrradiance: Double,

    // 해당 기간의 평균 기온 (단위: °C)
    val avgTemperature: Double
)
