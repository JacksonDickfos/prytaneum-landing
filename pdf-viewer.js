(function () {
    'use strict';

    var WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var frame = document.querySelector('.investor-doc-frame');
        if (!frame) return;

        var src = frame.getAttribute('data-pdf');
        if (!src) {
            var iframe = frame.querySelector('iframe');
            if (iframe) {
                src = (iframe.getAttribute('src') || '').split('#')[0];
            }
        }
        if (!src) return;

        function fallbackMessage(message) {
            frame.innerHTML =
                '<p class="investor-doc-loading">' +
                message +
                ' <a href="' + src + '" target="_blank" rel="noopener">Open PDF</a></p>';
        }

        if (typeof pdfjsLib === 'undefined') {
            fallbackMessage('Unable to load the document viewer.');
            return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

        var viewer = document.createElement('div');
        viewer.className = 'investor-doc-pages';
        frame.innerHTML = '';
        frame.appendChild(viewer);

        var loading = document.createElement('p');
        loading.className = 'investor-doc-loading';
        loading.textContent = 'Loading document…';
        viewer.appendChild(loading);

        var pdfDoc = null;
        var renderGeneration = 0;
        var observer = null;

        function containerWidth() {
            return Math.max(Math.floor(frame.clientWidth), 280);
        }

        function clearObserver() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }

        function renderPage(pageNumber, canvas, width) {
            return pdfDoc.getPage(pageNumber).then(function (page) {
                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                var base = page.getViewport({ scale: 1 });
                var scale = width / base.width;
                var viewport = page.getViewport({ scale: scale * dpr });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
                var ctx = canvas.getContext('2d', { alpha: false });
                return page.render({ canvasContext: ctx, viewport: viewport }).promise;
            });
        }

        function layoutPages(generation) {
            if (!pdfDoc || generation !== renderGeneration) return Promise.resolve();
            clearObserver();

            return pdfDoc.getPage(1).then(function (firstPage) {
                if (generation !== renderGeneration) return;
                var base = firstPage.getViewport({ scale: 1 });
                var width = containerWidth();
                viewer.innerHTML = '';

                observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        var slide = entry.target;
                        if (slide.getAttribute('data-rendered') === '1') return;
                        slide.setAttribute('data-rendered', '1');
                        var canvas = slide.querySelector('canvas');
                        var pageNumber = Number(slide.getAttribute('data-page'));
                        renderPage(pageNumber, canvas, width).catch(function () {
                            slide.setAttribute('data-rendered', '0');
                        });
                    });
                }, {
                    root: null,
                    rootMargin: '400px 0px',
                    threshold: 0.01
                });

                for (var i = 1; i <= pdfDoc.numPages; i++) {
                    var slide = document.createElement('div');
                    slide.className = 'investor-doc-page-slide';
                    slide.setAttribute('data-page', String(i));
                    slide.style.aspectRatio = base.width + ' / ' + base.height;
                    var canvas = document.createElement('canvas');
                    canvas.setAttribute('aria-label', 'Page ' + i);
                    slide.appendChild(canvas);
                    viewer.appendChild(slide);
                    observer.observe(slide);
                }
            });
        }

        fetch(src)
            .then(function (response) {
                if (!response.ok) throw new Error('PDF request failed');
                return response.arrayBuffer();
            })
            .then(function (data) {
                return pdfjsLib.getDocument({ data: data }).promise;
            })
            .then(function (pdf) {
                pdfDoc = pdf;
                renderGeneration += 1;
                return layoutPages(renderGeneration);
            })
            .catch(function () {
                fallbackMessage('Unable to load the document.');
            });

        var resizeTimer;
        window.addEventListener('resize', function () {
            if (!pdfDoc) return;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                renderGeneration += 1;
                layoutPages(renderGeneration);
            }, 250);
        });
    });
})();
