package com.highbelief.capstone_monitoring.service

import com.highbelief.capstone_monitoring.dto.MeasurementSummaryDTO
import com.highbelief.capstone_monitoring.entity.Measurement
import com.highbelief.capstone_monitoring.repository.MeasurementRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime

// 서비스 계층 컴포넌트임을 나타냄. 컨트롤러에서 호출됨.
@Service
class MeasurementService(
    // MeasurementRepository 의존성 주입
    private val repo: MeasurementRepository
) {

    // 실측 데이터를 시간 범위(start ~ end)로 조회
    fun getMeasurements(start: LocalDateTime, end: LocalDateTime): List<Measurement> =
        repo.findByMeasuredAtBetween(start, end)

    // 일/월/연 단위 요약 데이터를 계산하여 DTO 형태로 반환
    fun getSummary(type: String, date: LocalDate): List<MeasurementSummaryDTO> {
        // 요약 유형에 따라 MySQL DATE_FORMAT 문자열 지정
        val format = when (type) {
            "daily" -> "%Y-%m-%d"    // 일 단위 요약
            "monthly" -> "%Y-%m"     // 월 단위 요약
            "yearly" -> "%Y"         // 연 단위 요약
            else -> throw IllegalArgumentException("Invalid summary type") // 잘못된 유형 처리
        }

        // 요약 시작 시각 계산
        val start = when (type) {
            "daily" -> date.atStartOfDay()                  // 자정부터 시작
            "monthly" -> date.withDayOfMonth(1).atStartOfDay()  // 해당 월의 1일 자정
            "yearly" -> date.withDayOfYear(1).atStartOfDay()    // 해당 해의 1월 1일 자정
            else -> throw IllegalArgumentException("Invalid type")
        }

        // 요약 종료 시각 계산
        val end = when (type) {
            "daily" -> start.plusDays(1)        // 하루 뒤
            "monthly" -> start.plusMonths(1)    // 한 달 뒤
            "yearly" -> start.plusYears(1)      // 1년 뒤
            else -> throw IllegalArgumentException("Invalid type")
        }

        // 리포지토리에서 통계 쿼리 실행 후, 결과를 MeasurementSummaryDTO 리스트로 변환
        return repo.getSummaryByPeriod(start, end, format).map {
            val period = it[0] as String                              // 그룹핑된 기간 (문자열)
            val total = (it[1] as? Number)?.toDouble() ?: 0.0         // 총 발전량 (nullable 안전 처리)
            val irr = (it[2] as? Number)?.toDouble() ?: 0.0           // 평균 일사량
            val temp = (it[3] as? Number)?.toDouble() ?: 0.0          // 평균 기온
            MeasurementSummaryDTO(period, total, irr, temp)          // DTO 객체로 변환
        }
    }
}
