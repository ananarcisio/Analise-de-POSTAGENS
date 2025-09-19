// Função para calcular dados baseados nas postagens reais
function calcularDadosHorarios() {
    const horarios = {};
    const labels = ['12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h'];
    
    // Inicializar horários
    labels.forEach(h => horarios[h] = { total: 0, count: 0 });
    
    // Calcular engajamento por horário
    postagens.forEach(post => {
        const hora = post.horario.split(':')[0] + 'h';
        if (horarios[hora]) {
            const engajamento = post.curtidas + post.views + (post.compartilhamentos * 3);
            horarios[hora].total += engajamento;
            horarios[hora].count++;
        }
    });
    
    const data = labels.map(h => {
        if (horarios[h].count > 0) {
            return Math.round(horarios[h].total / horarios[h].count);
        }
        // Horários otimizados para jovens (19h-21h são melhores)
        if (h === '19h' || h === '20h') return 95;
        if (h === '18h' || h === '21h') return 85;
        if (h === '17h' || h === '22h') return 70;
        return 50;
    });
    
    return {
        labels,
        datasets: [{
            label: 'Engajamento Real',
            data,
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            fill: true
        }]
    };
}

function calcularDadosDias() {
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const performance = {};
    
    // Inicializar dias
    dias.forEach(d => performance[d] = { total: 0, count: 0 });
    
    // Calcular engajamento por dia
    postagens.forEach(post => {
        const data = new Date(post.data);
        const dia = dias[data.getDay()];
        if (performance[dia]) {
            const engajamento = post.curtidas + post.views + (post.compartilhamentos * 3);
            performance[dia].total += engajamento;
            performance[dia].count++;
        }
    });
    
    const data = dias.map(d => {
        if (performance[d].count > 0) {
            return Math.round(performance[d].total / performance[d].count);
        }
        // Padrão otimizado para jovens
        if (d === 'Domingo') return 95;
        if (d === 'Quinta' || d === 'Terça') return 85;
        if (d === 'Sábado') return 80;
        return 70;
    });
    
    return {
        labels: dias,
        datasets: [{
            label: 'Engajamento Real por Dia',
            data,
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#28a745'
            ]
        }]
    };
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do localStorage
    postagens = JSON.parse(localStorage.getItem('postagens')) || [];
    atualizarEstatisticas();
    
    // Gráficos com dados reais
    atualizarGraficos();

    gerarCalendario();
    
    // Configurar hashtags clicáveis
    setTimeout(() => {
        document.querySelectorAll('.hashtag').forEach(hashtag => {
            hashtag.addEventListener('click', function() {
                navigator.clipboard.writeText(this.textContent).then(() => {
                    this.style.background = '#28a745';
                    this.style.color = 'white';
                    setTimeout(() => {
                        this.style.background = '#f8f9fa';
                        this.style.color = '#667eea';
                    }, 1000);
                });
            });
        });
    }, 1000);
    
    // Configurar formulário
    document.getElementById('postForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const novaPostagem = {
            data: document.getElementById('data').value,
            horario: document.getElementById('horario').value,
            tipo: document.getElementById('tipo').value,
            curtidas: parseInt(document.getElementById('curtidas').value) || 0,
            views: parseInt(document.getElementById('views').value) || 0,
            compartilhamentos: parseInt(document.getElementById('compartilhamentos').value) || 0,
            timestamp: new Date().getTime()
        };
        
        postagens.push(novaPostagem);
        localStorage.setItem('postagens', JSON.stringify(postagens));
        
        alert('Postagem adicionada com sucesso!');
        this.reset();
        atualizarEstatisticas();
    });
});

// Sistema de armazenamento local
let postagens = JSON.parse(localStorage.getItem('postagens')) || [];

// Importar dados do arquivo JSON padrão
function importarDados() {
    try {
        fetch('dados.json')
            .then(response => response.json())
            .then(dados => {
                if (dados.postagens) {
                    postagens = dados.postagens;
                    localStorage.setItem('postagens', JSON.stringify(postagens));
                    atualizarEstatisticas();
                    alert(`${dados.postagens.length} postagens importadas!`);
                }
            })
            .catch(() => {
                alert('Arquivo dados.json não encontrado');
            });
    } catch (error) {
        alert('Erro ao importar dados');
    }
}

