(function () {
    var FORMSPREE_URL = 'https://formspree.io/f/mblzgbyy';

    function bindFundOneAccessModal() {
        var modal = document.getElementById('fundOneAccessModal');
        var triggers = document.querySelectorAll('#fundOneAccessTrigger, #fundOneAccessHint');
        var closeBtn = document.getElementById('fundOneAccessModalClose');
        var form = document.getElementById('fundOneAccessForm');

        if (!modal || !form || triggers.length === 0) {
            return;
        }

        function openModal() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', openModal);
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var formData = new FormData(form);
            var submitButton = form.querySelector('button[type="submit"]');

            if (submitButton) {
                submitButton.disabled = true;
            }

            fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company') || '',
                    message: 'Fund I investor material access request',
                    nda_accepted: formData.get('nda_accepted') ? 'Yes' : 'No'
                })
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Form submission failed');
                    }

                    window.location.href = '/valkyrie-revival-fund-I/';
                })
                .catch(function () {
                    alert('There was an error submitting the form. Please try again.');
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                });
        });
    }

    document.addEventListener('DOMContentLoaded', bindFundOneAccessModal);
})();
