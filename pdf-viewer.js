(function () {
    'use strict';

    var WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    var MAX_CANVAS_PIXELS = 16 * 1024 * 1024;

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
        var scrollHandler = null;

        function containerWidth() {
            return Math.max(Math.floor(frame.clientWidth), 280);
        }

        function clearObserver() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (scrollHandler) {
                window.removeEventListener('scroll', scrollHandler);
                scrollHandler = null;
            }
        }

        function pageSize(page) {
            var viewport = page.getViewport({ scale: 1 });
            return { width: viewport.width, height: viewport.height };
        }

        function isSiteLink(url) {
            try {
                var host = new URL(url, window.location.href).hostname.replace(/^www\./, '');
                return host === window.location.hostname.replace(/^www\./, '') ||
                    host === 'prytaneumpartners.com';
            } catch (e) {
                return false;
            }
        }

        function toLocalSiteUrl(url) {
            try {
                var parsed = new URL(url, window.location.href);
                if (parsed.hostname.replace(/^www\./, '') === 'prytaneumpartners.com') {
                    return parsed.pathname + parsed.search + parsed.hash;
                }
                return url;
            } catch (e) {
                return url;
            }
        }

        function goToDestination(dest) {
            var destPromise = typeof dest === 'string'
                ? pdfDoc.getDestination(dest)
                : Promise.resolve(dest);
            destPromise.then(function (explicit) {
                if (!explicit || !explicit[0]) return;
                return pdfDoc.getPageIndex(explicit[0]);
            }).then(function (index) {
                if (index == null) return;
                var target = viewer.querySelector('[data-page="' + (index + 1) + '"]');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }).catch(function () {});
        }

        function addLinkOverlays(page, slide) {
            return page.getAnnotations().then(function (annotations) {
                var existing = slide.querySelector('.investor-doc-link-layer');
                if (existing) existing.remove();

                var links = annotations.filter(function (annot) {
                    return annot.subtype === 'Link' && (annot.url || annot.unsafeUrl || annot.dest);
                });
                if (!links.length) return;

                var viewport = page.getViewport({ scale: 1 });
                var layer = document.createElement('div');
                layer.className = 'investor-doc-link-layer';

                links.forEach(function (annot) {
                    var raw = viewport.convertToViewportRectangle(annot.rect);
                    var x1 = Math.min(raw[0], raw[2]);
                    var y1 = Math.min(raw[1], raw[3]);
                    var x2 = Math.max(raw[0], raw[2]);
                    var y2 = Math.max(raw[1], raw[3]);

                    var url = annot.url || annot.unsafeUrl;
                    var link = document.createElement('a');
                    link.className = 'investor-doc-link';
                    link.setAttribute('aria-label', url ? 'Open linked page' : 'Go to page');
                    link.style.left = (x1 / viewport.width * 100) + '%';
                    link.style.top = (y1 / viewport.height * 100) + '%';
                    link.style.width = ((x2 - x1) / viewport.width * 100) + '%';
                    link.style.height = ((y2 - y1) / viewport.height * 100) + '%';
                    if (url) {
                        link.href = toLocalSiteUrl(url);
                        if (isSiteLink(url)) {
                            link.target = '_self';
                        } else {
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                        }
                    } else {
                        link.href = '#';
                        link.addEventListener('click', function (event) {
                            event.preventDefault();
                            goToDestination(annot.dest);
                        });
                    }

                    layer.appendChild(link);
                });

                slide.appendChild(layer);
            });
        }

        function renderPage(pageNumber, canvas, slide, width) {
            return pdfDoc.getPage(pageNumber).then(function (page) {
                var base = pageSize(page);
                slide.style.aspectRatio = base.width + ' / ' + base.height;

                var dpr = Math.min(window.devicePixelRatio || 1, 2);
                var scale = width / base.width;
                var pixelWidth = Math.floor(base.width * scale * dpr);
                var pixelHeight = Math.floor(base.height * scale * dpr);
                if (pixelWidth * pixelHeight > MAX_CANVAS_PIXELS) {
                    var factor = Math.sqrt(MAX_CANVAS_PIXELS / (pixelWidth * pixelHeight));
                    pixelWidth = Math.max(1, Math.floor(pixelWidth * factor));
                    pixelHeight = Math.max(1, Math.floor(pixelHeight * factor));
                    dpr = pixelWidth / (base.width * scale);
                }

                var viewport = page.getViewport({ scale: scale * dpr });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';

                var ctx = canvas.getContext('2d', { alpha: false });
                return Promise.all([
                    page.render({ canvasContext: ctx, viewport: viewport }).promise,
                    addLinkOverlays(page, slide)
                ]);
            });
        }

        function layoutPages(generation) {
            if (!pdfDoc || generation !== renderGeneration) return Promise.resolve();
            clearObserver();

            var jobs = [];
            for (var i = 1; i <= pdfDoc.numPages; i++) {
                jobs.push(pdfDoc.getPage(i).then(function (page) {
                    var size = pageSize(page);
                    return {
                        pageNumber: page.pageNumber,
                        width: size.width,
                        height: size.height
                    };
                }));
            }

            return Promise.all(jobs).then(function (sizes) {
                if (generation !== renderGeneration) return;
                var width = containerWidth();
                viewer.innerHTML = '';

                function startRender(slide) {
                    if (slide.getAttribute('data-rendered') === '1') return;
                    slide.setAttribute('data-rendered', '1');
                    var canvas = slide.querySelector('canvas');
                    var pageNumber = Number(slide.getAttribute('data-page'));
                    renderPage(pageNumber, canvas, slide, width).catch(function () {
                        slide.setAttribute('data-rendered', '0');
                    });
                }

                function revealVisible() {
                    var extra = 1200;
                    viewer.querySelectorAll('.investor-doc-page-slide').forEach(function (slide) {
                        var rect = slide.getBoundingClientRect();
                        if (rect.bottom >= -extra && rect.top <= window.innerHeight + extra) {
                            startRender(slide);
                        }
                    });
                }

                observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) startRender(entry.target);
                    });
                }, {
                    root: null,
                    rootMargin: '1200px 0px',
                    threshold: 0
                });

                sizes.forEach(function (size) {
                    var slide = document.createElement('div');
                    slide.className = 'investor-doc-page-slide';
                    slide.setAttribute('data-page', String(size.pageNumber));
                    slide.style.aspectRatio = size.width + ' / ' + size.height;
                    var canvas = document.createElement('canvas');
                    canvas.setAttribute('aria-label', 'Page ' + size.pageNumber);
                    slide.appendChild(canvas);
                    viewer.appendChild(slide);
                    observer.observe(slide);
                });

                revealVisible();
                scrollHandler = revealVisible;
                window.addEventListener('scroll', scrollHandler, { passive: true });
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
