// Small original, manually reviewed diagnostic set. This is not an AI-generated quiz or a multiplayer room.
export const questions = [
  { id:'ratio', topic:'Quantitative reasoning', text:'A team has 8 designers and 12 developers. What fraction of the team are designers?', options:['1/5','2/5','3/5','2/3'], answer:1, explanation:'There are 20 people. Designers are 8/20 = 2/5 of the team.' },
  { id:'percentage', topic:'Quantitative reasoning', text:'A price rises from ₹800 to ₹920. What is the percentage increase?', options:['12%','15%','20%','25%'], answer:1, explanation:'The increase is ₹120. 120 ÷ 800 × 100 = 15%.' },
  { id:'sequence', topic:'Logical reasoning', text:'What comes next in the sequence 3, 7, 15, 31?', options:['47','61','62','63'], answer:3, explanation:'Each term is twice the previous term plus 1. 31 × 2 + 1 = 63.' },
  { id:'deduction', topic:'Logical reasoning', text:'All reviewers are engineers. Some engineers are mentors. Which statement must be true?', options:['All reviewers are mentors','Some mentors are reviewers','All reviewers are engineers','No engineers are reviewers'], answer:2, explanation:'Only the first premise is guaranteed. The overlap between reviewers and mentors is not specified.' },
  { id:'average', topic:'Quantitative reasoning', text:'The average of four scores is 18. Three scores are 12, 16 and 20. What is the fourth score?', options:['18','20','22','24'], answer:3, explanation:'The total must be 4 × 18 = 72. The known scores total 48, so the fourth is 24.' },
  { id:'verbal', topic:'Verbal reasoning', text:'Choose the clearest sentence for a project update.', options:['The task, which it was delayed, is done.','The task was delayed but is now complete.','The task done was delayed it.','Despite was delayed, task done.'], answer:1, explanation:'The second sentence states the delay and completion clearly with correct grammar.' },
];
export function scoreAnswers(ids: string[], answers: Record<string, number>) {
  const details = ids.map(id => {
    const question = questions.find(q => q.id === id)!;
    return { ...question, selected: answers[id] ?? null, correct: answers[id] === question.answer };
  });
  return { correct: details.filter(d => d.correct).length, total: details.length, details };
}
