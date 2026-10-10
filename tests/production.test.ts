import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDb,localMode} from '../src/lib/db';
test('production rejects local storage even when the development flag is enabled',async()=>{const old={node:process.env.NODE_ENV,local:process.env.ENABLE_LOCAL_AUTH,database:process.env.DATABASE_URL};try{Reflect.set(process.env,'NODE_ENV','production');process.env.ENABLE_LOCAL_AUTH='true';delete process.env.DATABASE_URL;assert.equal(localMode(),false);await assert.rejects(getDb(),/DATABASE_NOT_CONFIGURED/);}finally{for(const [key,value]of Object.entries({NODE_ENV:old.node,ENABLE_LOCAL_AUTH:old.local,DATABASE_URL:old.database})){if(value===undefined)delete process.env[key];else process.env[key]=value;}}});
