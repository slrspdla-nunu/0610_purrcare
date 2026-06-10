/**
 * PurrCare — main.js
 * 헤더 스크롤 효과 · 스크롤 등장 애니메이션 · 인터랙션
 */
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

});
