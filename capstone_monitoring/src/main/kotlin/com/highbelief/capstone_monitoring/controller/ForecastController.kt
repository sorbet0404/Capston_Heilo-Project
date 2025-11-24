package com.highbelief.capstone_monitoring.controller

import com.highbelief.capstone_monitoring.entity.ForecastArima
import com.highbelief.capstone_monitoring.entity.ForecastSarima
import com.highbelief.capstone_monitoring.service.ForecastService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

// RESTful 웹 컨트롤러로 선언. JSON 형태로 응답을 반환함
@RestController
// 이 컨트롤러의 기본 요청 경로는 /api/forecast
@RequestMapping("/api/forecast")
class ForecastController(
    // ForecastService를 주입받음 (의존성 주입)
    private val service: ForecastService
) {

    // ARIMA 예측 데이터를 조회하는 GET API
    // 예: GET /api/forecast/arima?start=2025-05-01&end=2025-05-10
    @GetMapping("/arima")
    fun getArimaForecasts(
        // 쿼리 파라미터 'start'를 ISO 형식(LocalDate)으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) start: LocalDate,
        // 쿼리 파라미터 'end'를 ISO 형식(LocalDate)으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) end: LocalDate
    ): List<ForecastArima> =
        // ForecastService를 통해 start ~ end 기간의 ARIMA 예측 결과를 반환
        service.getArimaForecasts(start, end)

    // SARIMA 예측 데이터를 조회하는 GET API
    // 예: GET /api/forecast/sarima?start=2025-05-01&end=2025-05-10
    @GetMapping("/sarima")
    fun getSarimaForecasts(
        // 쿼리 파라미터 'start'를 ISO 형식(LocalDate)으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) start: LocalDate,
        // 쿼리 파라미터 'end'를 ISO 형식(LocalDate)으로 파싱
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) end: LocalDate
    ): List<ForecastSarima> =
        // ForecastService를 통해 start ~ end 기간의 SARIMA 예측 결과를 반환
        service.getSarimaForecasts(start, end)
}
