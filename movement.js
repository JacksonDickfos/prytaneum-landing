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

    function syncEventAttendanceStatus() {
        var today = startOfToday();
        document.querySelectorAll('[data-movement-event][data-end-date]').forEach(function (item) {
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
        var cityEl = document.getElementById('movementModalCity');
        var imageEl = document.getElementById('movementModalImage');
        var mediaEl = document.getElementById('movementModalMedia');
        var locationEl = document.getElementById('movementModalLocation');
        var venueEl = document.getElementById('movementModalVenue');
        var datesEl = document.getElementById('movementModalDates');
        var descriptionEl = document.getElementById('movementModalDescription');
        var statusEl = document.getElementById('movementModalStatus');
        var keynoteEl = document.getElementById('movementModalKeynote');
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
            var isKeynote = trigger.getAttribute('data-keynote') === 'true';

            typeEl.textContent = kind === 'podcast' ? 'Podcast' : 'Event';
            titleEl.textContent = title;
            setModalMedia(trigger, title, city);
            statusEl.textContent = status;
            statusEl.classList.toggle('is-attended', status === 'Attended');
            statusEl.classList.toggle('is-attending', status === 'Attending');
            statusEl.classList.toggle('is-published', status === 'Published');
            statusEl.hidden = !status;
            keynoteEl.hidden = kind === 'podcast' ? true : !isKeynote;

            if (kind === 'podcast') {
                eventFields.hidden = true;
                locationEl.textContent = '';
                venueEl.textContent = '';
                datesEl.textContent = '';
                descriptionEl.textContent = '';
                if (subtitle) {
                    var subtitleEl = document.createElement('p');
                    subtitleEl.className = 'movement-modal-description';
                    subtitleEl.textContent = subtitle;
                    descriptionEl.appendChild(subtitleEl);
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
                paragraphs.forEach(function (part) {
                    var p = document.createElement('p');
                    p.className = 'movement-modal-description';
                    p.textContent = part;
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
                clone.classList.add('movement-item--marquee');
                fragment.appendChild(clone);
            });
        }

        appendClones();
        appendClones();
        track.appendChild(fragment);
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncEventAttendanceStatus();
        initHeroMovementMarquee();
        initMovementModal();
    });
})();
