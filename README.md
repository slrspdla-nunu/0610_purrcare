# PurrCare 🐾

고양이 전용 용품 쇼핑몰 메인 페이지 — SVG 디자인을 HTML / CSS / JavaScript로 구현한 반응형 웹사이트입니다.

## 미리보기

`index.html` 파일을 브라우저로 열면 바로 확인할 수 있습니다.

## 구성

| 영역 | 설명 |
|------|------|
| 헤더 | 로고 · GNB 메뉴 · 검색/마이/장바구니 아이콘 (스크롤 시 그림자) |
| 히어로 | 풀스크린 배경 이미지 + 메인 카피 + CTA 버튼 |
| BEST SELLER | 인기 상품 5종 카드 (호버 확대) |
| CAT LIFE | 어두운 배경 + 메인 이미지 + 썸네일 전환 + 진행바 |
| FIND A STORE | 매장 지도 + 서비스 3종 카드 |
| 공지 & 이벤트 | 공지 리스트 + 신규회원 쿠폰 이벤트 카드 |
| 푸터 | 회사 정보 · 약관 링크 |

## 폴더 구조

```
purrcare3/
├─ index.html
├─ css/
│  ├─ reset.css
│  └─ style.css
├─ script/
│  ├─ jquery-4.0.0.min.js
│  └─ main.js
└─ image/
   └─ main/        # 페이지에서 사용하는 이미지
```

## 사용 기술

- HTML5 / CSS3 (Grid · Flexbox · 반응형)
- JavaScript (jQuery 4.0.0, IntersectionObserver 스크롤 애니메이션)

## 컬러 팔레트

- 배경 `#FAF8F6` · 메인 그린 `#62743F` · 포인트 `#8AA060` · 이벤트 레드 `#CA2A45`
