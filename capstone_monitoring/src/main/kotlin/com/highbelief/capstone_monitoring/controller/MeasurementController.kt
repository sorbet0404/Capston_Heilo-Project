package com.highbelief.capstone_monitoring.controller

// DTO와 Entity, Service 클래스 임포트
import com.highbelief.capstone_monitoring.dto.MeasurementSummaryDTO
import com.highbelief.capstone_monitoring.entity.Measurement
import com.highbelief.capstone_monitoring.service.MeasurementService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime

// 이 클래스는 REST 컨트롤러로 동작하며, 반환값은 JSON으로 자동 변환됨
@RestController
// 이 컨트롤러의 기본 URL 경로는 /api/measurements
@RequestMapping("/api/measurements")
class MeasurementController(
    // MeasurementService를 주입받음 (의존성 주입)
    private val service: MeasurementService
) {

    // 실측 데이터를 시간 구간(start ~ end)으로 조회하는 API
    // 예: GET /api/measurements?start=2025-05-01T00:00:00&end=2025-05-01T23:59:59
    @GetMapping
    fun getMeasurements(
        // 쿼리 파라미터 'start'를 ISO 형식의 LocalDateTime으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) start: LocalDateTime,
        // 쿼리 파라미터 'end'를 ISO 형식의 LocalDateTime으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) end: LocalDateTime
    ): List<Measurement> =
        // 해당 시간 범위의 측정 데이터를 서비스에서 가져옴
        service.getMeasurements(start, end)

    // 특정 일자 기준으로 일/월/연 단위 요약 데이터를 조회하는 API
    // 예: GET /api/measurements/summary?type=day&date=2025-05-01
    @GetMapping("/summary")
    fun getSummary(
        // 요약 유형 (예: day, month, year)
        @RequestParam type: String,
        // 기준 날짜를 ISO 형식(LocalDate)으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): List<MeasurementSummaryDTO> =
        // 서비스에서 요약 데이터를 조회하여 반환
        service.getSummary(type, date)
}
