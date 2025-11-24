package com.highbelief.capstone_monitoring.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.provisioning.InMemoryUserDetailsManager
import org.springframework.security.web.SecurityFilterChain

// ✅ Spring Security 설정 클래스로 등록
@Configuration
@EnableWebSecurity
class SecurityConfig {

    // 🔐 SecurityFilterChain 빈 등록 - 보안 규칙 정의
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // ✅ CSRF 보호 비활성화 (폼 기반 로그인 시 개발 단계에서 주로 사용)
            .csrf { it.disable() }

            // ✅ 요청 경로별 접근 권한 설정
            .authorizeHttpRequests {
                it
                    // 🔓 로그인 페이지, 정적 리소스는 인증 없이 접근 허용
                    .requestMatchers(
                        "/login.html",
                        "/css/**",
                        "/js/**",
                        "/img/**" // ✅ 이미지 경로 허용 추가 (로고 등 사용 가능)
                    ).permitAll()
                    // 🔒 그 외 모든 요청은 인증 필요
                    .anyRequest().authenticated()
            }

            // ✅ 폼 로그인 설정
            .formLogin {
                it
                    .loginPage("/login.html")               // 커스텀 로그인 페이지 경로
                    .loginProcessingUrl("/login")           // 로그인 처리 POST 엔드포인트
                    .defaultSuccessUrl("/index.html", true) // 로그인 성공 시 이동할 페이지
                    .permitAll()                            // 로그인 자체는 누구나 접근 가능
            }

            // ✅ 로그아웃 설정
            .logout {
                it
                    .logoutUrl("/logout")                  // 로그아웃 처리 경로
                    .logoutSuccessUrl("/login.html")       // 로그아웃 후 이동할 경로
            }

        return http.build()
    }

    // 👤 인메모리 사용자 설정 (ID: admin, PW: solar2025)
    @Bean
    fun userDetailsService(): UserDetailsService {
        val user = User.withUsername("admin")
            .password("{noop}solar2025") // {noop}: 비암호화 저장 방식 (테스트 용도)
            .roles("USER")               // 권한 설정
            .build()

        return InMemoryUserDetailsManager(user)
    }
}
