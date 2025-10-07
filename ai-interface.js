// Interface para IA Analytics
class AIInterface {
    constructor() {
        this.setupEventListeners();
        this.loadSavedApiKey();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botão de configuração da IA
        const configBtn = document.getElementById('configAI');
        if (configBtn) {
            configBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Botão de análise com IA
        const analyzeBtn = document.getElementById('analyzeAI');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.runAIAnalysis());
        }
    }

    // Carregar API key salva
    loadSavedApiKey() {
        const savedKey = aiAnalytics.loadApiKey();
        if (savedKey) {
            this.updateAIStatus(true);
        }
    }

    // Mostrar modal de configuração
    showConfigModal() {
        const modal = this.createConfigModal();
        document.body.appendChild(modal);
    }

    // Criar modal de configuração
    createConfigModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-modal';
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h3>🤖 Configurar IA Analytics</h3>
                    <span class="ai-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="ai-modal-body">
                    <p>Para usar a análise com IA, você precisa de uma API key gratuita do Hugging Face:</p>
                    
                    <div class="ai-steps">
                        <div class="ai-step">
                            <strong>1.</strong> Acesse <a href="https://huggingface.co/join" target="_blank">huggingface.co/join</a>
                        </div>
                        <div class="ai-step">
                            <strong>2.</strong> Crie uma conta gratuita
                        </div>
                        <div class="ai-step">
                            <strong>3.</strong> Vá em Settings → Access Tokens
                        </div>
                        <div class="ai-step">
                            <strong>4.</strong> Crie um novo token (Read access)
                        </div>
                        <div class="ai-step">
                            <strong>5.</strong> Cole o token abaixo:
                        </div>
                    </div>

                    <div class="ai-input-group">
                        <label for="apiKeyInput">API Key do Hugging Face:</label>
                        <input type="password" id="apiKeyInput" placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx">
                        <button onclick="aiInterface.saveApiKey()" class="ai-save-btn">💾 Salvar</button>
                    </div>

                    <div class="ai-info">
                        <p><strong>🔒 Privacidade:</strong> Sua API key é salva apenas no seu navegador</p>
                        <p><strong>💰 Custo:</strong> Totalmente gratuito (limite de 1000 requests/mês)</p>
                        <p><strong>🚀 Recursos:</strong> Análise de sentimentos, insights automáticos, previsões</p>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    // Salvar API key
    saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const apiKey = input.value.trim();

        if (!apiKey) {
            alert('Por favor, insira uma API key válida');
            return;
        }

        if (!apiKey.startsWith('hf_')) {
            alert('API key deve começar com "hf_"');
            return;
        }

        aiAnalytics.setApiKey(apiKey);
        this.updateAIStatus(true);
        
        // Fechar modal
        document.querySelector('.ai-modal').remove();
        
        alert('✅ IA configurada com sucesso! Agora você pode usar análises avançadas.');
    }

    // Atualizar status da IA
    updateAIStatus(configured) {
        const statusElement = document.getElementById('aiStatus');
        const configBtn = document.getElementById('configAI');
        const analyzeBtn = document.getElementById('analyzeAI');

        if (configured) {
            if (statusElement) statusElement.textContent = '✅ IA Configurada';
            if (configBtn) configBtn.textContent = '⚙️ Reconfigurar IA';
            if (analyzeBtn) analyzeBtn.disabled = false;
        } else {
            if (statusElement) statusElement.textContent = '❌ IA Não Configurada';
            if (configBtn) configBtn.textContent = '🤖 Configurar IA';
            if (analyzeBtn) analyzeBtn.disabled = true;
        }
    }

    // Executar análise com IA
    async runAIAnalysis() {
        if (!aiAnalytics.apiKey) {
            alert('Configure a IA primeiro!');
            this.showConfigModal();
            return;
        }

        if (postagens.length < 3) {
            alert('Adicione pelo menos 3 postagens para análise com IA');
            return;
        }

        // Mostrar loading
        this.showLoadingModal();

        try {
            // Gerar insights com IA
            const insights = await aiAnalytics.gerarInsights(postagens);
            
            // Fechar loading
            this.hideLoadingModal();
            
            // Mostrar resultados
            this.showInsightsModal(insights);
            
        } catch (error) {
            this.hideLoadingModal();
            console.error('Erro na análise:', error);
            alert('Erro na análise com IA. Verifique sua conexão e API key.');
        }
    }

    // Mostrar modal de loading
    showLoadingModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-modal';
        modal.id = 'loadingModal';
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-loading">
                    <div class="ai-spinner"></div>
                    <h3>🤖 IA Analisando seus dados...</h3>
                    <p>Processando ${postagens.length} postagens</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Esconder modal de loading
    hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        if (modal) modal.remove();
    }

    // Mostrar insights da IA
    showInsightsModal(insights) {
        const modal = document.createElement('div');
        modal.className = 'ai-modal ai-insights-modal';
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h3>🤖 Insights da IA</h3>
                    <span class="ai-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="ai-modal-body">
                    ${this.formatInsights(insights)}
                </div>
                <div class="ai-modal-footer">
                    <button onclick="aiInterface.exportInsights()" class="ai-export-btn">📄 Exportar Relatório</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="ai-close-btn">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Salvar insights para exportação
        this.lastInsights = insights;
    }

    // Formatar insights para exibição
    formatInsights(insights) {
        return `
            <div class="ai-insights">
                <div class="ai-section">
                    <h4>📈 Tendências Identificadas</h4>
                    <div class="ai-trend">
                        <strong>Crescimento:</strong> ${insights.tendencias.crescimento.crescimento}% 
                        (${insights.tendencias.crescimento.tendencia})
                    </div>
                    <div class="ai-trend">
                        <strong>Melhor Conteúdo:</strong> ${insights.tendencias.melhorTipo.tipo} 
                        (Score: ${insights.tendencias.melhorTipo.score})
                    </div>
                    <div class="ai-trend">
                        <strong>Melhor Horário:</strong> ${insights.tendencias.padraoHorario.faixa} 
                        (Score: ${insights.tendencias.padraoHorario.score})
                    </div>
                </div>

                <div class="ai-section">
                    <h4>💡 Recomendações da IA</h4>
                    <div class="ai-recommendations">
                        <div class="ai-rec-category">
                            <strong>Conteúdo:</strong>
                            <ul>
                                ${insights.recomendacoes.conteudo.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="ai-rec-category">
                            <strong>Horários:</strong>
                            <ul>
                                ${insights.recomendacoes.horarios.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="ai-rec-category">
                            <strong>Frequência:</strong>
                            <ul>
                                ${insights.recomendacoes.frequencia.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="ai-section">
                    <h4>🔮 Previsões</h4>
                    <div class="ai-predictions">
                        <div class="ai-prediction">
                            <strong>Próximo Mês:</strong> ${insights.previsoes.proximoMes.engajamento} pontos de engajamento 
                            (Confiança: ${insights.previsoes.proximoMes.confianca})
                        </div>
                        <div class="ai-prediction">
                            <strong>Melhor Dia:</strong> ${insights.previsoes.melhorDia}
                        </div>
                        <div class="ai-prediction">
                            <strong>Crescimento:</strong> ${insights.previsoes.crescimentoSeguidores}
                        </div>
                    </div>
                </div>

                <div class="ai-section">
                    <h4>⚡ Otimizações Sugeridas</h4>
                    <div class="ai-optimizations">
                        ${Object.keys(insights.otimizacoes).map(categoria => `
                            <div class="ai-opt-category">
                                <strong>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}:</strong>
                                <ul>
                                    ${insights.otimizacoes[categoria].map(opt => `<li>${opt}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="ai-section">
                    <h4>🏷️ Hashtags Recomendadas pela IA</h4>
                    <div class="ai-hashtags">
                        ${insights.recomendacoes.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Exportar insights
    exportInsights() {
        if (!this.lastInsights) return;

        const relatorio = this.generateInsightsReport(this.lastInsights);
        const blob = new Blob([relatorio], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-ia-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        alert('📄 Relatório da IA exportado com sucesso!');
    }

    // Gerar relatório de texto
    generateInsightsReport(insights) {
        return `
=== RELATÓRIO DE INSIGHTS DA IA ===
Data: ${new Date().toLocaleDateString('pt-BR')}
Total de Postagens Analisadas: ${postagens.length}

📈 TENDÊNCIAS IDENTIFICADAS:
- Crescimento: ${insights.tendencias.crescimento.crescimento}% (${insights.tendencias.crescimento.tendencia})
- Melhor Tipo de Conteúdo: ${insights.tendencias.melhorTipo.tipo} (Score: ${insights.tendencias.melhorTipo.score})
- Melhor Período: ${insights.tendencias.padraoHorario.faixa} (Score: ${insights.tendencias.padraoHorario.score})
- Melhor Mês: ${insights.tendencias.sazonalidade.mes} (Score: ${insights.tendencias.sazonalidade.score})

💡 RECOMENDAÇÕES DA IA:

Conteúdo:
${insights.recomendacoes.conteudo.map(rec => `- ${rec}`).join('\n')}

Horários:
${insights.recomendacoes.horarios.map(rec => `- ${rec}`).join('\n')}

Frequência:
${insights.recomendacoes.frequencia.map(rec => `- ${rec}`).join('\n')}

🔮 PREVISÕES:
- Engajamento Próximo Mês: ${insights.previsoes.proximoMes.engajamento} pontos (Confiança: ${insights.previsoes.proximoMes.confianca})
- Melhor Dia da Semana: ${insights.previsoes.melhorDia}
- Crescimento de Seguidores: ${insights.previsoes.crescimentoSeguidores}

⚡ OTIMIZAÇÕES SUGERIDAS:
${Object.keys(insights.otimizacoes).map(categoria => 
    `${categoria.toUpperCase()}:\n${insights.otimizacoes[categoria].map(opt => `- ${opt}`).join('\n')}`
).join('\n\n')}

🏷️ HASHTAGS RECOMENDADAS:
${insights.recomendacoes.hashtags.join(' ')}

---
Relatório gerado automaticamente pela IA Analytics
        `;
    }
}

// Instância global da interface
const aiInterface = new AIInterface();