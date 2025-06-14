document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const passwordInput = document.getElementById('password');
    const encryptionSelect = document.getElementById('encryption');
    const printQrButton = document.getElementById('printQrButton');
    const downloadPngButton = document.getElementById('downloadPngButton');

    // Handle encryption type change
    encryptionSelect.addEventListener('change', () => {
        if (encryptionSelect.value === 'nopass') {
            passwordInput.disabled = true;
            passwordInput.value = '';
        } else {
            passwordInput.disabled = false;
        }
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'dark-mode') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    });

    // Existing form submission logic
    document.getElementById('wifiForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = e.target.querySelector('button');
        const originalButtonText = button.innerHTML;
        const qrcodeDisplayArea = document.getElementById('qrcode-display-area');
        const qrCodeImageContainer = document.getElementById('qrCodeImageContainer');
        const qrCodeImage = document.getElementById('qrCodeImage');
        const networkDetailsInline = document.getElementById('networkDetailsInline');
        const networkNameSpan = document.getElementById('networkName');
        const networkPasswordSpan = document.getElementById('networkPassword');
        const qrcodePlaceholder = qrcodeDisplayArea.querySelector('.qrcode-placeholder');
        const errorMessageArea = document.getElementById('errorMessageArea');
    
        // Reset visual state and show loading
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
        button.disabled = true;
    
        // Always hide dynamic content and error messages, show placeholder initially
        qrcodePlaceholder.classList.remove('hidden');
        qrcodePlaceholder.classList.add('flex-display');
        qrCodeImageContainer.classList.add('hidden');
        networkDetailsInline.classList.add('hidden');
        errorMessageArea.classList.add('hidden');
        errorMessageArea.innerHTML = '';
        printQrButton.classList.add('hidden');
        downloadPngButton.classList.add('hidden');
    
        // Clear previous data
        qrCodeImage.src = ''; 
        networkNameSpan.textContent = '-'; 
        networkPasswordSpan.textContent = '-'; 
        
        const formData = {
            ssid: document.getElementById('ssid').value,
            password: document.getElementById('password').value,
            encryption: document.getElementById('encryption').value
        };
    
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            
            if (response.ok && data.qrCode) {
                qrcodePlaceholder.classList.add('hidden');
                
                // Set QR Code image and make container visible
                qrCodeImage.src = data.qrCode;
                qrCodeImageContainer.classList.remove('hidden');
                qrCodeImageContainer.classList.add('flex-display');
    
                // Update network info and make section visible
                networkNameSpan.textContent = formData.ssid;
                networkPasswordSpan.textContent = formData.encryption === 'nopass' ? 'Sem Senha' : formData.password;
                networkDetailsInline.classList.remove('hidden');
                networkDetailsInline.classList.add('block-display');
                
                // Show print and download buttons
                printQrButton.classList.remove('hidden');
                printQrButton.classList.add('block-display');
                downloadPngButton.classList.remove('hidden');
                downloadPngButton.classList.add('block-display');

                // Apply animation to the new elements
                qrCodeImageContainer.style.opacity = '0';
                qrCodeImageContainer.style.transform = 'scale(0.9)';
                networkDetailsInline.style.opacity = '0';
                networkDetailsInline.style.transform = 'translateY(10px)';
    
                // Trigger reflow
                qrCodeImageContainer.offsetHeight;
                networkDetailsInline.offsetHeight;
    
                // Animate in
                qrCodeImageContainer.style.opacity = '1';
                qrCodeImageContainer.style.transform = 'scale(1)';
                networkDetailsInline.style.opacity = '1';
                networkDetailsInline.style.transform = 'translateY(0)';
    
            } else {
                // Handle API errors (e.g., status codes other than 2xx)
                const errorMessage = data.error || 'Erro desconhecido ao gerar QR Code.';
                errorMessageArea.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    ${errorMessage}
                `;
                errorMessageArea.classList.remove('hidden');
                errorMessageArea.classList.add('block-display');
    
                // Ensure placeholder is visible and dynamic content is hidden on error
                qrcodePlaceholder.classList.remove('hidden');
                qrcodePlaceholder.classList.add('flex-display');
                qrCodeImageContainer.classList.add('hidden');
                networkDetailsInline.classList.add('hidden');
                printQrButton.classList.add('hidden');
                downloadPngButton.classList.add('hidden');
            }
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            errorMessageArea.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                Erro de conexão ou ao processar a requisição. Tente novamente.
            `;
            errorMessageArea.classList.remove('hidden');
            errorMessageArea.classList.add('block-display');
    
            // Ensure placeholder is visible and dynamic content is hidden on error
            qrcodePlaceholder.classList.remove('hidden');
            qrcodePlaceholder.classList.add('flex-display');
            qrCodeImageContainer.classList.add('hidden');
            networkDetailsInline.classList.add('hidden');
            printQrButton.classList.add('hidden');
            downloadPngButton.classList.add('hidden');
        } finally {
            // Restore button state
            button.innerHTML = originalButtonText;
            button.disabled = false;
        }
    });

    // Handle download PNG button click
    downloadPngButton.addEventListener('click', async () => {
        const qrCodeImage = document.getElementById('qrCodeImage');
        const qrCardTitleText = document.querySelector('#qrCodeImageContainer .qr-card-title').textContent;
        const scanInstructionsText = document.querySelector('#qrCodeImageContainer .scan-instructions').textContent;
        const networkName = document.getElementById('networkName').textContent;
        const networkPassword = document.getElementById('networkPassword').textContent;

        // Create a temporary div with the desired content and elegant styles
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: 180mm; /* Aumentar largura para preencher mais a A4, consistente com impressão */
            height: auto;
            position: absolute;
            left: -9999px;
            top: -9999px;
            color: #2c3e50; /* Garante texto preto */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-sizing: border-box;
        `;
        tempDiv.innerHTML = `
            <h2 style="color: #2c3e50; font-size: 2.2rem; font-weight: 600; margin-top: 0.8rem; margin-bottom: 1.2rem;">${qrCardTitleText}</h2>
            <img src="${qrCodeImage.src}" alt="QR Code WiFi" style="max-width: 400px; width: 100%; height: auto; margin: 0 auto 2rem auto; border-radius: 0; box-shadow: none;">
            <p style="margin-top: 0; color: #2c3e50; font-size: 1.4rem; font-weight: 400; margin-bottom: 2rem; text-align: center; max-width: 90%;">${scanInstructionsText}</p>
            <div style="width: 90%; padding-top: 2rem; border-top: 2px solid #ecf0f1; padding-bottom: 0; margin-top: 0; margin-bottom: 0; text-align: left; box-sizing: border-box;">
                <div style="display: flex; flex-direction: column; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid #ecf0f1;">
                    <i class="fas fa-network-wired" style="font-size: 1.8rem; color: #3498db; margin-right: 0.6rem; width: auto; text-align: left;"></i>
                    <span style="font-size: 1.5rem; color: #2c3e50; font-weight: 600;"><strong>Nome da Rede (SSID):</strong> ${networkName}</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start; padding: 1rem 0; border-bottom: none;">
                    <i class="fas fa-key" style="font-size: 1.8rem; color: #3498db; margin-right: 0.6rem; width: auto; text-align: left;"></i>
                    <span style="font-size: 1.5rem; color: #2c3e50; font-weight: 600;"><strong>Senha:</strong> ${networkPassword}</span>
                </div>
            </div>
        `;

        document.body.appendChild(tempDiv);

        // Wait for styles to apply (briefly)
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for DOM repaint

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 3, // Increased scale for higher resolution PNG, consistent with print
                useCORS: true,
                backgroundColor: '#ffffff' // Definir explicitamente o fundo como branco
            });

            const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            const link = document.createElement('a');
            link.download = 'wifi_qr_code.png';
            link.href = image;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erro ao gerar PNG:', error);
            alert('Não foi possível gerar a imagem PNG. Verifique o console para mais detalhes.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    });

    // Handle print button click
    printQrButton.addEventListener('click', async () => {
        const qrCodeImage = document.getElementById('qrCodeImage');
        const qrCardTitleText = document.querySelector('#qrCodeImageContainer .qr-card-title').textContent;
        const scanInstructionsText = document.querySelector('#qrCodeImageContainer .scan-instructions').textContent;
        const networkName = document.getElementById('networkName').textContent;
        const networkPassword = document.getElementById('networkPassword').textContent;

        // Create a temporary div with the desired content and elegant styles, similar to PNG download
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            padding: 1.5rem; /* Reduced padding for print */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: 180mm; /* Aumentar largura para preencher mais a A4 */
            height: auto;
            position: absolute;
            left: -9999px;
            top: -9999px;
            color: #2c3e50; /* Ensures black text */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-sizing: border-box;
        `;
        tempDiv.innerHTML = `
            <h2 style="color: #2c3e50; font-size: 2.2rem; font-weight: 600; margin-top: 0.8rem; margin-bottom: 1.2rem;">${qrCardTitleText}</h2>
            <img src="${qrCodeImage.src}" alt="QR Code WiFi" style="max-width: 400px; width: 100%; height: auto; margin: 0 auto 2rem auto; border-radius: 0; box-shadow: none;">
            <p style="margin-top: 0; color: #2c3e50; font-size: 1.4rem; font-weight: 400; margin-bottom: 2rem; text-align: center; max-width: 90%;">${scanInstructionsText}</p>
            <div style="width: 90%; padding-top: 2rem; border-top: 2px solid #ecf0f1; padding-bottom: 0; margin-top: 0; margin-bottom: 0; text-align: left; box-sizing: border-box;">
                <div style="display: flex; flex-direction: column; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid #ecf0f1;">
                    <i class="fas fa-network-wired" style="font-size: 1.8rem; color: #3498db; margin-right: 0.6rem; width: auto; text-align: left;"></i>
                    <span style="font-size: 1.5rem; color: #2c3e50; font-weight: 600;"><strong>Nome da Rede (SSID):</strong> ${networkName}</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start; padding: 1rem 0; border-bottom: none;">
                    <i class="fas fa-key" style="font-size: 1.8rem; color: #3498db; margin-right: 0.6rem; width: auto; text-align: left;"></i>
                    <span style="font-size: 1.5rem; color: #2c3e50; font-weight: 600;"><strong>Senha:</strong> ${networkPassword}</span>
                </div>
            </div>
        `;

        document.body.appendChild(tempDiv);

        // Wait for styles to apply (briefly)
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for DOM repaint

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 3, // Increased scale for higher resolution print
                useCORS: true,
                backgroundColor: '#ffffff' // Definir explicitamente o fundo como branco
            });

            const imageUrl = canvas.toDataURL('image/png');

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Imprimir QR Code WiFi</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                    <style>
                        @page {
                            size: A4;
                            margin: 0; /* Remover todas as margens da página */
                        }
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: auto; /* Deixar a altura se ajustar ao conteúdo */
                            margin: 0; /* Remover margem do body */
                            padding: 0; /* Remover padding do body */
                            background-color: #ffffff; /* Fundo branco para preencher a página */
                            -webkit-print-color-adjust: exact; /* Força a impressão das cores de fundo */
                            color-adjust: exact;
                        }
                        img {
                            max-width: 200mm; /* A4 width is 210mm, leaving 5mm on each side */
                            max-height: 287mm; /* A4 height is 297mm, leaving 5mm on top/bottom */
                            height: auto;
                            display: block;
                            margin: 0 auto;
                            object-fit: contain; /* Garante que a imagem se ajuste mantendo a proporção */
                        }
                    </style>
                </head>
                <body>
                    <img src="${imageUrl}" alt="QR Code para Impressão">
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } catch (error) {
            console.error('Erro ao preparar para imprimir:', error);
            alert('Não foi possível preparar o QR Code para impressão. Verifique o console para mais detalhes.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    });
}); 