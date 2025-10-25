
// スライドショーのJavaScript (★★修正版★★)
const slideshowContainer = document.querySelector('.slideshow-container');
const slideWrapper = document.querySelector('.slide-wrapper');
const slides = document.querySelectorAll('.slide');
const logoContainer = document.querySelector('.logo-container');
const originalSlidesCount = 4;
let currentIndex = 0;
const slideInterval = 3000;
let autoSlideTimer;

const paginationDots = document.querySelectorAll('.pagination-dot');

// スライドの幅とマージンを一度だけ計算して保持する変数
let singleSlideTotalWidth = 0;
let containerWidth = 0;

// 初期ロード時とウィンドウリサイズ時に計算する関数
function initializeSlideDimensions() {
	if (slides.length > 0) {
		const slideWidth = slides[0].offsetWidth;
		const slideMarginRight = parseFloat(window.getComputedStyle(slides[0]).marginRight);
		const slideMarginLeft = parseFloat(window.getComputedStyle(slides[0]).marginLeft);
		singleSlideTotalWidth = slideWidth + slideMarginLeft + slideMarginRight;
	}
	containerWidth = slideshowContainer.offsetWidth;
}

// 最初のオリジナルスライドと最後のオリジナルスライドのクローンを追加
// これで無限ループをスムーズにする
function setupInfiniteScroll() {
	if (slides.length > 0) {
		const firstSlide = slides[0];
		const lastSlide = slides[originalSlidesCount - 1];

		// 最初のスライドの前に最後のスライドのクローンを追加
		slideWrapper.insertBefore(lastSlide.cloneNode(true), firstSlide);
		// 最後のスライドの後に最初のスライドのクローンを追加
		slideWrapper.appendChild(firstSlide.cloneNode(true));

		// クローンが追加されたので、スライドのインデックスを1つずらす
		currentIndex = 1; // 実際の最初のスライドはインデックス1になる
		goToSlide(currentIndex, false); // 初期位置に移動（アニメーションなし）
	}
}


function calculateSlideOffset(index) {
	// 保持した値を使って計算
	return (containerWidth / 2) - (singleSlideTotalWidth / 2) - (index * singleSlideTotalWidth);
}


function goToSlide(index, smoothTransition = true) {
	if (smoothTransition) {
		slideWrapper.style.transition = 'transform 0.5s ease-in-out';
	} else {
		slideWrapper.style.transition = 'none';
	}

	currentIndex = index;
	slideWrapper.style.transform = `translateX(${calculateSlideOffset(currentIndex)}px)`;

	// クローンを使った無限ループのロジック
	if (currentIndex === originalSlidesCount + 1) { // 最後のクローンに到達した場合
		slideWrapper.addEventListener('transitionend', function handler() {
			slideWrapper.removeEventListener('transitionend', handler);

			// ★★ここから追加★★
			// 一瞬だけスライドラッパーを透明にする（描画のチラつきを隠す）
			slideshowContainer.style.opacity = 0;
			slideshowContainer.style.transition = 'none'; // 透明にする遷移をつけない

			currentIndex = 1; // 最初のオリジナルスライドのインデックス
			goToSlide(currentIndex, false); // アニメーションなしでジャンプ
			updatePaginationDots();

			// 透明にした後、すぐに元に戻す（見た目は瞬間的に切り替わったように見える）
			requestAnimationFrame(() => { // ブラウザの次の描画フレームで実行
				slideshowContainer.style.transition = 'opacity 0.2s ease-out'; // フェードイン効果を付けても良い
				slideshowContainer.style.opacity = 1;
			});
			// ★★ここまで追加★★
		});
	} else if (currentIndex === 0) { // 最初のクローンに到達した場合
		slideWrapper.addEventListener('transitionend', function handler() {
			slideWrapper.removeEventListener('transitionend', handler);

			// ★★ここから追加★★
			slideshowContainer.style.opacity = 0;
			slideshowContainer.style.transition = 'none';

			currentIndex = originalSlidesCount; // 最後のオリジナルスライドのインデックス
			goToSlide(currentIndex, false); // アニメーションなしでジャンプ
			updatePaginationDots();

			requestAnimationFrame(() => {
				slideshowContainer.style.transition = 'opacity 0.2s ease-out';
				slideshowContainer.style.opacity = 1;
			});
			// ★★ここまで追加★★
		});
	} else {
		updatePaginationDots();
	}
}

function nextSlide() {
	goToSlide(currentIndex + 1);
}

function updatePaginationDots() {
	// クローンを考慮し、実際のオリジナルスライドのインデックスに合わせてドットを更新
	// currentIndex が 0 なら最後のスライド、originalSlidesCount + 1 なら最初のスライドとみなす
	let activeDotIndex = currentIndex - 1;
	if (activeDotIndex === -1) { // 最初のクローン（インデックス0）の場合
		activeDotIndex = originalSlidesCount - 1; // 最後のドットをアクティブにする
	} else if (activeDotIndex === originalSlidesCount) { // 最後のクローン（originalSlidesCount + 1）の場合
		activeDotIndex = 0; // 最初のドットをアクティブにする
	}

	paginationDots.forEach((dot, idx) => {
		if (idx === activeDotIndex) {
			dot.classList.add('active');
		} else {
			dot.classList.remove('active');
		}
	});
}

