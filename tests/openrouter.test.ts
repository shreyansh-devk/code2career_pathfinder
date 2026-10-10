import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { openRouterModel, openRouterModelId } from '../src/lib/openrouter';

test('OpenRouter sends the free model and schema instructions without unsupported response_format',async () => {
  let sent:Record<string,unknown> | undefined;
  const model=openRouterModel('test-only-key',openRouterModelId,async (_url,options) => {
    sent=JSON.parse(String(options?.body));
    return Response.json({ id:'test',object:'chat.completion',created:1,model:openRouterModelId,choices:[{ index:0,message:{ role:'assistant',content:'```json\n{"ready":true}\n```' },finish_reason:'stop' }],usage:{ prompt_tokens:1,completion_tokens:1,total_tokens:2 } });
  });
  const result=await generateText({ model,output:Output.object({ schema:z.object({ ready:z.boolean() }) }),prompt:'Return ready.',maxRetries:0 });
  assert.deepEqual(result.output,{ ready:true });
  assert.equal(sent?.model,openRouterModelId);
  assert.equal(sent?.response_format,undefined);
  assert.deepEqual(sent?.reasoning,{ enabled:false });
  assert.match(JSON.stringify(sent?.messages),/JSON Schema/);
  assert.match((sent?.messages as {content:string}[])[0].content,/"ready"/);
  assert.doesNotMatch(JSON.stringify(sent),/test-only-key/);
});

test('OpenRouter schema validation rejects wrong types instead of accepting malformed work',async () => {
  const model=openRouterModel('test-only-key',openRouterModelId,async () => Response.json({ id:'test',object:'chat.completion',created:1,model:openRouterModelId,choices:[{ index:0,message:{ role:'assistant',content:'{"ready":"yes"}' },finish_reason:'stop' }] }));
  await assert.rejects(generateText({ model,output:Output.object({ schema:z.object({ ready:z.boolean() }) }),prompt:'Return ready.',maxRetries:0 }),{ name:'AI_NoObjectGeneratedError' });
});
