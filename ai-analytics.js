// Integração com IA gratuita para análise de dados
class AIAnalytics {
    constructor() {
        this.apiKey = null; // Será configurada pelo usuário
        this.baseURL = 'https://api-inference.huggingface.co/models/';
        this.models = {
            sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
            text: 'microsoft/DialoGPT-medium'
        };
    }

    // Configurar API Key (gratuita do Hugging Face)
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('hf_api_key', key);
    }

    // Carregar API Key salva
    loadApiKey() {
        this.apiKey = localStorage.getItem('hf_api_key');
        return this.apiKey;
    }

    // Análise de sentimento dos dados
    async analisarSentimento(texto) {
        if (!this.apiKey) {
            throw new Error('API Key não configurada');
        }

        try {
            const response = await fetch(this.baseURL + this.models.sentiment, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: texto })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na análise de sentimento:', error);
            return null;
        }
    }

    // Gerar insights com IA
    async gerarInsights(dadosPostagens) {
        const insights = {
            tendencias: this.analisarTendencias(dadosPostagens),
            recomendacoes: await this.gerarRecomendacoesIA(dadosPostagens),
            previsoes: this.gerarPrevisoes(dadosPostagens),
            otimizacoes: this.sugerirOtimizacoes(dadosPostagens)
        };

        return insights;
    }

    // Análise de tendências
    analisarTendencias(postagens) {
        const tendencias = {
            crescimento: this.calcularCrescimento(postagens),
            melhorTipo: this.identificarMelhorTipo(postagens),
            padraoHorario: this.identificarPadraoHorario(postagens),
            sazonalidade: this.analisarSazonalidade(postagens)
        };

        return tendencias;
    }

    // Calcular crescimento de engajamento
    calcularCrescimento(postagens) {
        if (postagens.length < 2) return { crescimento: 0, tendencia: 'estável' };

        const metade = Math.floor(postagens.length / 2);
        const primeiraParte = postagens.slice(0, metade);
        const segundaParte = postagens.slice(metade);

        const mediaInicial = this.calcularMediaEngajamento(primeiraParte);
        const mediaRecente = this.calcularMediaEngajamento(segundaParte);

        const crescimento = ((mediaRecente - mediaInicial) / mediaInicial) * 100;
        
        let tendencia = 'estável';
        if (crescimento > 10) tendencia = 'crescendo';
        else if (crescimento < -10) tendencia = 'declinando';

        return { crescimento: Math.round(crescimento), tendencia };
    }

    // Calcular média de engajamento
    calcularMediaEngajamento(postagens) {
        if (postagens.length === 0) return 0;
        
        const total = postagens.reduce((sum, post) => {
            return sum + post.curtidas + post.views + (post.compartilhamentos * 3);
        }, 0);

        return total / postagens.length;
    }

    // Identificar melhor tipo de conteúdo
    identificarMelhorTipo(postagens) {
        const tipos = {};
        
        postagens.forEach(post => {
            if (!tipos[post.tipo]) {
                tipos[post.tipo] = { total: 0, count: 0 };
            }
            tipos[post.tipo].total += post.curtidas + post.views + (post.compartilhamentos * 3);
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

        return { tipo: melhorTipo, score: Math.round(melhorScore) };
    }

    // Identificar padrão de horário
    identificarPadraoHorario(postagens) {
        const horarios = {};
        
        postagens.forEach(post => {
            const hora = parseInt(post.horario.split(':')[0]);
            const faixa = hora < 12 ? 'manhã' : hora < 18 ? 'tarde' : 'noite';
            
            if (!horarios[faixa]) {
                horarios[faixa] = { total: 0, count: 0 };
            }
            horarios[faixa].total += post.curtidas + post.views + (post.compartilhamentos * 3);
            horarios[faixa].count++;
        });

        let melhorFaixa = '';
        let melhorScore = 0;

        Object.keys(horarios).forEach(faixa => {
            const media = horarios[faixa].total / horarios[faixa].count;
            if (media > melhorScore) {
                melhorScore = media;
                melhorFaixa = faixa;
            }
        });

        return { faixa: melhorFaixa, score: Math.round(melhorScore) };
    }

    // Analisar sazonalidade
    analisarSazonalidade(postagens) {
        const meses = {};
        
        postagens.forEach(post => {
            const data = new Date(post.data);
            const mes = data.getMonth();
            
            if (!meses[mes]) {
                meses[mes] = { total: 0, count: 0 };
            }
            meses[mes].total += post.curtidas + post.views + (post.compartilhamentos * 3);
            meses[mes].count++;
        });

        const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        let melhorMes = '';
        let melhorScore = 0;

        Object.keys(meses).forEach(mes => {
            const media = meses[mes].total / meses[mes].count;
            if (media > melhorScore) {
                melhorScore = media;
                melhorMes = nomesMeses[mes];
            }
        });

        return { mes: melhorMes, score: Math.round(melhorScore) };
    }

    // Gerar recomendações com IA
    async gerarRecomendacoesIA(postagens) {
        const analise = this.analisarTendencias(postagens);
        
        const recomendacoes = {
            conteudo: this.recomendarConteudo(analise),
            horarios: this.recomendarHorarios(analise),
            frequencia: this.recomendarFrequencia(postagens),
            hashtags: this.recomendarHashtags(analise)
        };

        return recomendacoes;
    }

    // Recomendar tipo de conteúdo
    recomendarConteudo(analise) {
        const recomendacoes = [];
        
        if (analise.melhorTipo.tipo === 'jovens') {
            recomendacoes.push('Foque em conteúdo jovem - está performando bem');
            recomendacoes.push('Crie mais posts interativos para jovens');
        } else if (analise.melhorTipo.tipo === 'versiculo') {
            recomendacoes.push('Posts de versículos têm boa performance');
            recomendacoes.push('Combine versículos com reflexões pessoais');
        } else if (analise.melhorTipo.tipo === 'evento') {
            recomendacoes.push('Eventos geram engajamento - promova mais');
            recomendacoes.push('Use countdown para eventos importantes');
        }

        recomendacoes.push('Varie o tipo de conteúdo para manter interesse');
        return recomendacoes;
    }

    // Recomendar horários
    recomendarHorarios(analise) {
        const recomendacoes = [];
        
        if (analise.padraoHorario.faixa === 'noite') {
            recomendacoes.push('Mantenha posts noturnos (19h-21h)');
            recomendacoes.push('Teste horários entre 18h-20h para jovens');
        } else if (analise.padraoHorario.faixa === 'tarde') {
            recomendacoes.push('Aproveite o engajamento da tarde');
            recomendacoes.push('Teste posts às 16h-17h nos fins de semana');
        } else {
            recomendacoes.push('Posts matinais funcionam bem');
            recomendacoes.push('Teste horário de almoço (12h-13h)');
        }

        return recomendacoes;
    }

    // Recomendar frequência
    recomendarFrequencia(postagens) {
        const diasEntrePosts = this.calcularFrequenciaMedia(postagens);
        const recomendacoes = [];

        if (diasEntrePosts > 3) {
            recomendacoes.push('Aumente a frequência - poste a cada 2-3 dias');
            recomendacoes.push('Consistência é chave para crescimento');
        } else if (diasEntrePosts < 1) {
            recomendacoes.push('Cuidado com excesso - qualidade > quantidade');
            recomendacoes.push('Mantenha 1-2 posts por dia no máximo');
        } else {
            recomendacoes.push('Frequência atual está boa');
            recomendacoes.push('Mantenha a consistência');
        }

        return recomendacoes;
    }

    // Calcular frequência média
    calcularFrequenciaMedia(postagens) {
        if (postagens.length < 2) return 0;

        const datas = postagens.map(p => new Date(p.data)).sort((a, b) => a - b);
        let totalDias = 0;

        for (let i = 1; i < datas.length; i++) {
            const diff = (datas[i] - datas[i-1]) / (1000 * 60 * 60 * 24);
            totalDias += diff;
        }

        return totalDias / (datas.length - 1);
    }

    // Recomendar hashtags
    recomendarHashtags(analise) {
        const hashtags = {
            gerais: ['#fe', '#jesus', '#deus', '#cristo'],
            jovens: ['#jovenscristas', '#juventude', '#geracaojesus'],
            inspiracionais: ['#motivacao', '#esperanca', '#amor', '#paz']
        };

        const recomendacoes = [];

        if (analise.melhorTipo.tipo === 'jovens') {
            recomendacoes.push(...hashtags.jovens);
        }
        
        recomendacoes.push(...hashtags.gerais.slice(0, 2));
        recomendacoes.push(...hashtags.inspiracionais.slice(0, 2));

        return recomendacoes;
    }

    // Gerar previsões
    gerarPrevisoes(postagens) {
        const tendencia = this.calcularCrescimento(postagens);
        const previsoes = {
            proximoMes: this.preverEngajamentoProximoMes(postagens, tendencia),
            melhorDia: this.preverMelhorDiaProximaSemana(postagens),
            crescimentoSeguidores: this.preverCrescimentoSeguidores(tendencia)
        };

        return previsoes;
    }

    // Prever engajamento do próximo mês
    preverEngajamentoProximoMes(postagens, tendencia) {
        const mediaAtual = this.calcularMediaEngajamento(postagens);
        const fatorCrescimento = 1 + (tendencia.crescimento / 100);
        const previsao = Math.round(mediaAtual * fatorCrescimento);

        return {
            engajamento: previsao,
            confianca: postagens.length > 10 ? 'alta' : 'média'
        };
    }

    // Prever melhor dia da próxima semana
    preverMelhorDiaProximaSemana(postagens) {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const performance = {};

        postagens.forEach(post => {
            const data = new Date(post.data);
            const dia = dias[data.getDay()];
            if (!performance[dia]) {
                performance[dia] = { total: 0, count: 0 };
            }
            performance[dia].total += post.curtidas + post.views + (post.compartilhamentos * 3);
            performance[dia].count++;
        });

        let melhorDia = 'Domingo';
        let melhorScore = 0;

        Object.keys(performance).forEach(dia => {
            const media = performance[dia].total / performance[dia].count;
            if (media > melhorScore) {
                melhorScore = media;
                melhorDia = dia;
            }
        });

        return melhorDia;
    }

    // Prever crescimento de seguidores
    preverCrescimentoSeguidores(tendencia) {
        let previsao = 'estável';
        
        if (tendencia.crescimento > 15) {
            previsao = '+10-15 seguidores/mês';
        } else if (tendencia.crescimento > 5) {
            previsao = '+5-10 seguidores/mês';
        } else if (tendencia.crescimento < -10) {
            previsao = 'possível perda de seguidores';
        }

        return previsao;
    }

    // Sugerir otimizações
    sugerirOtimizacoes(postagens) {
        const otimizacoes = {
            conteudo: [],
            timing: [],
            engajamento: []
        };

        // Análise de conteúdo
        const tipos = this.analisarDistribuicaoTipos(postagens);
        if (tipos.desequilibrio) {
            otimizacoes.conteudo.push('Diversifique os tipos de conteúdo');
        }

        // Análise de timing
        const horarios = this.analisarDistribuicaoHorarios(postagens);
        if (horarios.concentrado) {
            otimizacoes.timing.push('Teste diferentes horários');
        }

        // Análise de engajamento
        const engajamento = this.analisarPadraoEngajamento(postagens);
        if (engajamento.baixo) {
            otimizacoes.engajamento.push('Foque em conteúdo mais interativo');
        }

        return otimizacoes;
    }

    // Analisar distribuição de tipos
    analisarDistribuicaoTipos(postagens) {
        const tipos = {};
        postagens.forEach(post => {
            tipos[post.tipo] = (tipos[post.tipo] || 0) + 1;
        });

        const valores = Object.values(tipos);
        const max = Math.max(...valores);
        const min = Math.min(...valores);
        
        return {
            desequilibrio: max > min * 3,
            distribuicao: tipos
        };
    }

    // Analisar distribuição de horários
    analisarDistribuicaoHorarios(postagens) {
        const horarios = {};
        postagens.forEach(post => {
            const hora = post.horario.split(':')[0];
            horarios[hora] = (horarios[hora] || 0) + 1;
        });

        const valores = Object.values(horarios);
        const total = valores.reduce((a, b) => a + b, 0);
        const concentracao = Math.max(...valores) / total;

        return {
            concentrado: concentracao > 0.5,
            distribuicao: horarios
        };
    }

    // Analisar padrão de engajamento
    analisarPadraoEngajamento(postagens) {
        const mediaEngajamento = this.calcularMediaEngajamento(postagens);
        const mediaViews = postagens.reduce((sum, p) => sum + p.views, 0) / postagens.length;
        
        return {
            baixo: mediaEngajamento < mediaViews * 0.1,
            media: mediaEngajamento
        };
    }
}

// Instância global da IA
const aiAnalytics = new AIAnalytics();