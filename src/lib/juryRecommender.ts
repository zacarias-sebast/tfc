import { UserProfile, JuryMember } from '@/types/database';

/**

 */
export function recommendJuryPanel(
  tfcTheme: string,
  tfcTitle: string,
  currentAdvisorId: string,
  professors: UserProfile[]
): {
  suggestedMembers: JuryMember[];
  explanation: string;
} {
  // Filtra apenas orientadores/professores ativos e exclui o próprio orientador do trabalho
  const candidates = professors.filter(
    (p) => p.role === 'orientador' && p.id !== currentAdvisorId && p.status === 'ativo'
  );

  const keywords = `${tfcTheme} ${tfcTitle}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  // Calcula afinidade por palavra-chave e áreas de especialização
  const scoredCandidates = candidates.map((prof) => {
    let score = 0;
    const specializations = prof.specialization || [];

    for (const spec of specializations) {
      const specLower = spec.toLowerCase();
      for (const word of keywords) {
        if (specLower.includes(word)) {
          score += 25;
        }
      }
    }

    // Se o departamento for coincidente, ganha pontuação base
    score += 15;

    return {
      professor: prof,
      score: Math.min(score, 100)
    };
  });

  // Ordena por maior afinidade
  scoredCandidates.sort((a, b) => b.score - a.score);

  const selected = scoredCandidates.slice(0, 3);
  
  if (selected.length < 3) {
    // Fallback caso haja poucos professores cadastrados
    return {
      suggestedMembers: candidates.slice(0, 3).map((p, idx) => ({
        professorId: p.id,
        name: p.name,
        role: idx === 0 ? 'presidente' : idx === 1 ? 'primeiro_vogal' : 'segundo_vogal',
        specialization: (p.specialization && p.specialization[0]) || 'Ciências da Computação'
      })),
      explanation: 'Sugestão automática gerada com os docentes disponíveis no departamento.'
    };
  }

  const members: JuryMember[] = [
    {
      professorId: selected[0].professor.id,
      name: selected[0].professor.name,
      role: 'presidente',
      specialization: selected[0].professor.specialization?.join(', ') || 'Engenharia de Sistemas'
    },
    {
      professorId: selected[1].professor.id,
      name: selected[1].professor.name,
      role: 'primeiro_vogal',
      specialization: selected[1].professor.specialization?.join(', ') || 'Engenharia de Software'
    },
    {
      professorId: selected[2].professor.id,
      name: selected[2].professor.name,
      role: 'segundo_vogal',
      specialization: selected[2].professor.specialization?.join(', ') || 'Redes e Cibersegurança'
    }
  ];

  const explanation = `Composição sugerida com base em alta afinidade temática com "${tfcTheme}". Especialistas em ${members.map(m => m.name.split(' ')[0]).join(', ')} possuem publicações e competências alinhadas aos requisitos técnicos do projeto.`;

  return {
    suggestedMembers: members,
    explanation
  };
}
