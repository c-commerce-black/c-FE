# C-commerce 프론트엔드

[한국어](./README.ko.md) | [English](../README.md) | [日本語](./README.ja.md)

Next.js App Router 기반으로 구축한, 유통기한 임박 특가를 위한 모바일 우선 커머스 프론트엔드입니다.

이 저장소에는 다음이 포함되어 있습니다.

- 탐색, 상품 상세, 장바구니, 알림, 주문, 계정으로 이어지는 구매자 플로우
- 상품 등록과 대시보드 관리를 위한 판매자 플로우
- 인증, 상품, 장바구니, 주문, 알림, 판매자 API를 감싸는 BFF 스타일 라우트 핸들러
- Tailwind CSS, Framer Motion, Lucide, Zustand 기반의 모바일 앱 프레임 UI

## 기술 스택

- Next.js 16.2.1
- React 19
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Zustand
- Vitest
- Playwright

## 주요 기능

- `(store)` / `(auth)` 라우트 그룹 기반 App Router 구조
- 단일 `accessToken` HttpOnly 쿠키 세션 처리
- 필터 및 스크롤 복원을 지원하는 무한 스크롤 탐색 피드
- 내부 BFF 라우트 기반의 구매자/판매자 역할 분리 플로우
- 모바일 앱 뷰포트를 기준으로 설계된 상품, 장바구니, 알림, 주문 화면
- 동적 파비콘 및 Open Graph 이미지 생성

## 주요 라우트

사용자 대상 주요 경로:

- `/`
- `/explore`
- `/products/[id]`
- `/alerts`
- `/cart`
- `/orders/[id]/success`
- `/account`
- `/login`
- `/signup`
- `/signup/terms/[termKey]`
- `/seller`
- `/seller/products/new`

내부 API는 `/api/*` 아래에 있으며, 백엔드 API를 프록시하면서 세션 처리를 정리합니다.

## 환경 변수

`.env.example`를 기반으로 로컬 환경 파일을 만듭니다.

```bash
cp .env.example .env.local
```

필수 변수:

```env
API_BASE_URL=https://port-0-commerce-be-mmveg06487ac90d1.sel3.cloudtype.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=cc_access_token
```

## 시작하기

의존성 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

```bash
npm run dev         # Next.js 개발 서버 실행
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버 실행
npm run lint        # ESLint 실행
npm run test        # Vitest 단위 테스트 실행
npm run test:e2e    # Playwright E2E 테스트 실행
```

개발 중 webpack 기반 빌드 검증이 필요하면:

```bash
npm run build -- --webpack
```

## 테스트

단위 테스트는 유틸리티, 인증/세션 헬퍼, 커머스 데이터 동작을 검증합니다.

```bash
npm run test
```

E2E 테스트는 공개 네비게이션, 탐색 필터 동작, 시각 검토 스냅샷을 검증합니다.

```bash
npx playwright test
```

## 프로젝트 메모

- UI는 중앙 정렬된 모바일 앱 프레임 안에서만 보이도록 설계되어 있습니다.
- 탐색 화면은 페이지네이션 대신 무한 스크롤을 사용합니다.
- 문서형 상품 목록 API와 무한 스크롤용 피드 API를 내부적으로 분리해, 문서 정합성과 앱 UX를 함께 유지합니다.
- 공식 서비스 로고는 `/logo/c-commerce.png` 경로를 사용합니다.
