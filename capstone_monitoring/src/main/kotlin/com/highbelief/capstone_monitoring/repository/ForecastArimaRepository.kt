package com.highbelief.capstone_monitoring.repository

import com.highbelief.capstone_monitoring.entity.ForecastArima
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

// ForecastArima 엔티티에 대한 CRUD 및 쿼리 기능을 제공하는 리포지토리 인터페이스
// JpaRepository<엔티티 타입, 기본 키 타입>
interface ForecastArimaRepository : JpaRepository<ForecastArima, Long> {

    // forecastDate가 start ~ end 사이에 있는 모든 ForecastArima 엔티티를 조회
    // 메서드 이름 기반 쿼리 자동 생성 (Spring Data JPA 기능)
    fun findByForecastDateBetween(start: LocalDate, end: LocalDate): List<ForecastArima>
}
