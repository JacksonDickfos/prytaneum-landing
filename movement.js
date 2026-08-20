(function () {
    function startOfToday() {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    function parseEndDate(value) {
        if (!value) return null;
        var parts = value.split('-');
        if (parts.length !== 3) return null;
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var day = parseInt(parts[2], 10);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        return new Date(year, month, day);
    }

    function getItemEndDate(item) {
        return parseEndDate(item.getAttribute('data-end-date'));
    }

    function getItemStartDate(item) {
        return parseEndDate(item.getAttribute('data-start-date')) || getItemEndDate(item);
    }

    function isItemUpcomingOrCurrent(item, today) {
        var endDate = getItemEndDate(item);
        if (!endDate) return false;
        return today <= endDate;
    }

    function sortMomentumItemsByDate() {
        var grid = document.querySelector('#momentum .movement-grid');
        if (!grid) return;

        var today = startOfToday();
        var items = Array.prototype.slice.call(grid.querySelectorAll('.movement-item'));
        if (!items.length) return;

        items.sort(function (a, b) {
            var aUpcoming = isItemUpcomingOrCurrent(a, today);
            var bUpcoming = isItemUpcomingOrCurrent(b, today);

            if (aUpcoming && !bUpcoming) return -1;
            if (!aUpcoming && bUpcoming) return 1;

            var aStart = getItemStartDate(a);
            var bStart = getItemStartDate(b);
            var aEnd = getItemEndDate(a);
            var bEnd = getItemEndDate(b);

            if (aUpcoming && bUpcoming) {
                // Soonest upcoming/current first
                if (aStart && bStart && aStart.getTime() !== bStart.getTime()) {
                    return aStart - bStart;
                }
                if (aEnd && bEnd) return aEnd - bEnd;
                return 0;
            }

            // Past items: most recently ended first
            if (aEnd && bEnd && aEnd.getTime() !== bEnd.getTime()) {
                return bEnd - aEnd;
            }
            if (aStart && bStart) return bStart - aStart;
            return 0;
        });

        items.forEach(function (item) {
            grid.appendChild(item);
        });
    }

    function syncEventAttendanceStatus() {
        var today = startOfToday();
        document.querySelectorAll('[data-movement-event][data-end-date]').forEach(function (item) {
            if ((item.getAttribute('data-type') || 'event') === 'podcast') return;
            var endDate = parseEndDate(item.getAttribute('data-end-date'));
            if (!endDate) return;
            if (today <= endDate) return;

            item.setAttribute('data-status', 'Attended');
            var banner = item.querySelector('.movement-item-banner');
            if (banner) {
                banner.textContent = 'Attended';
                banner.classList.remove('movement-item-banner--attending');
                banner.classList.add('movement-item-banner--attended');
            }
        });
    }

    function initMovementModal() {
        var modal = document.getElementById('movementEventModal');
        if (!modal) return;

        var typeEl = document.getElementById('movementModalType');
        var titleEl = document.getElementById('movementModalTitle');
        var bylineEl = document.getElementById('movementModalByline');
        var cityEl = document.getElementById('movementModalCity');
        var imageEl = document.getElementById('movementModalImage');
        var mediaEl = document.getElementById('movementModalMedia');
        var locationEl = document.getElementById('movementModalLocation');
        var venueEl = document.getElementById('movementModalVenue');
        var datesEl = document.getElementById('movementModalDates');
        var descriptionEl = document.getElementById('movementModalDescription');
        var statusEl = document.getElementById('movementModalStatus');
        var keynoteEl = document.getElementById('movementModalKeynote');
        var panelEl = document.getElementById('movementModalPanel');
        var linksEl = document.getElementById('movementModalLinks');
        var eventFields = document.getElementById('movementModalEventFields');

        function setModalMedia(trigger, title, city) {
            var sourceImg = trigger.querySelector('.movement-item-media img');
            var isLogo = trigger.querySelector('.movement-item-media--logo');
            mediaEl.classList.toggle('movement-item-media--logo', Boolean(isLogo));
            if (sourceImg && sourceImg.getAttribute('src')) {
                imageEl.src = sourceImg.getAttribute('src');
                imageEl.alt = sourceImg.getAttribute('alt') || title;
                imageEl.hidden = false;
                cityEl.hidden = true;
                cityEl.textContent = '';
                mediaEl.classList.remove('movement-item-media--placeholder');
            } else {
                imageEl.removeAttribute('src');
                imageEl.alt = '';
                imageEl.hidden = true;
                cityEl.hidden = !city;
                cityEl.textContent = city;
                mediaEl.classList.add('movement-item-media--placeholder');
            }
        }

        function setModalByline(text) {
            if (!bylineEl) return;
            if (text) {
                bylineEl.textContent = text;
                bylineEl.hidden = false;
            } else {
                bylineEl.textContent = '';
                bylineEl.hidden = true;
            }
        }

        function openMovementModal(trigger) {
            var kind = trigger.getAttribute('data-type') || 'event';
            var title = trigger.getAttribute('data-title') || '';
            var city = trigger.getAttribute('data-city') || '';
            var location = trigger.getAttribute('data-location') || '';
            var venue = trigger.getAttribute('data-venue') || '';
            var dates = trigger.getAttribute('data-dates') || '';
            var status = trigger.getAttribute('data-status') || '';
            var description = trigger.getAttribute('data-description') || '';
            var subtitle = trigger.getAttribute('data-subtitle') || '';
            var episodeTitle = trigger.getAttribute('data-episode-title') || '';
            var isKeynote = trigger.getAttribute('data-keynote') === 'true';
            var isPanel = trigger.getAttribute('data-panel') === 'true';
            var badgeLabel = trigger.getAttribute('data-badge-label') || 'Keynote';
            var leadBold = trigger.getAttribute('data-lead-bold') === 'true';

            typeEl.textContent = kind === 'podcast' ? 'Podcast' : 'Event';
            titleEl.textContent = title;
            setModalMedia(trigger, title, city);
            statusEl.textContent = status;
            statusEl.classList.toggle('is-attended', status === 'Attended');
            statusEl.classList.toggle('is-attending', status === 'Attending');
            statusEl.classList.toggle('is-published', status === 'Published');
            statusEl.hidden = !status;
            keynoteEl.textContent = badgeLabel;
            keynoteEl.hidden = kind === 'podcast' ? true : !isKeynote;
            if (panelEl) {
                panelEl.hidden = kind === 'podcast' ? true : !isPanel;
            }

            if (kind === 'podcast') {
                locationEl.textContent = '';
                venueEl.textContent = '';
                datesEl.textContent = dates;
                eventFields.hidden = !dates;
                setModalByline(episodeTitle || subtitle);
                descriptionEl.textContent = '';
                if (description) {
                    var paragraphs = description.split(/\n\s*\n/).map(function (part) {
                        return part.trim();
                    }).filter(Boolean);
                    if (!paragraphs.length && description.trim()) {
                        paragraphs = [description.trim()];
                    }
                    paragraphs.forEach(function (part) {
                        var p = document.createElement('p');
                        p.className = 'movement-modal-description';
                        p.textContent = part;
                        descriptionEl.appendChild(p);
                    });
                }
                linksEl.hidden = false;
                linksEl.innerHTML = '';
                try {
                    var links = JSON.parse(trigger.getAttribute('data-links') || '[]');
                    links.forEach(function (link) {
                        var a = document.createElement('a');
                        a.href = link.url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.className = 'movement-modal-link';
                        a.textContent = link.label;
                        linksEl.appendChild(a);
                    });
                } catch (error) {
                    linksEl.hidden = true;
                }
            } else {
                eventFields.hidden = false;
                setModalByline('');
                locationEl.textContent = location;
                venueEl.textContent = venue;
                datesEl.textContent = dates;
                descriptionEl.textContent = '';
                var paragraphs = description.split(/\n\s*\n/).map(function (part) {
                    return part.trim();
                }).filter(Boolean);
                if (!paragraphs.length && description.trim()) {
                    paragraphs = [description.trim()];
                }
                paragraphs.forEach(function (part, index) {
                    var p = document.createElement('p');
                    p.className = 'movement-modal-description';
                    if (leadBold && index === 0) {
                        var strong = document.createElement('strong');
                        strong.textContent = part;
                        p.appendChild(strong);
                    } else {
                        p.textContent = part;
                    }
                    descriptionEl.appendChild(p);
                });
                linksEl.hidden = true;
                linksEl.innerHTML = '';
            }

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeMovementModal() {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-movement-event]');
            if (!btn) return;
            openMovementModal(btn);
        });

        modal.querySelectorAll('[data-movement-close]').forEach(function (el) {
            el.addEventListener('click', closeMovementModal);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeMovementModal();
            }
        });
    }

    function initHeroMovementMarquee() {
        var track = document.getElementById('heroMovementTrack');
        var sourceGrid = document.querySelector('#momentum .movement-grid');
        if (!track || !sourceGrid) return;

        var items = sourceGrid.querySelectorAll('.movement-item');
        if (!items.length) return;

        track.innerHTML = '';
        var fragment = document.createDocumentFragment();

        function appendClones() {
            items.forEach(function (item) {
                var clone = item.cloneNode(true);
                clone.removeAttribute('id');
                clone.classList.remove('movement-item--paginated-out');
                clone.classList.add('movement-item--marquee');
                clone.hidden = false;
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('tabindex', '-1');
                fragment.appendChild(clone);
            });
        }

        appendClones();
        appendClones();
        track.appendChild(fragment);
    }

    function initMomentumPagination() {
        var grid = document.querySelector('#momentum .movement-grid');
        var nav = document.getElementById('momentumPagination');
        var pagesEl = document.getElementById('momentumPaginationPages');
        if (!grid || !nav || !pagesEl) return;

        var items = Array.prototype.slice.call(grid.querySelectorAll('.movement-item'));
        var perPage = 4;
        var totalPages = Math.ceil(items.length / perPage) || 1;
        var current = 1;
        var firstBtn = nav.querySelector('[data-momentum-page="first"]');
        var lastBtn = nav.querySelector('[data-momentum-page="last"]');

        if (totalPages <= 1) {
            nav.hidden = true;
            items.forEach(function (item) {
                item.classList.remove('movement-item--paginated-out');
            });
            return;
        }

        nav.hidden = false;

        function renderPageButtons() {
            pagesEl.innerHTML = '';
            for (var i = 1; i <= totalPages; i++) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'movement-pagination-page' + (i === current ? ' is-active' : '');
                btn.textContent = String(i);
                btn.setAttribute('aria-label', 'Page ' + i);
                if (i === current) {
                    btn.setAttribute('aria-current', 'page');
                }
                btn.addEventListener('click', (function (page) {
                    return function () {
                        goTo(page);
                    };
                })(i));
                pagesEl.appendChild(btn);
            }
        }

        function goTo(page) {
            current = Math.max(1, Math.min(totalPages, page));
            items.forEach(function (item, index) {
                var pageIndex = Math.floor(index / perPage) + 1;
                item.classList.toggle('movement-item--paginated-out', pageIndex !== current);
            });
            renderPageButtons();
            if (firstBtn) firstBtn.disabled = current === 1;
            if (lastBtn) lastBtn.disabled = current === totalPages;
        }

        if (firstBtn) {
            firstBtn.addEventListener('click', function () {
                goTo(1);
            });
        }
        if (lastBtn) {
            lastBtn.addEventListener('click', function () {
                goTo(totalPages);
            });
        }

        goTo(1);
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncEventAttendanceStatus();
        sortMomentumItemsByDate();
        initHeroMovementMarquee();
        initMomentumPagination();
        initMovementModal();
    });
})();
