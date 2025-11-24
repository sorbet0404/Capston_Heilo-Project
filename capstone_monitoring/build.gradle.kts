plugins {
	kotlin("jvm") version "1.9.25"
	kotlin("plugin.spring") version "1.9.25"
	id("org.springframework.boot") version "3.5.0"
	id("io.spring.dependency-management") version "1.1.7"
	id("org.jetbrains.kotlin.plugin.jpa") version "1.9.25"
}

group = "com.highbelief"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {
    // 필수
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // ✅ 웹 API (REST 컨트롤러)
    implementation("org.springframework.boot:spring-boot-starter-web")

    // ✅ JPA (DB 연동)
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // ✅ MySQL JDBC 드라이버
    implementation("com.mysql:mysql-connector-j:8.2.0")

    // ✅ Jackson (Kotlin <-> JSON 매핑)
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // ✅ Spring Security (하드코딩 로그인)
    implementation("org.springframework.boot:spring-boot-starter-security")

    // ✅ 테스트
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("com.mysql:mysql-connector-j:8.2.0")
	implementation("org.springframework.boot:spring-boot-starter-security")

	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
}


kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
