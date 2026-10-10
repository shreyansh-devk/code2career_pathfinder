import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkOrigin, body, ApiError } from '../src/lib/http';
test('CSRF compares the original host when Next normalizes its internal URL',()=>{
  const good=new Request('http://localhost:3100/api/example',{method:'POST',headers:{Host:'127.0.0.1:3100',Origin:'http://127.0.0.1:3100','Content-Type':'application/json'},body:'{}'});
  assert.doesNotThrow(()=>checkOrigin(good));
  const bad=new Request(good,{headers:{Host:'127.0.0.1:3100',Origin:'https://hostile.example','Content-Type':'application/json'}});
  assert.throws(()=>checkOrigin(bad),ApiError);
});
test('JSON parsing rejects malformed and oversized request bodies',async()=>{
  await assert.rejects(()=>body(new Request('http://localhost',{method:'POST',body:'bad json'})),ApiError);
  await assert.rejects(()=>body(new Request('http://localhost',{method:'POST',body:'x'.repeat(64001)})),ApiError);
});
