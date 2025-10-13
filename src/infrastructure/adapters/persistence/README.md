# Repository 테스트 가이드

## 📋 테스트 구조

이 프로젝트는 두 가지 유형의 Repository 테스트를 제공합니다:

### 1. 단위 테스트 (Unit Tests) ✅
- **파일**: `*.repository.impl.spec.ts`
- **특징**: Mock 객체를 사용한 격리된 테스트
- **실행 속도**: 빠름 (~1-2초)
- **DB 필요**: 불필요

### 2. 통합 테스트 (Integration Tests) 🔄
- **파일**: `*.repository.integration.spec.ts`
- **특징**: 실제 MySQL DB를 사용한 테스트
- **실행 속도**: 느림 (~20-30초)
- **DB 필요**: 필수

---

## 🚀 테스트 실행 방법

### 단위 테스트만 실행
```bash
npm test -- repository.impl.spec
```

### 통합 테스트 실행
```bash
# .env.local 파일에 DB 설정 필요
npm test -- integration.spec --testTimeout=30000
```

### 전체 Repository 테스트 실행
```bash
npm test -- persistence/
```

### 커버리지 포함 테스트
```bash
npm run test:cov -- repository.impl.spec
```

---

## 📊 테스트 커버리지 (단위 테스트 기준)

| Repository | 커버리지 | 테스트 수 |
|-----------|---------|---------|
| ArticleRepositoryImpl | 92.39% | 19개 |
| SourceRepositoryImpl | 100% | 17개 |
| **전체** | **96%+** | **36개** |

---

## 📝 단위 테스트 목록

### ArticleRepositoryImpl (19개)

#### CRUD 테스트
- ✅ 새 기사 저장 (save - create)
- ✅ 기존 기사 업데이트 (save - update)
- ✅ 저장 실패 시 에러 처리
- ✅ ID로 기사 조회 (findById)
- ✅ 존재하지 않는 기사 조회
- ✅ URL로 기사 조회 (findByUrl)
- ✅ URL로 기사 찾지 못함

#### 검색 및 필터링
- ✅ 필터 없이 전체 조회 (findAll)
- ✅ sourceId 필터로 조회
- ✅ 날짜 범위 필터로 조회
- ✅ 페이지네이션 (findPaginated)
- ✅ 키워드 검색 (ArticleIndex 활용)
- ✅ 키워드 검색 결과 없음

#### 대량 처리
- ✅ 대량 저장 (saveBulk)
- ✅ 빈 배열 대량 저장
- ✅ 대량 저장 실패 에러 처리

#### 카운트
- ✅ 소스별 기사 수 조회 (countBySourceId)
- ✅ 기사가 없는 소스의 카운트

### SourceRepositoryImpl (17개)

#### CRUD 테스트
- ✅ 새 소스 저장 (save - create)
- ✅ 기존 소스 업데이트 (save - update)
- ✅ 저장 실패 시 에러 처리
- ✅ ID로 소스 조회 (findById)
- ✅ 존재하지 않는 소스 조회
- ✅ title로 소스 조회 (findByName)
- ✅ title로 소스 찾지 못함
- ✅ 소스 삭제 (delete - 성공)
- ✅ 소스 삭제 (delete - 실패)
- ✅ 삭제 실패 시 에러 처리

#### 조회
- ✅ 전체 소스 조회 (findAll)
- ✅ 빈 결과 조회
- ✅ findAllActive (PRD 맞춤 - isActive 필터 없음)
- ✅ findAll과 findAllActive 동일성 검증

#### PRD 준수
- ✅ updateLastScrapedAt (no-op)
- ✅ updateLastScrapedAt 다양한 ID 테스트

#### 통합 시나리오
- ✅ 생성 -> 조회 -> 수정 -> 삭제 라이프사이클

---

## 🔧 통합 테스트 설정

통합 테스트는 실제 MySQL 데이터베이스 연결이 필요합니다.

### 필수 설정

1. `.env.local` 파일에 다음 설정 추가:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=font_ninja
DB_PASSWORD=fontninja@password
DB_DATABASE=font_ninja_scrapping_db
```

2. MySQL 서버 실행 확인:
```bash
mysql -u font_ninja -p -e "SELECT 1"
```

3. 데이터베이스 마이그레이션:
```bash
npm run migrate
```

### 통합 테스트 특징
- 실제 DB 트랜잭션 사용
- 테스트 데이터 자동 정리 (afterEach, afterAll)
- 롤백 테스트 포함
- 실제 Sequelize 관계 검증

---

## ⚠️ 주의사항

### 단위 테스트
- Mock 객체 사용으로 DB 불필요
- 빠른 실행 속도
- CI/CD에 적합
- 로직 검증에 집중

### 통합 테스트
- **주의**: 실제 DB 사용으로 기존 데이터 영향 가능
- 테스트 환경 DB 사용 권장
- 느린 실행 속도
- End-to-End 검증

---

## 🐛 트러블슈팅

### 에러: "Article has not been defined"
- **원인**: Sequelize 모델 등록 누락
- **해결**: forFeature에 모든 관련 모델 포함

### 경고: "Model is declaring public class fields"
- **원인**: Sequelize public fields와 getter/setter 충돌
- **해결**: Mapper에서 `.get()` 메서드 사용 (이미 적용됨)

### 타임아웃 에러
- **원인**: DB 연결 지연 또는 느린 쿼리
- **해결**: `--testTimeout=30000` 옵션 추가

---

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Sequelize 공식 문서](https://sequelize.org/)
- [Given-When-Then 패턴](https://martinfowler.com/bliki/GivenWhenThen.html)
