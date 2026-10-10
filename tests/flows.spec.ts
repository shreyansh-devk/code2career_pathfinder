import { test, expect, type Page, type Browser, type APIRequestContext } from '@playwright/test';
const origin='http://127.0.0.1:3100';
async function login(page:Page,username:string){await page.goto('/sign-in');await page.getByLabel('Username',{exact:true}).fill(username);await page.getByLabel('Password',{exact:true}).fill('pathfinder-local-2026');await page.getByRole('button',{name:'Sign in to workspace'}).click();await expect(page).toHaveURL(username==='admin'?/\/admin$/:username.includes('teacher')?/\/org$/:/\/app$/);}
async function account(browser:Browser,username:string){const context=await browser.newContext();const page=await context.newPage();await login(page,username);return {context,page,request:context.request};}
async function post(request:APIRequestContext,path:string,data:unknown){return request.post(`/api/${path}`,{data,headers:{Origin:origin}});}

test('learner graph, persistence, evidence, teacher review, assignment and diagnostic',async({page,browser})=>{
  await login(page,'learner');await page.getByRole('link',{name:'Create roadmap',exact:true}).click();
  await page.getByLabel('Exact target role').fill('Backend engineer for payment systems');
  await page.getByLabel('First skill or milestone').fill('HTTP and API design');
  await page.getByRole('button',{name:'Create my plan',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Backend engineer for payment systems',exact:true})).toBeVisible();
  const id=page.url().split('/').pop()!;
  await expect(page.locator('.skill-node').filter({hasText:'HTTP and API design'})).toBeVisible();
  await expect(page.getByText('AI guidance is unavailable', {exact:false})).toBeVisible();
  await page.getByRole('button',{name:'I know this already'}).click();await expect(page.getByRole('status')).toContainText('Downstream availability updated');
  await page.reload();await expect(page.getByRole('button',{name:'Remove known mark'})).toBeVisible();
  await page.getByRole('button',{name:'Add milestone',exact:true}).click();
  await page.getByLabel('Milestone title').fill('Build a resilient payment API');await page.getByLabel('Scope and learning objective').fill('Implement idempotent requests and document failure handling.');
  await page.getByLabel('HTTP and API design',{exact:true}).check();await page.getByRole('button',{name:'Save milestone'}).click();await expect(page.getByRole('status')).toContainText('Milestone added');
  await page.getByRole('button',{name:'Milestone list'}).click();await page.locator('.milestone-list button').filter({hasText:'Build a resilient payment API'}).click();
  await page.getByLabel('What did you build or learn?').fill('Built and tested an idempotent API with duplicate request handling.');await page.getByRole('button',{name:'Save evidence',exact:true}).click();await expect(page.getByRole('status')).toContainText('Evidence saved');
  await page.getByRole('button',{name:'Mark complete',exact:true}).click();await expect(page.getByRole('status')).toContainText('Progress saved');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export image'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('pathfinder-roadmap.svg');
  const teacher=await account(browser,'teacher');await expect(teacher.page.getByRole('heading',{name:'Build a resilient payment API',exact:true}).first()).toBeVisible();
  const review=teacher.page.locator('.review-card').filter({hasText:'Built and tested an idempotent API'}).first();await review.getByLabel('Specific feedback').fill('The duplicate-request tests support the idempotency claim. Add timeout recovery next.');await review.getByRole('button',{name:'Save review'}).click();await expect(teacher.page.getByRole('status')).toContainText('Review saved');
  await teacher.page.getByLabel('Assignment title').fill('Add timeout recovery tests');await teacher.page.getByLabel('Instructions',{exact:true}).fill('Write a test for a timeout followed by a retried payment request.');await teacher.page.getByLabel('Due date').fill('2026-12-01');await teacher.page.getByRole('button',{name:'Save assignment'}).click();await expect(teacher.page.getByRole('status')).toContainText('Assignment saved');
  await page.reload();await expect(page.getByText('The duplicate-request tests support',{exact:false})).toBeVisible();await page.goto('/app/today');await expect(page.getByText('Add timeout recovery tests',{exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Complete assignment Add timeout recovery tests'}).first().click();await expect(page.getByRole('button',{name:'Reopen assignment Add timeout recovery tests'}).first()).toBeVisible();
  await page.goto('/app/preparation');await page.getByRole('button',{name:'Start diagnostic'}).click();await expect(page.locator('.question')).toHaveCount(6);await page.locator('.question').first().getByLabel('2/5',{exact:true}).check();await page.getByRole('button',{name:'Submit diagnostic'}).click();await expect(page.getByRole('heading',{name:'1 of 6 correct'})).toBeVisible();await expect(page.getByText('The increase is ₹120.',{exact:false})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'1 of 6 correct'})).toBeVisible();
  const detail=await (await page.request.get(`/api/roadmaps/${id}`)).json();expect(detail.roadmap.marks['first-skill']).toBe('known');expect(detail.evidence[0].status).toBe('approved');await teacher.context.close();
});

test('API denies ownership, tenant and role bypass, stale writes and missing AI',async({browser,request})=>{
  const learner=await account(browser,'learner'),other=await account(browser,'learner-two'),teacher=await account(browser,'other-teacher'),admin=await account(browser,'admin');
  const create=await post(learner.request,'roadmaps',{mode:'manual',intake:{goal:'Cloud security engineer',hoursPerWeek:6,targetMonths:6,budget:'free'},firstTitle:'Linux security foundations',firstHours:18});expect(create.status()).toBe(201);
  const map=(await create.json()).roadmap,id=map.id;
  expect((await other.request.get(`/api/roadmaps/${id}`)).status()).toBe(404);
  expect((await post(other.request,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'})).status()).toBe(404);
  expect((await learner.request.get('/api/admin')).status()).toBe(403);
  expect((await admin.request.get(`/api/roadmaps/${id}`)).status()).toBe(404);
  expect((await post(teacher.request,'organization/assign',{learnerId:'dev-learner',title:'Unauthorized assignment',instructions:'This must not be saved across organizations.',dueDate:'2026-12-01'})).status()).toBe(404);
  expect((await request.get(`/api/roadmaps/${id}`)).status()).toBe(401);
  expect((await learner.request.post(`/api/roadmaps/${id}/mark`,{data:{version:1,milestoneId:'first-skill',mark:'known'},headers:{Origin:'https://hostile.example'}})).status()).toBe(403);
  const results=await Promise.all([post(learner.request,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'}),post(learner.request,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'complete'})]);expect(results.map(r=>r.status()).sort()).toEqual([200,409]);
  const before=await (await learner.request.get(`/api/roadmaps/${id}`)).json();expect(before.roadmap.version).toBe(2);
  expect((await post(learner.request,`roadmaps/${id}/advice`,{milestoneId:'first-skill'})).status()).toBe(503);
  expect((await post(learner.request,'roadmaps',{mode:'ai',intake:map.intake})).status()).toBe(503);
  expect((await post(learner.request,'roadmaps',{mode:'manual',intake:{...map.intake,hoursPerWeek:0},firstTitle:'Invalid',firstHours:8})).status()).toBe(400);
  const after=await (await learner.request.get(`/api/roadmaps/${id}`)).json();expect(after.roadmap.version).toBe(before.roadmap.version);
  const flags=await admin.request.get('/api/admin');expect(flags.status()).toBe(200);const adminBody=await flags.json();expect(JSON.stringify(adminBody)).not.toContain('Linux security foundations');
  await post(admin.request,'admin/flag',{key:'solo_practice',enabled:false});expect((await post(learner.request,'practice/start',{})).status()).toBe(503);await post(admin.request,'admin/flag',{key:'solo_practice',enabled:true});
  await Promise.all([learner.context.close(),other.context.close(),teacher.context.close(),admin.context.close()]);
});

test('phone layout, keyboard navigation and graph list remain usable',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await login(page,'learner');await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('link',{name:'My roadmaps',exact:true}).click();await page.locator('.roadmap-row').first().click();await page.getByRole('button',{name:'Milestone list'}).click();await expect(page.locator('.milestone-list')).toBeVisible();
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  await page.locator('.milestone-list button').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.milestone-panel h2')).toBeVisible();await page.screenshot({path:'test-results/mobile-roadmap.png',fullPage:true});await context.close();
});
