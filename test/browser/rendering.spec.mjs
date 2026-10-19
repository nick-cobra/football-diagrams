import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  page.on('console', message=> {if(message.type()==='error'||message.type()==='warning') errors.push(message.text());});
  await page.goto('/');
  // Exercise hydration before asserting the server-rendered DOM.
  await page.getByRole('region',{name:'Root a'}).getByRole('button',{name:'Last frame',exact:true}).click();
  await page.getByRole('region',{name:'Root a'}).getByRole('button',{name:'First frame',exact:true}).click();
  page.__diagramErrors=errors;
});
test.afterEach(async ({page})=>expect(page.__diagramErrors).toEqual([]));

async function expectMarkers(page) {
  const problems=await page.locator('svg').evaluateAll(svgs=>{
    const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);
    const errors=ids.filter((id,i)=>ids.indexOf(id)!==i).map(id=>`duplicate ${id}`);
    for(const svg of svgs) for(const path of svg.querySelectorAll('[marker-end]')) {
      const id=path.getAttribute('marker-end').slice(5,-1);
      if(![...svg.querySelectorAll('marker')].some(marker=>marker.id===id)) errors.push(`unresolved ${id}`);
    }
    return errors;
  });
  expect(problems).toEqual([]);
}

test('hydrates separate StrictMode roots and retains independent markers through updates/remounts', async ({page})=>{
  const a=page.getByRole('region',{name:'Root a'});
  await expect(page.getByRole('img')).toHaveCount(2);
  await expect(a.getByRole('img')).toHaveAccessibleName('Equipment and movement — Setup');
  await expect(a.getByRole('img')).toHaveClass('host-diagram');
  await expect(a.locator('[data-object-kind]')).toHaveCount(13);
  await expect(a.locator('[data-arrow-kind]')).toHaveCount(4);
  await expectMarkers(page);
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('1');
  await expect(a.getByRole('img')).toHaveAttribute('data-frame-id','setup');
  await a.getByRole('button',{name:'Last frame',exact:true}).click();
  await expect(a.getByRole('img')).toHaveAttribute('data-frame-id','move');
  await a.getByLabel('Thumbnail',{exact:true}).check();
  await expect(a.locator('[data-label-kind="area"], [data-label-kind="number"], [data-label-kind="sequence"]')).toHaveCount(0);
  await expectMarkers(page);
  for(let i=0;i<3;i++) {
    await a.getByRole('button',{name:'Unmount',exact:true}).click();
    await expect(a.getByRole('img')).toHaveCount(0);
    await a.getByRole('button',{name:'Mount',exact:true}).click();
    await expect(a.getByRole('img')).toHaveCount(1);
    await expectMarkers(page);
  }
  await a.getByRole('button',{name:'Invalid frame',exact:true}).click();
  await expect(a.getByRole('img')).toHaveCount(0);
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('4');
  await expect(a.getByRole('img')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Root b'}).getByRole('img')).toHaveCount(1);
});

test('host CSS contains square thumbnails, natural aspect and explicit inline size work',async({page})=>{
  const a=page.getByRole('region',{name:'Root a'});
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('2');
  const img=a.getByRole('img');
  let box=await img.boundingBox();
  expect(Math.abs(box.width-box.height)).toBeLessThan(1);
  await a.getByLabel('Thumbnail',{exact:true}).check();
  box=await img.boundingBox();
  expect(box.height).toBe(168);expect(box.width).toBe(355);
  const next=await a.getByTestId('following').boundingBox();
  expect(next.y).toBeGreaterThanOrEqual(box.y+box.height);
  await a.getByLabel('Inline size',{exact:true}).check();
  box=await img.boundingBox();expect(box.width).toBe(200);expect(box.height).toBe(100);
});

test('short object labels survive full and thumbnail presentation',async({page})=>{
  const a=page.getByRole('region',{name:'Root a'});
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('5');
  await expect(a.locator('[data-label-kind="object"] text')).toHaveText(['A','GK','😀','GK','GK']);
  await expect(a.locator('[data-label-kind="number"] text')).toHaveText(['C','7','P']);
  await a.getByLabel('Thumbnail',{exact:true}).check();
  await expect(a.locator('[data-label-kind="object"] text')).toHaveText(['A','GK','😀','GK','7','GK']);
  await expect(a.locator('[data-label-kind="number"]')).toHaveCount(0);
});

test('unrestricted zone IDs do not leave stale labels or rectangles after updates',async({page})=>{
  const a=page.getByRole('region',{name:'Root a'});
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('6');
  const labels=a.locator('[data-testid="drill-diagram-v2-labels"] text');
  const zones=a.locator('rect[stroke-dasharray]');
  const zoneTexts=Array.from({length:7},(_,i)=>`Zone ${i+1}`);
  for(let repeat=0;repeat<3;repeat++){
    await a.getByRole('button',{name:'First frame',exact:true}).click();
    await a.getByLabel('Thumbnail',{exact:true}).uncheck();
    await expect(labels).toHaveText(['Pitch',...zoneTexts,'9','1']);
    await expect(zones).toHaveCount(7);
    await a.getByLabel('Thumbnail',{exact:true}).check();
    await expect(labels).toHaveText(zoneTexts);
    await a.getByRole('button',{name:'Last frame',exact:true}).click();
    await expect(labels).toHaveCount(0);
    await expect(zones).toHaveCount(0);
    await a.getByLabel('Thumbnail',{exact:true}).uncheck();
    await expect(labels).toHaveText(['Pitch','9']);
  }
});

test('repeated terminal vertices preserve actual SVG arrow pixels',async({page},testInfo)=>{
  const a=page.getByRole('region',{name:'Root a'});
  await a.getByRole('combobox',{name:'Document',exact:true}).selectOption('7');
  const before=await a.getByRole('img').screenshot({animations:'disabled'});
  await a.getByRole('button',{name:'Last frame',exact:true}).click();
  const after=await a.getByRole('img').screenshot({animations:'disabled'});
  await testInfo.attach('original arrows',{body:before,contentType:'image/png'});
  await testInfo.attach('repeated arrows',{body:after,contentType:'image/png'});
  expect(after.equals(before),'Repeated vertices must preserve actual SVG pixels').toBe(true);
});

for(const [name,document,width] of [['all-kinds',0,960],['square',2,960],['off-pitch',3,960],['narrow',0,360],['wide-labels',8,960]]) {
  test(`reviewed rendering: ${name}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const a=page.getByRole('region',{name:'Root a'});
    await a.getByRole('combobox',{name:'Document',exact:true}).selectOption(String(document));
    await expect(a.getByRole('img')).toHaveScreenshot(`${name}.png`,{animations:'disabled',maxDiffPixels:0});
  });
}


test('unchanged arrow geometry is reused while all relevant inputs still invalidate',async({page})=>{
  const report=await page.evaluate(()=>window.runDiagramCacheProbe());
  expect(report.initialReads).toBeGreaterThan(0);
  expect(report.checks.filter(check=>!check.pass)).toEqual([]);
  expect(report.parentReads).toBe(0);
});

test('letterboxed and resized SVGs retain the full wave pixels',async({page})=>{
  const report=await page.evaluate(()=>window.runDiagramViewportProbe());
  expect(report).toHaveLength(4);
  expect(report.map(result=>result.changedChannels)).toEqual([0,0,0,0]);
  expect(report[3].width).toBe(900);
});

test('actual glyphs fit badges and every pill kind through font loading and resizing',async({page})=>{
  const report=await page.evaluate(()=>window.runDiagramLabelProbe());
  expect(report.reports).toHaveLength(5);
  expect(report.fontStatus).toBe('loaded');
  for(const result of report.reports) {
    expect(result.rows.length).toBe(14);
    if(result.name==='Arial') expect(result.rows.filter(row=>!row.ordinarySizePreserved)).toEqual([]);
    expect(result.rows.filter(row=>!row.withinBackground),result.name).toEqual([]);
    expect(new Set(result.rows.map(row=>row.kind))).toEqual(new Set(['area','sub_area','number','sequence','object','arrow']));
  }
  expect(report.parentReads).toBe(0);
});

test('authored equipment preserves mouth axes, complete nets and gate endpoints in both versions',async({page})=>{
  expect(await page.evaluate(()=>window.runDiagramEquipmentProbe())).toEqual([]);
});

test('isolated maximum-length pills stay inside the viewport through fonts and resizing',async({page})=>{
  const {reports,hydrationErrors}=await page.evaluate(()=>window.runDiagramPillViewportProbe());
  expect(hydrationErrors).toEqual([]);
  expect(reports).toHaveLength(49);
  expect(reports.filter(row=>!row.textRetained||!row.textInside||!row.backgroundInside)).toEqual([]);
});

test('explicit margin frames all four off-pitch actors under natural and letterboxed constraints',async({page})=>{
  const reports=await page.evaluate(()=>window.runDiagramMarginProbe());
  expect(reports).toHaveLength(30);
  expect(reports.filter(row=>row.restored===false||row.inside===false||row.actorPaints===false)).toEqual([]);
  expect(reports.filter(row=>row.viewBox&&row.viewBox!=='-16 -16 72 62')).toEqual([]);
});
