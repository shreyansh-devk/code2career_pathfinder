import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aiDiagnosticDetails,aiFailureCategory} from '../src/lib/ai-errors';

test('AI failures distinguish graph rejection from provider and timeout failures',()=>{
  assert.equal(aiFailureCategory(new Error('Every milestone must lead to a role.')),'invalid_graph_disconnected_milestone');
  assert.equal(aiFailureCategory({name:'AI_APICallError',statusCode:403}),'provider_http_403');
  assert.equal(aiFailureCategory({name:'TimeoutError'}),'timeout');
  assert.equal(aiFailureCategory({name:'AI_NoObjectGeneratedError'}),'invalid_output');
});

test('AI diagnostics contain metadata without prompts, credentials, output or error messages',()=>{
  const secret='private-test-value';
  const diagnostic=aiDiagnosticDetails({name:'AI_APICallError',message:secret,text:secret,prompt:secret,headers:{Authorization:secret},cause:{name:'TypeError',code:'ECONNRESET',message:secret}});
  assert.equal(diagnostic.textLength,secret.length);
  assert.equal(diagnostic.code,'ECONNRESET');
  assert.doesNotMatch(JSON.stringify(diagnostic),new RegExp(secret));
  assert.equal(aiDiagnosticDetails({name:secret+' secret',code:secret+' secret',cause:secret}).name,undefined);
  assert.equal(aiFailureCategory(undefined),'validation_or_provider');
});
