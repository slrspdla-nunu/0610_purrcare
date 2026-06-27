/**
 * PurrCare — main.js
 * 헤더 스크롤 효과 · 스크롤 등장 애니메이션 · 인터랙션
 */

/* ── 공용 장바구니 저장소 (localStorage, 전 페이지 공유) ── */
var PC_CART_KEY = 'purrcare_cart';
var PC_CART_DEFAULTS = [
    { name: '낭낭 플라잉 깃털 낚싯대', opt: '단품', price: 7900, image: 'image/main/best-thumb-feather-wand.png', qty: 1 },
    { name: '퓨어 자동 급식기', opt: '화이트 | 3.2L', price: 89000, image: 'image/main/best-thumb-auto-feeder.png', qty: 1 },
    { name: '클린 후드형 화장실', opt: '그린 | 대형', price: 49000, image: 'image/main/best-thumb-litter-box.png', qty: 1 }
];
function pcCartGet() {
    try {
        var v = localStorage.getItem(PC_CART_KEY);
        if (v === null) return PC_CART_DEFAULTS.slice();   // 최초 방문: 데모 기본 구성
        var arr = JSON.parse(v);
        return Array.isArray(arr) ? arr : PC_CART_DEFAULTS.slice();
    } catch (e) { return PC_CART_DEFAULTS.slice(); }
}
function pcCartSave(arr) {
    try {
        localStorage.setItem(PC_CART_KEY, JSON.stringify(arr));
        localStorage.setItem('purrcare_cart_count', arr.length);
    } catch (e) {}
    if (window.jQuery) {
        var $b = jQuery('.cart-badge');
        if ($b.length) $b.text(arr.length > 99 ? '99+' : arr.length).toggleClass('is-zero', arr.length <= 0);
    }
    // 장바구니 페이지 실시간 갱신용 알림
    try { window.dispatchEvent(new CustomEvent('pc-cart-changed')); } catch (e) {}
}
function pcCartHas(name) {
    return pcCartGet().some(function (i) { return i.name === name; });
}

/* ── 공용 찜(위시리스트) 저장소 (localStorage, 전 페이지 공유) ── */
var PC_WISH_KEY = 'purrcare_wish';
var PC_WISH_DEFAULTS = [
    { name: '포우 캣타워 캣트리', brand: '우다다', price: 139000, image: 'image/main/best-thumb-cat-tree.png' },
    { name: '퓨어 자동 급식기', brand: '페트이', price: 89000, image: 'image/main/best-thumb-auto-feeder.png' },
    { name: '클린 후드형 화장실', brand: '캣아이', price: 49000, image: 'image/main/best-thumb-litter-box.png' },
    { name: '플라잉 깃털 낚싯대', brand: '낭낭', price: 7900, image: 'image/main/best-thumb-feather-wand.png' },
    { name: '도자기 높이 식기', brand: 'PurrCare', price: 15900, image: 'image/main/best-thumb-ceramic-bowl.png' },
    { name: '면역케어 영양제 60정', brand: '펫비타', price: 23000, image: 'image/main/best-thumb-immune-supplement.png' }
];
function pcWishGet() {
    try {
        var v = localStorage.getItem(PC_WISH_KEY);
        if (v === null) return PC_WISH_DEFAULTS.slice();
        var arr = JSON.parse(v);
        return Array.isArray(arr) ? arr : PC_WISH_DEFAULTS.slice();
    } catch (e) { return PC_WISH_DEFAULTS.slice(); }
}
function pcWishSave(arr) {
    try { localStorage.setItem(PC_WISH_KEY, JSON.stringify(arr)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('pc-wish-changed')); } catch (e) {}
}
function pcWishHas(name) {
    return pcWishGet().some(function (i) { return i.name === name; });
}

