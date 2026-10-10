const graphFailures: Record<string,string> = {
  'Milestone IDs must be unique.':'duplicate_milestones',
  'Skill identifiers must be unique.':'duplicate_skills',
  'Duplicate prerequisite.':'duplicate_prerequisite',
  'A prerequisite refers to a missing milestone.':'missing_prerequisite',
  'Prerequisites cannot be in a later phase.':'later_prerequisite',
  'The roadmap contains a dependency cycle.':'cycle',
  'Include at least one target or intermediate role.':'missing_role',
  'Every milestone must lead to a role.':'disconnected_milestone',
  'An AI career plan must include skills, concrete projects, an intermediate role and the target role.':'missing_career_structure',
};
type Failure = { name?:unknown; message?:unknown; statusCode?:unknown; finishReason?:unknown; text?:unknown; cause?:Failure; code?:unknown };
const label = (value:unknown) => typeof value === 'string' && /^[a-zA-Z0-9_]{1,64}$/.test(value) ? value : undefined;
function fields(error:unknown):Failure { return error && typeof error==='object' ? error as Failure : {}; }
export function aiFailureCategory(error:unknown) {
  const e=fields(error);
  if(e.name==='TimeoutError'||e.name==='AbortError')return 'timeout';
  if(typeof e.statusCode==='number'&&Number.isInteger(e.statusCode)&&e.statusCode>=100&&e.statusCode<=599)return `provider_http_${e.statusCode}`;
  if(e.name==='AI_NoObjectGeneratedError')return 'invalid_output';
  if(typeof e.message==='string'&&Object.hasOwn(graphFailures,e.message))return `invalid_graph_${graphFailures[e.message]}`;
  return 'validation_or_provider';
}
export function aiDiagnosticDetails(error:unknown) {
  const e=fields(error),cause=fields(e.cause);
  return { category:aiFailureCategory(error),name:label(e.name),status:typeof e.statusCode==='number'?e.statusCode:undefined,
    finish:label(e.finishReason),textLength:typeof e.text==='string'?e.text.length:undefined,cause:label(cause.name),code:label(cause.code)||label(e.code) };
}
export function aiDiagnostic(error:unknown) { console.info('AI diagnostic',aiDiagnosticDetails(error)); }
