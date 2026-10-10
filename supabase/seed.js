const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lfmioglpsdhrqhweiuds.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbWlvZ2xwc2RocnFod2VpdWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTg1NTYsImV4cCI6MjEwNzAzNDU1Nn0.o0Dd2xc3gYWK-BTicQoInLRmZFeyolTxB0AdAOEVX0U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Populando dados iniciais no Supabase...');

  // 1. Cursos
  const { data: courses, error: errC } = await supabase.from('courses').upsert([
    {
      code: 'LEI-2026',
      name: 'Engenharia Informática',
      department: 'Departamento de Ciências da Computação',
      terminal_level: '13º Nível (Conclusão)',
      description: 'Licenciatura com foco em Engenharia de Software, IA e Sistemas Distribuídos.',
      is_active: true
    },
    {
      code: 'LTR-2026',
      name: 'Telecomunicações e Redes',
      department: 'Departamento de Telecomunicações',
      terminal_level: '13º Nível (Conclusão)',
      description: 'Engenharia de Redes, Infraestrutura Óptica, Satélites e Cibersegurança.',
      is_active: true
    }
  ], { onConflict: 'code' }).select();

  if (errC) console.error('Erro cursos:', errC);
  else console.log('Cursos inseridos/atualizados com sucesso!');

  console.log('Seeding concluído com sucesso!');
}

seed();