// Importar arquivo JSON personalizado
function importarArquivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.postagens) {
                postagens = dados.postagens;
                localStorage.setItem('postagens', JSON.stringify(postagens));
                atualizarEstatisticas();
                alert(`${dados.postagens.length} postagens importadas de ${file.name}!`);
            } else {
                alert('Formato inválido. O arquivo deve conter um objeto com "postagens"');
            }
        } catch (error) {
            alert('Erro ao ler o arquivo JSON');
        }
    };
    reader.readAsText(file);
}





// Gerar calendário de postagens
function gerarCalendario() {
    const calendario = document.getElementById('calendario');
    calendario.innerHTML = '';
    
    // Cabeçalho dos dias
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.textContent = dia;
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.style.padding = '10px';
        header.style.backgroundColor = '#667eea';
        header.style.color = 'white';
        header.style.borderRadius = '8px';
        calendario.appendChild(header);
    });
    
    // Gerar calendário do mês atual
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    // Adicionar dias vazios no início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
        const diaVazio = document.createElement('div');
        diaVazio.className = 'dia-calendario dia-normal';
        calendario.appendChild(diaVazio);
    }
    
    // Gerar dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(ano, mes, dia);
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia-calendario';
        
        const diaSemana = data.getDay();
        
        // Lógica para sugerir dias de postagem
        const devePostar = shouldPost(data, dia - 1);
        
        if (devePostar) {
            diaDiv.className += ' dia-post';
            const horarios = get2HorariosSugeridos(diaSemana);
            diaDiv.innerHTML = `${dia}<br><small>${horarios[0]}</small><br><small>${horarios[1]}</small>`;
        } else {
            diaDiv.className += ' dia-normal';
            diaDiv.textContent = dia;
        }
        
        calendario.appendChild(diaDiv);
    }
}

// Lógica para 2 posts por dia (otimizada para jovens)
function shouldPost(data, index) {
    const diaSemana = data.getDay();
    
    // 2 posts por dia: Domingo, Terça, Quinta, Sábado (4 dias = 8 posts/semana)
    return diaSemana === 0 || diaSemana === 2 || diaSemana === 4 || diaSemana === 6;
}

// Sugerir 2 horários por dia (otimizado para jovens)
function get2HorariosSugeridos(diaSemana) {
    const horarios = {
        0: ['12h', '19h'], // Domingo (almoço + pós-culto)
        2: ['12h', '19h'], // Terça (meio-dia + noite)
        4: ['12h', '20h'], // Quinta (meio-dia + noite jovem)
        6: ['16h', '18h']  // Sábado (tarde jovem)
    };
    return horarios[diaSemana] || ['12h', '19h'];
}

// Manter função original para compatibilidade
function getHorarioSugerido(diaSemana) {
    return get2HorariosSugeridos(diaSemana)[0];
}

// Atualizar estatísticas e gráficos
function atualizarEstatisticas() {
    if (postagens.length === 0) return;
    
    const totalCurtidas = postagens.reduce((sum, p) => sum + p.curtidas, 0);
    const totalViews = postagens.reduce((sum, p) => sum + p.views, 0);
    const totalCompartilhamentos = postagens.reduce((sum, p) => sum + p.compartilhamentos, 0);
    
    const mediaCurtidas = Math.round(totalCurtidas / postagens.length);
    const mediaViews = Math.round(totalViews / postagens.length);
    const alcanceMedio = Math.round((totalViews + totalCurtidas) / postagens.length);
    
    // Atualizar cards de estatísticas
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = mediaViews;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = mediaCurtidas;
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = alcanceMedio;
    
    // Atualizar gráficos
    atualizarGraficos();
    atualizarRecomendacoes();
}

// Atualizar gráficos com dados reais
let chartHorarios, chartDias;