paginationDots.forEach(dot => {
	dot.addEventListener('click', function() {
		clearInterval(autoSlideTimer);

		// クリックされたドットのインデックスに、クローン考慮のオフセットを加える
		const slideIndex = parseInt(this.dataset.slideIndex) + 1;
		goToSlide(slideIndex, true);

		autoSlideTimer = setInterval(nextSlide, slideInterval);
	});
});

// 初期表示時の準備
initializeSlideDimensions(); // 寸法を初期化
setupInfiniteScroll(); // 無限スクロールのクローンを設定

// ウィンドウのリサイズ時に寸法を再計算
window.addEventListener('resize', initializeSlideDimensions);

// 自動スライド開始
autoSlideTimer = setInterval(nextSlide, slideInterval);


// ロゴのスクロールアニメーションJavaScript (★★修正版★★)
document.addEventListener('DOMContentLoaded', function() {
	const body = document.body;

	const categoryDetails = document.querySelector('.category-details');

	const logoHideScroll = 550;
	const categoryShowScroll = 200;

	// requestAnimationFrame を使ってスクロール処理を最適化
	let ticking = false; // フラグで重複実行を防ぐ

	function updateScrollAnimations() {
		const scrollY = window.scrollY;

		// ロゴの表示・非表示
if (scrollY <= logoHideScroll) {
			const opacity = 1 - (scrollY / logoHideScroll);
			const scale = 1 + (scrollY / 65);

			logoContainer.style.opacity = opacity;
			logoContainer.style.transform = `scale(${scale})`;
			logoContainer.style.pointerEvents = 'auto';
			// logoContainer.style.display = 'flex'; // ★これ削除！代わりにopacityとpointerEventsで制御
		} else {
			logoContainer.style.opacity = 0;
			// logoContainer.style.display = 'none'; // ★これ削除！
			logoContainer.style.pointerEvents = 'none';
		}


		// カテゴリ詳細の表示
		if (scrollY >= categoryShowScroll) {
			const categoryOpacity = Math.min(1, (scrollY - categoryShowScroll) / (logoHideScroll - categoryShowScroll));
			categoryDetails.style.opacity = categoryOpacity;
		} else {
			categoryDetails.style.opacity = 0;
		}

		// 背景色の変更
		const changeBgThreshold = 50;
		body.style.backgroundColor = scrollY > changeBgThreshold ? '#f0f0f0' : '#fff';

		ticking = false; // 処理が終わったらフラグをfalseに戻す
	}

	window.addEventListener('scroll', function() {
		if (!ticking) { // 処理が実行中でなければ
			window.requestAnimationFrame(updateScrollAnimations); // 次の描画フレームで実行を予約
			ticking = true; // フラグをtrueにする
		}
	});

	// 初期ロード時のアニメーション実行
	updateScrollAnimations();
});

// ハンバーガーメニューのJavaScript (★★修正版★★)
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navMenu = document.querySelector('.nav-menu');


hamburgerMenu.addEventListener('click', function() {
	hamburgerMenu.classList.toggle('open');
	navMenu.classList.toggle('open');

	// ハンバーガーメニューが開いた時にロゴコンテナを隠す
	if (navMenu.classList.contains('open')) {
		// logoContainer.style.display = 'none'; // これも削除
		logoContainer.style.opacity = 0; // 透明にして
		logoContainer.style.pointerEvents = 'none'; // クリックも受け付けない
	} else {
		// 閉じた時に、スクロールアニメーションの状態に合わせて再表示させる
		// initializeScrollAnimations(); // これを直接呼ぶだけでOK
		// ※ただし、上で updateScrollAnimations に関数名変更してるから、
		//   ここも updateScrollAnimations() に変更する必要がある
		//   以下で修正する
		const scrollY = window.scrollY;
		const logoHideScroll = 550;

		if (scrollY <= logoHideScroll) {
			logoContainer.style.opacity = 1 - (scrollY / logoHideScroll);
			logoContainer.style.pointerEvents = 'auto';
		} else {
			logoContainer.style.opacity = 0;
			logoContainer.style.pointerEvents = 'none';
		}
	}
});

const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
	link.addEventListener('click', function() {
		hamburgerMenu.classList.remove('open');
		navMenu.classList.remove('open');
		// ナビリンククリック時もロゴアニメーションの状態を更新
		// initializeScrollAnimations(); // 上記と同じく修正
		const scrollY = window.scrollY;
		const logoHideScroll = 550;

		if (scrollY <= logoHideScroll) {
			logoContainer.style.opacity = 1 - (scrollY / logoHideScroll);
			logoContainer.style.pointerEvents = 'auto';
		} else {
			logoContainer.style.opacity = 0;
			logoContainer.style.pointerEvents = 'none';
		}
	});
});
