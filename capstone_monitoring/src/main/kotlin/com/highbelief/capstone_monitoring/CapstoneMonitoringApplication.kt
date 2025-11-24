package com.highbelief.capstone_monitoring

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

// Spring Boot 애플리케이션으로 등록하는 어노테이션
@SpringBootApplication
class CapstoneMonitoringApplication  // 메인 애플리케이션 클래스 (구성 설정 포함)

// Kotlin에서 main 함수를 정의하며, 애플리케이션을 실행함
fun main(args: Array<String>) {
    // Spring Boot 애플리케이션 실행
    runApplication<CapstoneMonitoringApplication>(*args)
}
