# News Scraper API

> Hexagonal Architecture 기반의 엔터프라이즈급 뉴스 스크래핑 및 관리 시스템

[![NestJS](https://img.shields.io/badge/NestJS-v11.1.6-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red)]()

## 📖 프로젝트 개요

Hacker News를 포함한 다양한 뉴스 소스에서 기사를 자동으로 수집하고 관리하는 REST API 서비스입니다.
Clean Architecture와 Hexagonal Architecture 원칙을 따라 설계되어 유지보수성, 테스트 가능성, 확장성을 극대화했습니다.

## ✨ 주요 특징

### 🏗️ 아키텍처
- **Hexagonal Architecture (포트와 어댑터 패턴)** - 계층 간 명확한 책임 분리
- **Domain-Driven Design (DDD)** - 비즈니스 로직 중심 설계
- **의존성 역전 원칙 (DIP)** - 인터페이스를 통한 느슨한 결합
- **Repository Pattern** - 데이터 접근 추상화
- **Mapper Pattern** - 도메인과 영속성 계층 분리

### 🔧 기술 스택
- **프레임워크**: NestJS v11.1.6
- **언어**: TypeScript v5.9.3 (strict mode)
- **데이터베이스**: MySQL 8.0 + Sequelize ORM
- **웹 스크래핑**: Axios + Cheerio
- **API 문서**: Swagger (OpenAPI)
- **검증**: class-validator, class-transformer
- **코드 품질**: ESLint v9 + Prettier

### 🚀 핵심 기능
- ✅ Hacker News 자동 스크래핑 (Rate Limiting, Retry)
- ✅ 기사 CRUD 관리
- ✅ 키워드 검색 (제목 인덱싱)
- ✅ 페이지네이션 지원
- ✅ 중복 기사 방지 (URL 기반)
- ✅ 헬스체크 엔드포인트 (Kubernetes 지원)
- ✅ 일관된 API 응답 형식
- ✅ 전역 예외 처리 및 로깅

## 📁 프로젝트 구조

```
test-technique/
├── docs/                           # 📚 상세 문서
│   ├── PROJECT_STRUCTURE.md
│   ├── hexagonal-architecture.md
│   ├── REPOSITORY_IMPLEMENTATION.md
│   ├── database-setup.md
│   └── scraper-guide.md
│
├── src/
│   ├── domain/                     # 🎯 도메인 계층 (핵심 비즈니스 로직)
│   │   ├── entities/               # ArticleDomain, SourceDomain
│   │   ├── repositories/           # Repository 인터페이스
│   │   └── value-objects/
│   │
│   ├── application/                # 🎮 애플리케이션 계층 (Use Cases)
│   │   ├── ports/in/               # Inbound Ports
│   │   ├── ports/out/              # Outbound Ports
│   │   └── use-cases/
│   │
│   ├── infrastructure/             # 🔧 인프라 계층 (기술 구현)
│   │   └── adapters/
│   │       ├── persistence/        # Repository 구현, Mappers
│   │       ├── scraper/            # 웹 스크래퍼
│   │       └── web/                # HTTP 클라이언트
│   │
│   ├── presentation/               # 🌐 프레젠테이션 계층 (API)
│   │   ├── controllers/
│   │   └── dto/
│   │
│   ├── database/                   # 데이터베이스 설정
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── entities/                   # Sequelize 엔티티
│   ├── config/                     # 환경 설정
│   ├── health/                     # 헬스체크
│   ├── common/                     # 공통 컴포넌트
│   ├── app.module.ts
│   └── main.ts
│
├── test/                           # 테스트
├── .env.development                # 개발 환경 설정
├── .env.test                       # 테스트 환경 설정
├── .env.production                 # 프로덕션 환경 설정
├── docker-compose.yaml
└── package.json
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 20.x
- npm >= 10.x
- MySQL 8.0
- Docker & Docker Compose (선택사항)

### 설치

```bash
# 1. 저장소 클론
git clone <repository-url>
cd test-technique

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.development.example .env.development

# 4. MySQL 데이터베이스 시작 (Docker 사용 시)
docker-compose up -d mysql

# 5. 데이터베이스 마이그레이션
npm run migration:run

# 6. 초기 데이터 삽입 (선택사항)
npm run seed:run
```

### 환경 변수 설정

`.env.development` 파일 예시:

```env
# 애플리케이션
NODE_ENV=development
PORT=3000

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_scraper_dev
DB_USER=root
DB_PASSWORD=root
DB_SYNC=true
DB_LOGGING=true

# 스크래핑
SCRAPING_INTERVAL=30
SCRAPING_MAX_RETRIES=3
SCRAPING_TIMEOUT=10000
```

### 실행

```bash
# 개발 모드 (Hot Reload)
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod

# 디버그 모드
npm run start:debug
```

애플리케이션이 실행되면:
- API 서버: http://localhost:3000
- Swagger 문서: http://localhost:3000/api
- 헬스체크: http://localhost:3000/health

## 📡 API 엔드포인트

### 헬스체크

```bash
# 전체 헬스 상태
GET /health

# 라이브니스 프로브 (Kubernetes)
GET /health/liveness

# 레디니스 프로브 (Kubernetes)
GET /health/readiness
```

### 설정 조회 (개발 환경)

```bash
# 앱 설정
GET /config/app

# 데이터베이스 설정
GET /config/database

# 스크래핑 설정
GET /config/scraping
```

### API 응답 형식

**성공 응답**:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2025-10-13T11:00:00.000Z"
}
```

**에러 응답**:
```json
{
  "statusCode": 400,
  "timestamp": "2025-10-13T11:00:00.000Z",
  "path": "/api/articles",
  "method": "POST",
  "message": ["Validation error messages"]
}
```

## 🗄️ 데이터베이스

### ERD

```
sources (1) ─── (N) articles (1) ─── (N) article_indexes
```

### 주요 테이블

**sources** - 뉴스 소스 정보
- id, name, type, base_url
- is_active, scraping_interval
- last_scraped_at, article_count

**articles** - 수집된 기사
- id, title, original_url
- published_at, view_count
- source_id (FK)

**article_indexes** - 키워드 검색 인덱스
- id, article_id (FK), title_fragment

### 마이그레이션

```bash
# 마이그레이션 생성
npm run migration:generate -- migration-name

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert

# 시더 생성
npm run seed:generate -- seed-name

# 시더 실행
npm run seed:run
```

## 🕷️ 웹 스크래핑

### Hacker News 스크래퍼

**주요 기능**:
- Rate Limiting (200ms 간격)
- 자동 재시도 (지수 백오프)
- 타임아웃 처리 (10초)
- HTML 파싱 (Cheerio)
- 중복 방지

**테스트**:
```bash
npm run test:scraper
```

**구현 위치**:
- `src/infrastructure/adapters/scraper/hackernews.scraper.ts`
- `src/infrastructure/adapters/web/http-client.util.ts`

## 🧪 테스트

```bash
# 유닛 테스트
npm test

# 테스트 (Watch 모드)
npm run test:watch

# 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 🔍 코드 품질

```bash
# ESLint 검사
npm run lint

# Prettier 포맷팅
npm run format

# 타입 체크
npm run build
```

## 🐳 Docker

```bash
# 전체 스택 실행 (MySQL + 애플리케이션)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

## 📚 상세 문서

프로젝트의 각 측면에 대한 상세한 문서는 `docs/` 디렉토리에 있습니다:

- **[프로젝트 구조](.project-docs/PROJECT_STRUCTURE.md)** - 아키텍처 및 디렉토리 구조
- **[Hexagonal Architecture](.project-docs/hexagonal-architecture.md)** - 아키텍처 패턴 상세 설명
- **[Repository 구현](.project-docs/REPOSITORY_IMPLEMENTATION.md)** - Repository 패턴 가이드
- **[데이터베이스 설정](.project-docs/database-setup.md)** - DB 스키마 및 마이그레이션
- **[스크래퍼 가이드](.project-docs/scraper-guide.md)** - 웹 스크래핑 구현

## 🏗️ 아키텍처 원칙

### 계층 간 의존성 규칙

```
외부 (UI, DB, 외부 서비스)
    ↓
Infrastructure
    ↓
Application
    ↓
Domain (핵심)
```

**규칙**:
- ✅ Domain은 어떤 계층에도 의존하지 않음
- ✅ Application은 Domain에만 의존
- ✅ Infrastructure는 Domain/Application 인터페이스를 구현
- ✅ Presentation은 Application 포트에만 의존

**금지**:
- ❌ Domain이 Infrastructure를 import
- ❌ Application이 Infrastructure를 import

## 🛠️ 주요 패턴

1. **Repository Pattern** - 데이터 접근 추상화
2. **Mapper Pattern** - 도메인과 영속성 분리
3. **Port and Adapter Pattern** - 외부 의존성 격리
4. **Dependency Inversion** - 인터페이스 의존

## 📝 개발 가이드

### 새로운 기능 추가

1. **Domain Layer**: 도메인 엔티티 및 인터페이스 정의
2. **Application Layer**: Use Case 구현
3. **Infrastructure Layer**: Repository/Adapter 구현
4. **Presentation Layer**: Controller 및 DTO 작성
5. **Test**: 각 계층별 테스트 작성

### 코딩 컨벤션

- **파일명**: kebab-case (예: `article.domain.ts`)
- **클래스명**: PascalCase (예: `ArticleDomain`)
- **메서드/변수**: camelCase (예: `findArticleById`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRIES`)

## 🔐 보안

- ✅ 환경 변수로 민감 정보 관리
- ✅ SQL Injection 방지 (Sequelize ORM)
- ✅ 입력 검증 (class-validator)
- ✅ CORS 설정
- ⚠️ 인증/인가는 추후 구현 예정

## 🚀 배포

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 실행
NODE_ENV=production npm run start:prod
```

### 환경 변수 (프로덕션)

```env
NODE_ENV=production
PORT=3000
DB_SYNC=false  # 중요: 프로덕션에서는 false
DB_LOGGING=false
```

## 📊 성능 최적화

- ✅ 키워드 검색 인덱싱
- ✅ 데이터베이스 인덱스
- ✅ Connection Pooling (Sequelize)
- ✅ Rate Limiting (스크래퍼)
- ✅ SQL 증감 연산 (view_count)
- ✅ Bulk Operations (bulkCreate)

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

UNLICENSED - Private Use Only

## 👨‍💻 개발자

**Dongwoo VALLA-SHIN**

## 📞 지원

이슈가 있거나 질문이 있으면 GitHub Issues를 사용해주세요.

---

**Built with ❤️ using NestJS and Clean Architecture principles**
