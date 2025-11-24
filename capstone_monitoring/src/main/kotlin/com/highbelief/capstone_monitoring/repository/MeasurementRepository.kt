// MeasurementRepository.kt
package com.highbelief.capstone_monitoring.repository

import com.highbelief.capstone_monitoring.entity.Measurement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

// Measurement 엔티티에 대한 데이터 접근을 제공하는 Spring Data JPA 리포지토리
interface MeasurementRepository : JpaRepository<Measurement, Long> {

    // 측정 시간(measured_at)이 주어진 시간 구간(start ~ end) 사이인 데이터를 조회
    fun findByMeasuredAtBetween(start: LocalDateTime, end: LocalDateTime): List<Measurement>

    // 주어진 시간 구간에서 일/월/연 단위로 측정값을 요약하여 반환하는 네이티브 SQL 쿼리
    // format 파라미터로 날짜 포맷 지정 (예: '%Y-%m-%d', '%Y-%m', '%Y')
    // 반환값은 [period, totalMwh, avgIrradiance, avgTemperature] 배열 형태
    @Query(
        value = """
        SELECT DATE_FORMAT(measured_at, :format) AS period,       -- 포맷에 따라 날짜를 그룹핑 키로 사용
               SUM(cumulative_mwh) AS totalMwh,                   -- 누적 발전량 합계
               AVG(irradiance_wm2) AS avgIrradiance,              -- 평균 일사량
               AVG(temperature_c) AS avgTemperature               -- 평균 기온
        FROM measurement
        WHERE measured_at BETWEEN :start AND :end                -- 주어진 시간 범위 내에서 필터링
        GROUP BY period                                           -- 날짜 형식에 따른 그룹핑
        ORDER BY period                                           -- 결과를 시간순 정렬
        """,
        nativeQuery = true
    )
    fun getSummaryByPeriod(
        @Param("start") start: LocalDateTime,     // 시작 시간
        @Param("end") end: LocalDateTime,         // 종료 시간
        @Param("format") format: String           // MySQL DATE_FORMAT 포맷 문자열
    ): List<Array<Any>>                           // 결과는 Object 배열 리스트로 반환 (DTO 변환 필요)
}
