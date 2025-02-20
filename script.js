// Email domain handler
        const emailInput = document.getElementById('email');
        const emailUserInput = document.getElementById('emailUser');
        const emailDomainSelect = document.getElementById('emailDomain');
        const emailGroup = document.querySelector('.input-group');

        emailDomainSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                // Tam email girişi moduna geç
                emailInput.style.display = 'block';
                emailInput.required = true;
                emailUserInput.style.display = 'none';
                emailUserInput.required = false;
                emailDomainSelect.style.display = 'none';
            } else {
                // Domain seçimli moda geri dön
                emailInput.style.display = 'none';
                emailInput.required = false;
                emailUserInput.style.display = 'block';
                emailUserInput.required = true;
                emailDomainSelect.style.display = 'block';
            }
        });

        // Form gönderim kontrolü
        function canSubmitForm() {
            const lastSubmission = localStorage.getItem('lastFormSubmission');
            if (!lastSubmission) return true;

            const timeDiff = Date.now() - parseInt(lastSubmission);
            const waitTime = 10 * 60 * 1000; // 10 dakika
            
            if (timeDiff < waitTime) {
                const remainingSeconds = Math.ceil((waitTime - timeDiff) / 1000);
                return remainingSeconds;
            }
            
            return true;
        }

        function updateTimerMessage(seconds) {
            const timerMessage = document.getElementById('timerMessage');
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            timerMessage.innerHTML = `Yeni bir şikayet gönderebilmek için kalan süre: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            timerMessage.style.display = 'block';
            
            if (seconds > 0) {
                setTimeout(() => updateTimerMessage(seconds - 1), 1000);
            } else {
                timerMessage.style.display = 'none';
            }
        }

        // Sayfa yüklendiğinde timer kontrolü
        document.addEventListener('DOMContentLoaded', function() {
            const canSubmit = canSubmitForm();
            if (typeof canSubmit === 'number') {
                updateTimerMessage(canSubmit);
            }
        });

        document.getElementById('sikayetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form gönderim kontrolü
            const canSubmit = canSubmitForm();
            if (typeof canSubmit === 'number') {
                updateTimerMessage(canSubmit);
                return;
            }
            
            // Email değerini belirle
            let emailValue;
            if (emailDomainSelect.value === 'custom') {
                emailValue = emailInput.value;
            } else {
                emailValue = emailUserInput.value ? emailUserInput.value + emailDomainSelect.value : '';
            }
            
            const phoneValue = document.getElementById('telefon').value;
            
            // En az biri dolu mu kontrolü
            if (!emailValue && !phoneValue) {
                document.getElementById('errorMessage').style.display = 'block';
                return;
            }
            
            document.getElementById('errorMessage').style.display = 'none';
            
            const formData = {
                isim: document.getElementById('isim').value,
                email: emailValue || null,
                telefon: phoneValue ? document.getElementById('ulkeKodu').value + phoneValue : null,
                sikayet: document.getElementById('sikayet').value,
                tarih: new Date().toISOString()
            };

            try {
                const response = await fetch('https://form.gvpmarkt.workers.dev/sikayet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Form başarıyla gönderildiğinde timestamp'i kaydet
                    localStorage.setItem('lastFormSubmission', Date.now().toString());
                    document.getElementById('successMessage').style.display = 'block';
                    document.getElementById('sikayetForm').reset();
                } else {
                    throw new Error('Bir hata oluştu');
                }
            } catch (error) {
                alert('Şikayet gönderilirken bir hata oluştu: ' + error.message);
            }
        });

        // Form alanları değiştiğinde hata mesajını gizle
        ['emailUser', 'email', 'telefon'].forEach(id => {
            document.getElementById(id).addEventListener('input', function() {
                document.getElementById('errorMessage').style.display = 'none';
            });
        });