function atualizarGraficos() {
    const dadosHorarios = calcularDadosHorarios();
    const dadosDias = calcularDadosDias();
    
    // Destruir gráficos existentes
    if (chartHorarios) chartHorarios.destroy();
    if (chartDias) chartDias.destroy();
    
    // Criar novos gráficos
    const ctxHorarios = document.getElementById('horariosChart').getContext('2d');
    chartHorarios = new Chart(ctxHorarios, {
        type: 'line',
        data: dadosHorarios,
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
    
    const ctxDias = document.getElementById('diasChart').getContext('2d');
    chartDias = new Chart(ctxDias, {
        type: 'doughnut',
        data: dadosDias,
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Atualizar recomendações baseadas nos dados reais
function atualizarRecomendacoes() {
    if (postagens.length < 3) return;
    
    const melhorHorario = analisarMelhorHorarioDetalhado();
    const melhorDia = analisarMelhorDia();
    
    const recList = document.querySelector('.rec-list');
    recList.innerHTML = `
        <div class="rec-item best">
            <strong>MELHOR:</strong> ${melhorDia} ${melhorHorario} (Baseado nos seus dados)
        </div>
        <div class="rec-item good">
            <strong>JOVENS:</strong> Quinta 20h-21h (Horário ideal para jovens)
        </div>
        <div class="rec-item good">
            <strong>JOVENS:</strong> Domingo 19h-20h (Pós-culto jovem)
        </div>
        <div class="rec-item average">
            <strong>TESTE:</strong> Terça 19h-20h (Meio da semana)
        </div>
    `;
}

// Análise de performance por horário
function analisarMelhorHorario() {
    if (postagens.length < 3) {
        alert('Adicione pelo menos 3 postagens para análise detalhada!');
        return;
    }
    
    const horarios = {};
    postagens.forEach(post => {
        const hora = post.horario.split(':')[0];
        if (!horarios[hora]) {
            horarios[hora] = { total: 0, count: 0 };
        }
        horarios[hora].total += post.curtidas + post.views + post.compartilhamentos;
        horarios[hora].count++;
    });
    
    let melhorHorario = '';
    let melhorScore = 0;
    
    Object.keys(horarios).forEach(hora => {
        const media = horarios[hora].total / horarios[hora].count;
        if (media > melhorScore) {
            melhorScore = media;
            melhorHorario = hora;
        }
    });
    
    const resultado = `
ANÁLISE DE PERFORMANCE:

Melhor horário: ${melhorHorario}h
Score médio: ${Math.round(melhorScore)}

Todos os horários:
${Object.keys(horarios).map(h => `${h}h: ${Math.round(horarios[h].total / horarios[h].count)} pontos`).join('\n')}
    `;
    
    alert(resultado);
}

// Exportar dados para análise
function exportarDados() {
    const dados = {
        postagens: postagens,
        estatisticas: {
            totalPostagens: postagens.length,
            mediaCurtidas: postagens.reduce((sum, p) => sum + p.curtidas, 0) / postagens.length || 0,
            mediaViews: postagens.reduce((sum, p) => sum + p.views, 0) / postagens.length || 0
        }
    };
    
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cultoup-analytics-dados.json';
    link.click();
    
    alert('Dados exportados com sucesso!');
}

// Gerar relatório de performance
function gerarRelatorio() {
    if (postagens.length === 0) {
        alert('Adicione algumas postagens primeiro para gerar o relatório!');
        return;
    }
    
    const melhorDia = analisarMelhorDia();
    const melhorHorario = analisarMelhorHorarioDetalhado();
    const tipoMaisEngajado = analisarMelhorTipo();
    
    const relatorio = `
=== RELATÓRIO DE PERFORMANCE - CULTOUP BOULEVARD ===

Total de Postagens: ${postagens.length}
Média de Curtidas: ${Math.round(postagens.reduce((sum, p) => sum + p.curtidas, 0) / postagens.length)}
Média de Views: ${Math.round(postagens.reduce((sum, p) => sum + p.views, 0) / postagens.length)}

Melhor Dia: ${melhorDia}
Melhor Horário: ${melhorHorario}
Tipo Mais Engajado: ${tipoMaisEngajado}

Recomendações:
- Poste mais conteúdo no ${melhorDia}
- Horário ideal: ${melhorHorario}
- Foque em: ${tipoMaisEngajado}
- Use hashtags relevantes para jovens cristãos
- Mantenha consistência de 3 posts por semana
    `;
    
    const blob = new Blob([relatorio], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-cultoup-boulevard.txt';
    link.click();
    
    alert('Relatório gerado com sucesso!');
}

// Análise detalhada do melhor dia
function analisarMelhorDia() {
    if (postagens.length === 0) return 'Dados insuficientes';
    
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const performance = {};
    
    postagens.forEach(post => {
        const data = new Date(post.data);
        const dia = dias[data.getDay()];
        if (!performance[dia]) {
            performance[dia] = { total: 0, count: 0 };
        }
        performance[dia].total += post.curtidas + post.views + post.compartilhamentos;
        performance[dia].count++;
    });
    
    let melhorDia = '';
    let melhorScore = 0;
    
    Object.keys(performance).forEach(dia => {
        const media = performance[dia].total / performance[dia].count;
        if (media > melhorScore) {
            melhorScore = media;
            melhorDia = dia;
        }
    });
    
    return melhorDia || 'Domingo (recomendado)';
}

// Análise detalhada do melhor horário
function analisarMelhorHorarioDetalhado() {
    if (postagens.length === 0) return '19h (recomendado)';
    
    const horarios = {};
    postagens.forEach(post => {
        const hora = post.horario.split(':')[0] + 'h';
        if (!horarios[hora]) {
            horarios[hora] = { total: 0, count: 0 };
        }
        horarios[hora].total += post.curtidas + post.views + post.compartilhamentos;
        horarios[hora].count++;
    });
    
    let melhorHorario = '';
    let melhorScore = 0;
    
    Object.keys(horarios).forEach(hora => {
        const media = horarios[hora].total / horarios[hora].count;
        if (media > melhorScore) {
            melhorScore = media;
            melhorHorario = hora;
        }
    });
    
    return melhorHorario || '19h (recomendado)';
}

// Análise do melhor tipo de conteúdo
function analisarMelhorTipo() {
    if (postagens.length === 0) return 'Versículo Inspiracional (recomendado)';
    
    const tipos = {};
    postagens.forEach(post => {
        if (!tipos[post.tipo]) {
            tipos[post.tipo] = { total: 0, count: 0 };
        }
        tipos[post.tipo].total += post.curtidas + post.views + post.compartilhamentos;
        tipos[post.tipo].count++;
    });
    
    let melhorTipo = '';
    let melhorScore = 0;
    
    Object.keys(tipos).forEach(tipo => {
        const media = tipos[tipo].total / tipos[tipo].count;
        if (media > melhorScore) {
            melhorScore = media;
            melhorTipo = tipo;
        }
    });
    
    return melhorTipo || 'Versículo Inspiracional (recomendado)';
}

// IA para sugerir horários ideais (2 posts por dia)
function sugerirHorarioIA() {
    const analise = analisarDadosIA();
    const sugestoes = gerarSugestoesIA(analise);
    
    const resultado = `
🤖 SUGESTÕES DA IA - 2 POSTS POR DIA

📅 CRONOGRAMA SEMANAL OTIMIZADO:

${sugestoes.cronograma}

📊 ANÁLISE DOS SEUS DADOS:
${analise.relatorio}

🎯 ESTRATÉGIA RECOMENDADA:
${sugestoes.estrategia}
    `;
    
    alert(resultado);
}

// Análise inteligente dos dados
function analisarDadosIA() {
    if (postagens.length === 0) {
        return {
            melhorHorario1: '12h',
            melhorHorario2: '19h',
            melhorDia: 'Domingo',
            relatorio: 'Sem dados suficientes. Usando padrões para jovens cristãos.'
        };
    }
    
    // Analisar horários por engajamento
    const horariosAnalise = {};
    const diasAnalise = {};
    
    postagens.forEach(post => {
        const hora = parseInt(post.horario.split(':')[0]);
        const data = new Date(post.data);
        const dia = data.getDay();
        const engajamento = post.curtidas + post.views + (post.compartilhamentos * 3);
        
        // Agrupar horários
        const faixaHorario = hora < 15 ? 'manha' : hora < 18 ? 'tarde' : 'noite';
        if (!horariosAnalise[faixaHorario]) horariosAnalise[faixaHorario] = [];
        horariosAnalise[faixaHorario].push(engajamento);
        
        // Analisar dias
        if (!diasAnalise[dia]) diasAnalise[dia] = [];
        diasAnalise[dia].push(engajamento);
    });
    
    // Calcular médias
    const mediasPorFaixa = {};
    Object.keys(horariosAnalise).forEach(faixa => {
        const soma = horariosAnalise[faixa].reduce((a, b) => a + b, 0);
        mediasPorFaixa[faixa] = soma / horariosAnalise[faixa].length;
    });
    
    const mediasPorDia = {};
    Object.keys(diasAnalise).forEach(dia => {
        const soma = diasAnalise[dia].reduce((a, b) => a + b, 0);
        mediasPorDia[dia] = soma / diasAnalise[dia].length;
    });
    
    // Encontrar melhores
    const melhorFaixa = Object.keys(mediasPorFaixa).reduce((a, b) => 
        mediasPorFaixa[a] > mediasPorFaixa[b] ? a : b
    );
    
    const melhorDiaNum = Object.keys(mediasPorDia).reduce((a, b) => 
        mediasPorDia[a] > mediasPorDia[b] ? a : b
    );
    
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return {
        melhorFaixa,
        melhorDia: diasSemana[melhorDiaNum],
        mediasPorFaixa,
        mediasPorDia,
        relatorio: `Melhor faixa: ${melhorFaixa} | Melhor dia: ${diasSemana[melhorDiaNum]} | Total de posts analisados: ${postagens.length}`
    };
}

// Gerar sugestões inteligentes
function gerarSugestoesIA(analise) {
    // Horários otimizados para jovens + seus dados
    const horariosJovens = {
        manha: ['12h', '13h'],
        tarde: ['16h', '17h'],
        noite: ['19h', '20h']
    };
    
    // Dias ideais para jovens cristãos
    const diasIdeais = ['Domingo', 'Terça', 'Quinta', 'Sábado'];
    
    // Combinar dados reais com otimização para jovens
    let horario1, horario2;
    
    if (analise.melhorFaixa === 'noite') {
        horario1 = '12h'; // Almoço
        horario2 = '19h'; // Noite (melhor para jovens)
    } else if (analise.melhorFaixa === 'tarde') {
        horario1 = '16h'; // Tarde
        horario2 = '20h'; // Noite jovem
    } else {
        horario1 = '12h'; // Meio-dia
        horario2 = '19h'; // Noite padrão jovem
    }
    
    const cronograma = `
🔥 DOMINGO (Melhor dia - Pós culto):
   • ${horario1} - Post de Tema Estudo
   • 19h - Conteúdo Jovens

💪 TERÇA (Meio da semana):
   • ${horario1} - Post de Curiosidades  
   • ${horario2} - Save the Date

🎆 QUINTA (Pré-fim de semana):
   • ${horario1} - Conteúdo Jovens
   • 20h - Post de Tema Estudo

🎉 SÁBADO (Fim de semana jovem):
   • 16h - Post de Curiosidades
   • 18h - Evento/Culto`;
    
    const estrategia = `
• Postar sempre nos horários de pico: ${horario1} e ${horario2}
• Focar em conteúdo jovem entre 18h-21h
• Domingo é seu melhor dia - aproveite!
• Evitar segunda e sexta (menor engajamento jovem)
• Usar hashtags #jovenscristas nos posts noturnos`;
    
    return { cronograma, estrategia };
}

