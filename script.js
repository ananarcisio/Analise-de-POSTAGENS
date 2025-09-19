// Dados otimizados para público jovem cristão
const dadosHorarios = {
    labels: ['7h', '9h', '11h', '13h', '15h', '16h', '18h', '19h', '20h', '21h', '22h'],
    datasets: [{
        label: 'Engajamento (%)',
        data: [20, 30, 40, 50, 60, 75, 85, 95, 90, 80, 65],
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        fill: true
    }]
};

const dadosDias = {
    labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
    datasets: [{
        label: 'Engajamento Médio',
        data: [70, 85, 75, 90, 65, 80, 95],
        backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#28a745'
        ]
    }]
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do localStorage
    postagens = JSON.parse(localStorage.getItem('postagens')) || [];
    atualizarEstatisticas();
    
    // Gráfico de horários
    const ctxHorarios = document.getElementById('horariosChart').getContext('2d');
    new Chart(ctxHorarios, {
        type: 'line',
        data: dadosHorarios,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // Gráfico de dias
    const ctxDias = document.getElementById('diasChart').getContext('2d');
    new Chart(ctxDias, {
        type: 'doughnut',
        data: dadosDias,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

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
            diaDiv.innerHTML = `${dia}<br><small>${getHorarioSugerido(diaSemana)}</small>`;
        } else {
            diaDiv.className += ' dia-normal';
            diaDiv.textContent = dia;
        }
        
        calendario.appendChild(diaDiv);
    }
}

// Lógica para determinar se deve postar (otimizada para perfil jovem cristão)
function shouldPost(data, index) {
    const diaSemana = data.getDay();
    const semana = Math.floor(index / 7);
    
    // Padrão: 3 posts por semana focando nos melhores dias
    if (semana % 2 === 0) {
        // Semanas pares: Domingo, Terça e Quinta
        return diaSemana === 0 || diaSemana === 2 || diaSemana === 4;
    } else {
        // Semanas ímpares: Segunda, Quarta e Sábado
        return diaSemana === 1 || diaSemana === 3 || diaSemana === 6;
    }
}

// Sugerir horário baseado no dia (otimizado para jovens cristãos)
function getHorarioSugerido(diaSemana) {
    const horarios = {
        0: '18h', // Domingo (pós-culto)
        1: '20h', // Segunda
        2: '19h', // Terça (melhor horário)
        3: '19h', // Quarta
        4: '20h', // Quinta
        5: '19h', // Sexta
        6: '16h'  // Sábado (tarde)
    };
    return horarios[diaSemana] || '19h';
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    if (postagens.length === 0) return;
    
    const totalCurtidas = postagens.reduce((sum, p) => sum + p.curtidas, 0);
    const totalViews = postagens.reduce((sum, p) => sum + p.views, 0);
    const totalCompartilhamentos = postagens.reduce((sum, p) => sum + p.compartilhamentos, 0);
    
    const mediaCurtidas = Math.round(totalCurtidas / postagens.length);
    const mediaViews = Math.round(totalViews / postagens.length);
    const mediaCompartilhamentos = Math.round(totalCompartilhamentos / postagens.length);
    
    // Atualizar cards de estatísticas
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = mediaViews;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = mediaCurtidas;
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = mediaCompartilhamentos;
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

