package com.highbelief.capstone_monitoring.repository

import com.highbelief.capstone_monitoring.entity.ForecastSarima
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

// ForecastSarima 엔티티에 대한 CRUD 및 커스텀 쿼리를 제공하는 리포지토리 인터페이스
// JpaRepository<엔티티 클래스, 기본 키 타입>
interface ForecastSarimaRepository : JpaRepository<ForecastSarima, Long> {

    // forecastStart >= start AND forecastEnd <= end 조건을 만족하는 SARIMA 예측 데이터를 조회
    // 주어진 기간(start ~ end)에 완전히 포함되는 예측 구간만 필터링
    fun findByForecastStartGreaterThanEqualAndForecastEndLessThanEqual(
        start: LocalDate,
        end: LocalDate
    ): List<ForecastSarima>
}