/* ── 공용 토스트 알림 (화면 하단에서 슬라이드) ── */
function pcToast(msg, action) {
    var wrap = document.querySelector('.pc-toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'pc-toast-wrap'; document.body.appendChild(wrap); }
    // 한 번에 하나만: 기존 토스트 제거
    var olds = wrap.querySelectorAll('.pc-toast');
    for (var k = 0; k < olds.length; k++) { if (olds[k].parentNode) olds[k].parentNode.removeChild(olds[k]); }
    var t = document.createElement('div'); t.className = 'pc-toast';
    var s = document.createElement('span'); s.className = 'pc-toast-msg'; s.textContent = msg; t.appendChild(s);
    var timer;
    function close() { clearTimeout(timer); t.classList.remove('show'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }
    if (action && action.label) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pc-toast-action'; b.textContent = action.label;
        b.addEventListener('click', function () { close(); if (action.onClick) action.onClick(); });
        t.appendChild(b);
    }
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    timer = setTimeout(close, action ? 4200 : 2600);
}

$(function () {

    /* ── 1. 헤더 스크롤 그림자 ── */
    var $header = $('.header');
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 60) {
            $header.css('box-shadow', '0 2px 14px rgba(0,0,0,0.08)');
        } else {
            $header.css('box-shadow', 'none');
        }
    });

    /* ── 2. 스크롤 등장 애니메이션 (IntersectionObserver) ── */
    var targets = $('.product-card, .store-feature, .notice-list li, .event-card, .catlife-visual, .sec-head');

    targets.each(function (i) {
        $(this).css({
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'opacity .6s ease ' + ((i % 5) * 0.08) + 's, transform .6s ease ' + ((i % 5) * 0.08) + 's'
        });
    });

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    $(entry.target).css({ opacity: 1, transform: 'translateY(0)' });
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        targets.each(function () { io.observe(this); });
    } else {
        targets.css({ opacity: 1, transform: 'none' });
    }

    /* ── 3. CAT LIFE 진행바 + 썸네일 전환 ── */
    var $mainImg = $('.catlife-img img');
    var $thumbs = $('.catlife-thumbs .thumb');
    var $progress = $('.catlife-progress span');
    var current = 0;
    var total = $thumbs.length + 1;

    function setProgress(idx) {
        var pct = ((idx + 1) / total) * 100;
        $progress.css('width', pct + '%');
    }

    $thumbs.on('click', function () {
        var newSrc = $(this).find('img').attr('src');
        var oldSrc = $mainImg.attr('src');
        $mainImg.css('opacity', 0);
        setTimeout(function () {
            $mainImg.attr('src', newSrc).css('opacity', 1);
        }, 250);
        $(this).find('img').attr('src', oldSrc);
        setProgress($thumbs.index(this) + 1);
    });
    $mainImg.css('transition', 'opacity .25s ease');

    /* ── 4. 버튼 클릭 물결 피드백 ── */
    $('.btn').on('click', function (e) {
        if ($(this).attr('href') === '#' ) e.preventDefault();
    });

    /* ── 5. 장바구니 아이콘 클릭 ── */
    $('.util-btn').on('click', function () {
        $(this).stop().animate({ opacity: 0.4 }, 120).animate({ opacity: 1 }, 120);
    });

    /* ── 6. 이미지 로드 페이드인 ── */
    $('img').each(function () {
        var $img = $(this);
        if (this.complete) return;
        $img.css({ opacity: 0, transition: 'opacity .4s ease' });
        $img.on('load', function () { $img.css('opacity', 1); });
        $img.on('error', function () { $img.css('opacity', 1); });
    });

    /* ── 7. 커스텀 드롭다운 (서브페이지 정렬/브랜드) ── */
    $('.dropdown-toggle').on('click', function (e) {
        e.stopPropagation();
        var $dd = $(this).closest('.dropdown');
        $('.dropdown').not($dd).removeClass('open');
        $dd.toggleClass('open');
    });
    $('.dd-option').on('click', function () {
        var $dd = $(this).closest('.dropdown');
        $dd.find('.dd-option').removeClass('selected');
        $(this).addClass('selected');
        $dd.find('.dd-label').text($(this).text());
        $dd.removeClass('open');
    });
    /* ── 8. 카테고리 메가메뉴 ── */
    $('.cat-menu-btn').on('click', function (e) {
        e.stopPropagation();
        $(this).closest('.cat-menu').toggleClass('open');
    });
    $('.megamenu').on('click', function (e) { e.stopPropagation(); });

    $(document).on('click', function () {
        $('.dropdown').removeClass('open');
        $('.cat-menu').removeClass('open');
    });

    /* ── 9. 상품 카드 클릭 → 상세페이지 ── */
    var pdpParams = new URLSearchParams(window.location.search);
    var pdpImage = pdpParams.get('image');
    var pdpName = pdpParams.get('name');
    var catTreeGallery = [
        'image/main/product-cat-tree-1.png',
        'image/main/product-cat-tree-2.png',
        'image/main/product-cat-tree-3.png',
        'image/main/product-cat-tree-4.png',
        'image/main/product-cat-tree-5.png'
    ];
    if (pdpName === '포우 캣타워 캣트리') {
        $('.pdp-main img, .pdp-detail-img img')
            .attr('src', catTreeGallery[0])
            .attr('alt', pdpName);
        $('.pdp-thumb img').each(function (i) {
            $(this).attr('src', catTreeGallery[i] || catTreeGallery[0]);
        });
    } else if (pdpImage) {
        $('.pdp-main img, .pdp-thumb img, .pdp-detail-img img')
            .attr('src', pdpImage)
            .attr('alt', pdpName || '');
    }

    $('.pdp-thumb').on('click', function () {
        var $img = $(this).find('img');
        $('.pdp-thumb').removeClass('active');
        $(this).addClass('active');
        $('.pdp-main img').attr('src', $img.attr('src')).attr('alt', $img.attr('alt') || pdpName || '');
    });

    $('.detail-link').on('click', function (e) {
        if ($(e.target).closest('.goods-like, .pcard-like, a, button').length) return;
        var $card = $(this);
        var name = $card.find('.goods-name, .pcard-name').first().text().trim();
        var image = $card.find('img').first().attr('src');
        var detailUrl = $card.data('detail-url') || 'product.html';
        var query = detailUrl === 'product.html' && image ? '?name=' + encodeURIComponent(name) + '&image=' + encodeURIComponent(image) : '';
        window.location.href = detailUrl + query;
    });

    /* ── 10. 수량 스테퍼 + 총 금액 ── */
    function syncPdpTotal(qty) {
        $('.t-qty').text(qty);
        var $t = $('.pdp-total');
        var price = parseInt($t.attr('data-price'), 10);
        if (price) { $('.t-amount-num').text((price * qty).toLocaleString('ko-KR')); }
    }
    $('.qty-stepper').each(function () {
        var $num = $(this).find('.qty-num');
        $(this).find('.qty-minus').on('click', function () {
            var v = Math.max(1, parseInt($num.text(), 10) - 1);
            $num.text(v); syncPdpTotal(v);
        });
        $(this).find('.qty-plus').on('click', function () {
            var v = parseInt($num.text(), 10) + 1;
            $num.text(v); syncPdpTotal(v);
        });
    });

    /* ── 11. 상세 탭 (패널 전환) ── */
    $('.pdp-tabs a').on('click', function (e) {
        e.preventDefault();
        $('.pdp-tabs a').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).attr('data-tab');
        if (tab && $('#panel-' + tab).length) {
            $('.pdp-panel').removeClass('active');
            $('#panel-' + tab).addClass('active');
            var top = $('.pdp-tabs').offset().top - 80;
            if ($(window).scrollTop() > top) { $('html, body').animate({ scrollTop: top }, 250); }
        }
    });

    /* ── 12. 카드 hover '장바구니 담기' 버튼 ── */
    var cartBtn = '<button class="quick-cart" type="button" aria-label="장바구니 담기">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></svg>' +
        '장바구니 담기</button>';
    $('.goods-thumb, .product-thumb').append(cartBtn);
    $('.quick-cart').on('click', function (e) {
        e.stopPropagation();
        var $b = $(this);
        $b.css('background', '#ECE9E2');
        setTimeout(function () { $b.css('background', ''); }, 150);

        var $card = $b.closest('.goods, .product, li');
        var name = $card.find('.goods-name, .product-name, .pcard-name').first().text().trim();
        if (!name) return;
        if (pcCartHas(name)) { pcToast('이미 장바구니에 담긴 상품입니다'); return; }
        var priceText = $card.find('.goods-price .now, .product-price .now').first().text()
            || $card.find('.goods-price, .product-price').first().text();
        var price = parseInt((priceText || '').replace(/[^0-9]/g, ''), 10) || 0;
        var cart = pcCartGet();
        cart.push({
            name: name,
            opt: '단품',
            price: price,
            image: $card.find('.goods-thumb img, .product-thumb img, img').first().attr('src') || '',
            qty: 1
        });
        pcCartSave(cart);
        pcToast('장바구니에 담았습니다 🐾', { label: '장바구니 보기', onClick: function () { location.href = 'cart.html'; } });
    });

    /* ── 12b. 상세페이지 '장바구니 담기' → 저장소에 담기 ── */
    $('.pdp-actions .btn-line').on('click', function () {
        var name = ($('.pdp-title').first().text() || pdpName || '').trim();
        if (!name) return;
        if (pcCartHas(name)) { pcToast('이미 장바구니에 담긴 상품입니다'); return; }
        var cart = pcCartGet();
        cart.push({
            name: name,
            opt: '단품',
            price: parseInt($('.pdp-total').attr('data-price'), 10) || 0,
            image: $('.pdp-main img').first().attr('src') || '',
            qty: parseInt($('.pdp-qty .qty-num').first().text(), 10) || 1
        });
        pcCartSave(cart);
        pcToast('장바구니에 담았습니다 🐾', { label: '장바구니 보기', onClick: function () { location.href = 'cart.html'; } });
    });

    /* ── 13. 찜(하트) → 찜 목록에 담기 + 토스트 ── */
    $('.goods-like, .pdp-icon-btn').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $b = $(this);
        // 찜 목록 페이지의 하트는 해제(제거) 동작 → 페이지 자체 핸들러가 처리
        if ($b.closest('.wish-grid').length) { $b.toggleClass('on'); return; }
        var isPdp = $b.hasClass('pdp-icon-btn');
        var name, priceText, image, brand = '';
        if (isPdp) {
            name = ($('.pdp-title').first().text() || '').trim();
            priceText = $('.pdp-price-row .final, .pdp-total').first().text();
            image = $('.pdp-main img').first().attr('src') || '';
            brand = $('.pdp-brand').first().text().trim();
        } else {
            var $card = $b.closest('.goods, .product, li');
            name = $card.find('.goods-name, .product-name, .pcard-name').first().text().trim();
            priceText = $card.find('.goods-price .now, .product-price .now').first().text()
                || $card.find('.goods-price, .product-price').first().text();
            image = $card.find('.goods-thumb img, .product-thumb img, img').first().attr('src') || '';
            brand = $card.find('.goods-brand, .product-brand').first().text().trim();
        }
        if (!name) { $b.toggleClass('on'); return; }
        if (pcWishHas(name)) { $b.addClass('on'); pcToast('이미 찜한 상품입니다'); return; }
        var wish = pcWishGet();
        wish.push({ name: name, brand: brand, price: parseInt((priceText || '').replace(/[^0-9]/g, ''), 10) || 0, image: image });
        pcWishSave(wish);
        $b.addClass('on');
        pcToast('찜한 상품에 담았습니다 🐾', { label: '찜 목록 보기', onClick: function () { location.href = 'wishlist.html'; } });
    });

    // 페이지 로드 시: 이미 찜한 상품은 하트 채우기
    (function () {
        var wished = {};
        pcWishGet().forEach(function (i) { wished[i.name] = true; });
        $('.goods, .product').each(function () {
            var $c = $(this);
            if ($c.closest('.wish-grid').length) return; // 찜 페이지는 전부 on
            var nm = $c.find('.goods-name, .product-name, .pcard-name').first().text().trim();
            if (nm && wished[nm]) $c.find('.goods-like, .pcard-like').addClass('on');
        });
        var pn = ($('.pdp-title').first().text() || '').trim();
        if (pn && wished[pn]) $('.pdp-icon-btn').addClass('on');
    })();

    /* ── 14. 상품 Q&A 작성 (비밀글 지원) ── */
    $('.qna-write-btn').on('click', function () {
        var $form = $('.qna-form');
        $form.toggleClass('open');
        if ($form.hasClass('open')) { $form.find('.qna-input').focus(); }
    });
    $('#qnaForm').on('submit', function (e) {
        e.preventDefault();
        var $input = $(this).find('.qna-input');
        var text = ($input.val() || '').trim();
        if (!text) { $input.focus(); return; }
        var secret = $('#qnaSecret').is(':checked');
        var $li = $('<li class="pdp-qna-item"></li>');
        if (secret) {
            $li.addClass('secret').html(
                '<div class="qna-q-row"><p class="pdp-qna-q"><span class="q-badge">Q</span> <span class="qna-lock">🔒</span> 비밀글입니다.</p><span class="qna-status wait">답변대기</span></div>'
            );
        } else {
            $li.html('<div class="qna-q-row"><p class="pdp-qna-q"><span class="q-badge">Q</span> <span class="qna-qtext"></span></p><span class="qna-status wait">답변대기</span></div>');
            $li.find('.qna-qtext').text(text);
        }
        $('#qnaList').prepend($li);
        $input.val('');
        $('#qnaSecret').prop('checked', false);
        $li.removeClass('qna-hide');
    });

    /* ── 15. Q&A 더보기 ── */
    var qnaLimit = 4;
    (function () {
        var $items = $('#qnaList > .pdp-qna-item');
        if ($items.length > qnaLimit) {
            $items.slice(qnaLimit).addClass('qna-hide');
            $('.qna-more-wrap').show();
        } else {
            $('.qna-more-wrap').hide();
        }
    })();
    $('.qna-more-btn').on('click', function () {
        $('#qnaList > .pdp-qna-item').removeClass('qna-hide');
        $('.qna-more-wrap').hide();
    });

    /* ── 19. 헤더 검색 오버레이 ── */
    var searchData = [
        { n:'포우 캣타워 캣트리', b:'우다다', p:'139,000원', img:'image/main/best-thumb-cat-tree.png', u:'product.html' },
        { n:'퓨어 자동 급식기', b:'페트이', p:'89,000원', img:'image/main/best-thumb-auto-feeder.png', u:'best.html' },
        { n:'클린 후드형 화장실', b:'캣아이', p:'49,000원', img:'image/main/best-thumb-litter-box.png', u:'best.html' },
        { n:'플라잉 깃털 낚싯대', b:'낭낭', p:'7,900원', img:'image/main/best-thumb-feather-wand.png', u:'best.html' },
        { n:'도자기 높이 식기', b:'PurrCare', p:'15,900원', img:'image/main/best-thumb-ceramic-bowl.png', u:'best.html' },
        { n:'선인장 스크래쳐', b:'우다다', p:'22,900원', img:'image/main/best-thumb-cactus-scratcher.png', u:'best.html' },
        { n:'동결건조 닭가슴살 트릿 70g', b:'냥이밥상', p:'12,500원', img:'image/main/best-thumb-chicken-treats.png', u:'product-chicken-treats.html' },
        { n:'면역케어 영양제 60정', b:'펫비타', p:'23,000원', img:'image/main/best-thumb-immune-supplement.png', u:'best.html' }
    ];
    var popular = ['캣타워', '자동 급식기', '화장실', '낚싯대', '트릿', '영양제', '스크래쳐'];
    var chipsHtml = popular.map(function (k) { return '<button type="button">' + k + '</button>'; }).join('');
    $('body').append(
        '<div class="search-backdrop"></div>' +
        '<div class="search-overlay"><div class="search-inner">' +
        '<button class="search-close" type="button" aria-label="닫기">&times;</button>' +
        '<div class="search-box">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
        '<input type="text" class="search-input" placeholder="찾으시는 상품을 검색해보세요" aria-label="상품 검색"></div>' +
        '<div class="search-body">' +
        '<div class="search-popular"><p class="search-label">인기 검색어</p><div class="search-chips">' + chipsHtml + '</div></div>' +
        '<div class="search-results"></div>' +
        '</div></div></div>'
    );

    function renderSearch() {
        var q = ($('.search-input').val() || '').trim().toLowerCase();
        var $res = $('.search-results');
        if (!q) { $res.empty().hide(); $('.search-popular').show(); return; }
        $('.search-popular').hide(); $res.show();
        var matches = searchData.filter(function (it) {
            return (it.n + ' ' + it.b).toLowerCase().indexOf(q) !== -1;
        });
        if (!matches.length) { $res.html('<p class="search-empty">검색 결과가 없습니다.</p>'); return; }
        $res.html(matches.map(function (it) {
            return '<div class="search-result" data-url="' + it.u + '">' +
                '<div class="search-result-thumb"><img src="' + it.img + '" alt=""></div>' +
                '<div class="search-result-info"><p class="search-result-brand">' + it.b + '</p><p class="search-result-name">' + it.n + '</p></div>' +
                '<span class="search-result-price">' + it.p + '</span></div>';
        }).join(''));
    }
    function openSearch() { $('.search-overlay, .search-backdrop').addClass('open'); setTimeout(function () { $('.search-input').focus(); }, 80); }
    function closeSearch() { $('.search-overlay, .search-backdrop').removeClass('open'); $('.search-input').val(''); renderSearch(); }

    $('.util-btn[aria-label="검색"]').on('click', function (e) { e.stopPropagation(); openSearch(); });
    $('.util-btn[aria-label="마이페이지"]').on('click', function () { window.location.href = 'login.html'; });
    $('.util-btn[aria-label="장바구니"]').on('click', function () { window.location.href = 'cart.html'; });
    $('.search-close, .search-backdrop').on('click', closeSearch);
    $(document).on('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
    $('.search-input').on('input', renderSearch);
    $('.search-input').on('keydown', function (e) {
        if (e.key === 'Enter') {
            var first = $('.search-results .search-result').first();
            if (first.length) { window.location.href = first.attr('data-url'); }
        }
    });
    $('.search-chips').on('click', 'button', function () { $('.search-input').val($(this).text()); renderSearch(); $('.search-input').focus(); });
    $('.search-results').on('click', '.search-result', function () {
        var u = $(this).attr('data-url'); if (u) window.location.href = u;
    });
    renderSearch();

    /* ── 16. 리뷰 정렬 ── */
    $('.rv-sort button').on('click', function () {
        $('.rv-sort button').removeClass('active');
        $(this).addClass('active');
        var sort = $(this).attr('data-sort');
        var $list = $('.review-list');
        var items = $list.children('.review-item').get();
        items.sort(function (a, b) {
            var A = $(a), B = $(b);
            if (sort === 'recent') return B.data('date') - A.data('date');
            if (sort === 'oldest') return A.data('date') - B.data('date');
            if (sort === 'lowrating') return (A.data('rating') - B.data('rating')) || (B.data('date') - A.data('date'));
            return B.data('helpful') - A.data('helpful');
        });
        $.each(items, function (i, el) { $list.append(el); });
    });

    /* ── 17. 포토리뷰만 보기 ── */
    $('#photoOnly').on('change', function () {
        var on = $(this).is(':checked');
        $('.review-list .review-item').each(function () {
            var has = $(this).find('.rv-photos img').length > 0;
            $(this).css('display', (!on || has) ? '' : 'none');
        });
    });

    /* ── 18. 포토리뷰 모음 갤러리(요약 우측) ── */
    (function () {
        var $grid = $('.rv-gallery-grid');
        if (!$grid.length) return;
        var $imgs = $('.review-list .rv-photos img');
        if (!$imgs.length) { $('.rv-gallery').hide(); return; }
        $imgs.slice(0, 8).each(function () {
            $grid.append($('<img>').attr('src', $(this).attr('src')).attr('alt', '포토리뷰'));
        });
    })();
    $('.rv-gallery-grid').on('click', 'img', function () {
        $('#photoOnly').prop('checked', true).trigger('change');
        $('html, body').animate({ scrollTop: $('.review-toolbar').offset().top - 90 }, 250);
    });

    /* ── 20. 헤더 장바구니 개수 뱃지 ── */
    (function () {
        var $cartBtn = $('.util-btn[aria-label="장바구니"]');
        if (!$cartBtn.length) return;
        var onCartPage = $('.cart-list').length > 0;

        function readCount() {
            if (onCartPage) {
                var n = $('.cart-item').length;
                try { localStorage.setItem('purrcare_cart_count', n); } catch (e) {}
                return n;
            }
            var saved = 3;
            try {
                var v = localStorage.getItem('purrcare_cart_count');
                if (v !== null) saved = parseInt(v, 10) || 0;
            } catch (e) {}
            return saved;
        }

        var $badge = $('<span class="cart-badge"></span>');
        $cartBtn.append($badge);

        function render() {
            var n = readCount();
            $badge.text(n > 99 ? '99+' : n).toggleClass('is-zero', n <= 0);
        }
        render();

        if (onCartPage) {
            // 상품 삭제 시 뱃지 동기화
            $(document).on('click', '.ci-remove, .cart-del-sel', function () {
                setTimeout(render, 10);
            });
        }
    })();

    /* ── 21. 모바일 햄버거 메뉴 ── */
    (function () {
        var $gnb = $('.gnb');
        if (!$gnb.length || !$('.util').length) return;

        var $toggle = $('<button class="nav-toggle" type="button" aria-label="메뉴 열기"><span></span><span></span><span></span></button>');
        $('.util').prepend($toggle);

        var $backdrop = $('<div class="m-backdrop"></div>');
        var $drawer = $(
            '<div class="m-drawer" aria-hidden="true">' +
            '<div class="m-drawer-head"><span class="m-drawer-title">MENU</span>' +
            '<button class="m-drawer-close" type="button" aria-label="메뉴 닫기">&times;</button></div>' +
            '<nav class="m-nav"></nav></div>'
        );
        var $mnav = $drawer.find('.m-nav');

        $gnb.find('> ul > li').each(function () {
            var $li = $(this);
            var $a = $li.children('a').first();
            var $sub = $li.children('.submenu');
            var $item = $('<div class="m-item"></div>');
            if ($sub.length) {
                var $row = $('<button class="m-link m-has-sub" type="button"></button>');
                var $lab = $('<span class="m-lbl"></span>').text($a.text());
                if ($a.hasClass('nav-live')) $lab.append('<span class="m-dot"></span>');
                $row.append($lab).append('<span class="m-arrow">+</span>');
                var $subwrap = $('<div class="m-sub"></div>');
                $sub.find('a').each(function () {
                    var $sl = $('<a class="m-sublink"></a>')
                        .attr('href', $(this).attr('href'))
                        .text($(this).text());
                    if ($(this).hasClass('nav-live')) $sl.addClass('nav-live');
                    $subwrap.append($sl);
                });
                $item.append($row).append($subwrap);
            } else {
                var $ml = $('<a class="m-link"></a>').attr('href', $a.attr('href')).text($a.text());
                if ($a.hasClass('nav-live')) $ml.addClass('nav-live');
                $item.append($ml);
            }
            $mnav.append($item);
        });

        // 모바일 드로어 상단: 계정 바 + 빠른 아이콘 (쇼핑앱 스타일)
        var mLoggedIn = false, mUser = '';
        try { mUser = localStorage.getItem('purrcare_user') || ''; mLoggedIn = !!mUser; } catch (e) {}
        var mName = mUser ? mUser.split('@')[0] : '';
        var account = mLoggedIn
            ? '<div class="m-account">' +
                '<span class="m-ava"><img src="image/main/ico_user.png" alt=""></span>' +
                '<div class="m-acc-text"><p class="m-acc-name">' + mName + ' 님</p><p class="m-acc-sub">환영합니다</p></div>' +
                '<button type="button" class="m-logout">로그아웃</button>' +
              '</div>'
            : '<a class="m-account m-account-link" href="login.html">' +
                '<span class="m-ava"><img src="image/main/ico_user.png" alt=""></span>' +
                '<div class="m-acc-text"><p class="m-acc-name">로그인 / 회원가입</p><p class="m-acc-sub">로그인하고 혜택을 받아보세요</p></div>' +
                '<span class="m-acc-arrow">›</span>' +
              '</a>';
        var mypageHref = mLoggedIn ? 'mypage.html' : 'login.html';
        var quick = '<div class="m-quick">' +
            '<button type="button" class="m-quick-item m-action-search"><img src="image/main/ico_sc.png" alt=""><span>검색</span></button>' +
            '<a class="m-quick-item" href="cart.html"><span class="m-q-ico"><img src="image/main/ico_basket.png" alt=""><span class="m-cart-count"></span></span><span>장바구니</span></a>' +
            '<a class="m-quick-item" href="' + mypageHref + '"><img src="image/main/ico_user.png" alt=""><span>마이페이지</span></a>' +
          '</div>';
        var $top = $(account + quick);
        $mnav.prepend($top);
        (function(){ var cc=3; try{var v=localStorage.getItem('purrcare_cart_count'); if(v!==null) cc=parseInt(v,10)||0;}catch(e){}
            if(cc>0) $top.find('.m-cart-count').text(cc>99?'99+':cc); else $top.find('.m-cart-count').hide(); })();

        $('body').append($backdrop).append($drawer);

        function openD() { $drawer.addClass('open').attr('aria-hidden', 'false'); $backdrop.addClass('open'); $('body').addClass('m-lock'); }
        function closeD() { $drawer.removeClass('open').attr('aria-hidden', 'true'); $backdrop.removeClass('open'); $('body').removeClass('m-lock'); }

        $toggle.on('click', openD);
        $drawer.find('.m-drawer-close').on('click', closeD);
        $backdrop.on('click', closeD);
        $drawer.on('click', '.m-action-search', function () { closeD(); setTimeout(openSearch, 260); });
        $drawer.on('click', '.m-logout', function () { try { localStorage.removeItem('purrcare_user'); } catch (e) {} location.href = 'index.html'; });
        $drawer.on('click', '.m-has-sub', function () {
            $(this).toggleClass('open').next('.m-sub').slideToggle(180);
        });
        $(document).on('keydown', function (e) { if (e.key === 'Escape') closeD(); });
        // 데스크탑으로 넓어지면 자동 닫기
        $(window).on('resize', function () { if (window.innerWidth > 1024 && $drawer.hasClass('open')) closeD(); });
    })();

    /* ── 22. 작동하는 링크 표시 (빨간 점) ── */
    (function () {
        // 점 표시는 HTML의 class="nav-live"로 지정 (드로어 클론은 섹션 21에서 처리)

        // 표시 on/off 토글 버튼
        var KEY = 'purrcare_hide_navlive';
        var hidden = true; // 데모 표시 기본값: 꺼짐 (사용자가 토글하면 그 값 유지)
        try { var nv = localStorage.getItem(KEY); if (nv !== null) hidden = (nv === '1'); } catch (e) {}

        var $btn = $('<button class="nav-live-toggle" type="button"><span class="dot"></span><span class="lbl"></span></button>');
        $('body').append($btn);

        function apply() {
            $('body').toggleClass('hide-nav-live', hidden);
            $btn.find('.lbl').text(hidden ? '표시 켜기' : '표시 끄기');
        }
        apply();

        $btn.on('click', function () {
            hidden = !hidden;
            try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch (e) {}
            apply();
        });
    })();

});
