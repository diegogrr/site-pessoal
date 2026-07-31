/* ============================================================
   content/course.js — Manifesto do curso
   ------------------------------------------------------------
   Fonte única de verdade sobre a disciplina e a lista de
   tópicos. Para reordenar, renomear ou adicionar tópicos,
   edite APENAS este arquivo e crie/renomeie o arquivo
   correspondente em content/topics/.
   A mesma disciplina é ofertada em dois cursos do Campus Salto
   (ADS e BCC), com planos de ensino de conteúdo programático
   equivalente. As ofertas ficam em `offerings[]`; os campos
   agregados (code, program, semester) são derivados dela no fim
   deste arquivo, para que as views continuem simples.
   Os 12 tópicos derivam do conteúdo programático desses planos
   (máx. 15 tópicos).
   ============================================================ */

window.SD = window.SD || {};

SD.course = {
  name: "Sistemas Distribuídos",
  institution: "IFSP Campus Salto",

  /* ---- Ofertas da disciplina (planos de ensino em PlanoEnsino/) ---- */
  offerings: [
    {
      code: "SLTSIDO",
      program: "Tecnologia em Análise e Desenvolvimento de Sistemas",
      programShort: "ADS",
      semester: "5º semestre"
    },
    {
      code: "SLTSISD",
      program: "Bacharelado em Ciência da Computação",
      programShort: "BCC",
      semester: "6º semestre"
    }
  ],
  description:
    "Plataforma de apoio ao ensino de Sistemas Distribuídos: características, " +
    "questões de projeto, comunicação, replicação, segurança e computação em nuvem. " +
    "Use-a em aula, no modo apresentação, ou em estudo autodirigido.",

  objectives: [
    "Analisar, projetar e desenvolver soluções para problemas em ambientes de sistemas computacionais distribuídos."
  ],

  bibliography: {
    basic: [
      "COULOURIS, George; et al. Sistemas Distribuídos: Conceitos e Projetos. São Paulo: Bookman, 2013.",
      "KSHEMKALYANI, Ajay D.; SINGHAL, Mukesh. Distributed Computing: Principles, Algorithms, and Systems. New York: Cambridge, 2011.",
      "TANENBAUM, Andrew S.; VAN STEEN, Maarten. Sistemas Distribuídos: Princípios e Paradigmas. 2. ed. São Paulo: Pearson Prentice Hall, 2007.",
      "INTERNATIONAL JOURNAL OF NETWORKED AND DISTRIBUTED COMPUTING. Paris: Atlantis Press. ISSN 2211-7946."
    ],
    complementary: [
      "FERREIRA, António M. Introdução ao Cloud Computing: IaaS, PaaS, SaaS. Lisboa: FCA, 2015.",
      "KUROSE, James F.; ROSS, Keith W. Redes de Computadores e a Internet. São Paulo: Pearson, 2013.",
      "STEVENS, W. Richard; et al. Unix Network Programming, Volume 1. New Jersey: Prentice Hall, 2003.",
      "TANENBAUM, Andrew S.; BOS, Herbert. Sistemas Operacionais Modernos. 4. ed. São Paulo: Pearson, 2016."
    ]
  },

  /* ---- Trilha de tópicos (id = nome do arquivo topic-<id>.js) ---- */
  topics: [
    {
      id: "01",
      title: "Caracterização de Sistemas Distribuídos",
      summary: "Conceitos introdutórios, tipos de sistemas distribuídos, objetivos da tecnologia e desafios."
    },
    {
      id: "02",
      title: "Modelos de Sistema",
      summary: "Modelos de arquitetura, modelos fundamentais e exemplos de arquiteturas."
    },
    {
      id: "03",
      title: "Redes de Computadores e Interligação em Rede",
      summary: "Revisão dos fundamentos de redes que sustentam os sistemas distribuídos."
    },
    {
      id: "04",
      title: "Comunicação entre Processos",
      summary: "API para protocolos Internet, empacotamento de dados, comunicação cliente-servidor e em grupo."
    },
    {
      id: "05",
      title: "Objetos Distribuídos e Invocação Remota",
      summary: "Comunicação entre objetos distribuídos e chamada de procedimento remoto (RPC)."
    },
    {
      id: "06",
      title: "Sistemas Operacionais Distribuídos",
      summary: "Arquiteturas distribuídas de sistemas operacionais e virtualização."
    },
    {
      id: "07",
      title: "Segurança",
      summary: "Visão geral das técnicas de segurança em sistemas distribuídos."
    },
    {
      id: "08",
      title: "Sistemas de Arquivos Distribuídos",
      summary: "Arquitetura do serviço de arquivos e estudos de caso."
    },
    {
      id: "09",
      title: "Serviços de Nomes",
      summary: "Serviço de nomes, o Domain Name System (DNS) e serviços de diretório."
    },
    {
      id: "10",
      title: "Replicação",
      summary: "Modelo de sistema, replicação em grupo e serviços tolerantes a falhas."
    },
    {
      id: "11",
      title: "Computação em Nuvem",
      summary: "Conceitos, recursos necessários e aplicabilidade no desenvolvimento de aplicações distribuídas."
    },
    {
      id: "12",
      title: "Computação Móvel e Ubíqua",
      summary: "Sistemas distribuídos em dispositivos móveis e ambientes ubíquos."
    }
  ],

  /* Utilitários de consulta */
  getTopic: function (id) {
    return this.topics.find(function (t) { return t.id === id; }) || null;
  },

  getTopicIndex: function (id) {
    return this.topics.findIndex(function (t) { return t.id === id; });
  },

  /* Rótulos curtos das ofertas, ex.: "ADS · BCC" ou "ADS (5º semestre)". */
  offeringLabels: function (withSemester) {
    return this.offerings.map(function (o) {
      return withSemester ? o.programShort + " (" + o.semester + ")" : o.programShort;
    });
  }
};

/* ---- Campos agregados derivados das ofertas (compatibilidade das views) ---- */
(function (course) {
  "use strict";
  course.code = course.offerings.map(function (o) { return o.code; }).join(" · ");
  course.program = course.offeringLabels(false).join(" e ");
  course.semester = course.offeringLabels(true).join(" · ");
})(SD.course);
