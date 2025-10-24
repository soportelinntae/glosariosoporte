// Espera a que todo el contenido del HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VARIABLES GLOBALES ---
    let baseDeDatos = [];

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const faqContainer = document.getElementById('faqContainer');
    const reportForm = document.getElementById('reportForm');

    
    // --- 2. FUNCIÓN PRINCIPAL: CARGAR DATOS ---
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar data.json. Error: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            baseDeDatos = data;
            console.log('Base de datos cargada:', baseDeDatos);
            
            if (resultsContainer) {
                mostrarPopulares();
            }
            if (faqContainer) {
                mostrarFAQs();
            }
        })
        .catch(error => {
            console.error('Error al cargar la base de datos:', error);
            const errorMsg = '<p class="placeholder" style="color: red;">Error: No se pudo cargar la base de datos.</p>';
            if (resultsContainer) resultsContainer.innerHTML = errorMsg;
            if (faqContainer) faqContainer.innerHTML = errorMsg;
        });

        
    // --- 3. LÓGICA DE LA PÁGINA DE BÚSQUEDA (index.html) ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                mostrarPopulares();
                return;
            }

            // --- ¡INICIO DE LA CORRECCIÓN Y MEJORA! ---
            const resultados = baseDeDatos.filter(item => {
                const q = query; // La consulta ya está en minúsculas

                // 1. Buscar en Código (Corregido)
                // Convertimos el 'code' (que es número) a String() antes de buscar
                const enCodigo = item.code ? String(item.code).toLowerCase().includes(q) : false;

                // 2. Buscar en Título
                const enTitulo = item.title.toLowerCase().includes(q);

                // 3. Buscar en Descripción (Mejora)
                const enDesc = item.description ? item.description.toLowerCase().includes(q) : false;

                // 4. Buscar en Tags (Mejora)
                const enTags = item.tags.some(tag => tag.toLowerCase().includes(q));

                // 5. Buscar en Causas (Mejora)
                const enCauses = item.causes.some(causa => causa.toLowerCase().includes(q));
                
                // 6. Buscar en Soluciones (Mejora)
                const enSolutions = item.solutions.some(sol => sol.toLowerCase().includes(q));

                // Si la consulta está en CUALQUIERA de esos campos, se muestra
                return enCodigo || enTitulo || enDesc || enTags || enCauses || enSolutions;
            });
            // --- ¡FIN DE LA CORRECCIÓN Y MEJORA! ---
            
            mostrarResultados(resultados, false);
        });
    }

    // --- 4. FUNCIÓN PARA MOSTRAR POPULARES ---
    function mostrarPopulares() {
        if (!resultsContainer) return; 
        
        resultsContainer.innerHTML = '<h3 class="results-title">Populares y Recientes</h3>';
        const populares = baseDeDatos.slice(0, 5);
        mostrarResultados(populares, true);
    }

    // --- 5. FUNCIÓN PARA MOSTRAR RESULTADOS ---
    function mostrarResultados(resultados, append = false) {
        
        if (!append) {
            resultsContainer.innerHTML = '';
        }
        
        if (resultados.length === 0 && !append) {
            resultsContainer.innerHTML = '<p class="placeholder">No se encontraron resultados para esta búsqueda.</p>';
            return;
        }

        resultados.forEach(item => {
            
            let imagenHtml = '';
            if (item.imageUrl) {
                imagenHtml = `
                    <div class="result-image-container">
                        <img src="${item.imageUrl}" alt="Captura del error: ${item.title}">
                    </div>
                `;
            }

            let htmlItem = `
                <article class="result-item">
                    <div class="result-header">
                        <h3>${item.title}</h3>
                        ${item.code ? `<span class="result-code">${item.code}</span>` : ''}
                    </div>
                    <div class="result-body">
                        ${imagenHtml}
            `;
            
            if (item.description) {
                htmlItem += `<p>${item.description}</p>`;
            }

            if (item.causes && item.causes.length > 0) {
                htmlItem += '<h4>Posibles Causas</h4><ul>';
                item.causes.forEach(causa => {
                    htmlItem += `<li>${causa}</li>`;
                });
                htmlItem += '</ul>';
            }
            
            if (item.solutions && item.solutions.length > 0) {
                htmlItem += '<h4>Soluciones Sugeridas</h4><ul>';
                item.solutions.forEach(solucion => {
                    htmlItem += `<li>${solucion}</li>`;
                });
                htmlItem += '</ul>';
            }
            
            if (item.tags && item.tags.length > 0) {
                htmlItem += '<div class="result-tags">';
                item.tags.forEach(tag => {
                    htmlItem += `<span class="tag">${tag}</span>`;
                });
                htmlItem += '</div>';
            }

            htmlItem += `
                    </div>
                </article>
            `;
            
            resultsContainer.innerHTML += htmlItem;
        });
    }

    
    // --- 6. LÓGICA DE LA PÁGINA DE FAQ (faq.html) ---
    function mostrarFAQs() {
        if (!faqContainer) return; 
        
        const faqs = baseDeDatos.filter(item => item.type === 'faq');
        faqContainer.innerHTML = ''; 

        if (faqs.length === 0) {
            faqContainer.innerHTML = '<p class="placeholder">No hay preguntas frecuentes definidas.</p>';
            return;
        }
        
        faqContainer.innerHTML = '<h2>Preguntas Frecuentes (FAQ)</h2>'; 

        faqs.forEach(faq => {
            let htmlFaq = `
                <article class="faq-item">
                    <div class="faq-header">
                        <h3>${faq.title}</h3>
                    </div>
                    <div class="faq-body">
                        <h4>Respuesta / Solución</h4>
                        <ul>
                            ${faq.solutions.map(sol => `<li>${sol}</li>`).join('')}
                        </ul>
                    </div>
                </article>
            `;
            faqContainer.innerHTML += htmlFaq;
        });
    }

    
    // --- 7. LÓGICA DEL FORMULARIO DE REPORTE (reportar.html) ---
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const nuevoReporte = {
                id: `gen-${Math.floor(Math.random() * 900) + 100}`, 
                type: document.getElementById('reportType').value,
                code: document.getElementById('reportCode').value ? Number(document.getElementById('reportCode').value) : null, // Intentar guardarlo como número
                title: document.getElementById('reportTitle').value,
                imageUrl: "", 
                description: document.getElementById('reportDescription').value,
                causes: document.getElementById('reportCauses').value.split('\n').filter(line => line.trim() !== ''),
                solutions: document.getElementById('reportSolutions').value.split('\n').filter(line => line.trim() !== ''),
                tags: document.getElementById('reportTags').value.split(',').map(tag => tag.trim().toLowerCase()),
            };
            
            console.log("Nuevo reporte generado:", nuevoReporte);
            
            alert('¡Reporte generado! Revisa la consola (F12) para ver el objeto JSON.\n\nIMPORTANTE: Copia el objeto de la consola y pégalo manualmente en tu archivo "data.json" para guardarlo permanentemente.');

            const jsonOutput = JSON.stringify(nuevoReporte, null, 2); 
            let outputElement = document.getElementById('jsonOutput');
            if (!outputElement) {
                outputElement = document.createElement('pre');
                outputElement.id = 'jsonOutput';
                outputElement.style.backgroundColor = '#eee';
                outputElement.style.padding = '15px';
                outputElement.style.borderRadius = '8px';
                outputElement.style.marginTop = '20px';
                reportForm.after(outputElement);
            }
            outputElement.textContent = 'Copia este código y agrégalo al final de tu data.json (dentro del [ ]):\n\n' + jsonOutput;
        });
    }
});