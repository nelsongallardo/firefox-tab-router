// Render real extension settings in a disposable Firefox profile with demo data.
// Screenshot permissions and the local reporting endpoint exist only in the temporary copy.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, cp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const directory = await mkdtemp(join(tmpdir(), 'tab-router-listing-'));
const server = createServer();
let child, timer;
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/result`;
  const result = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(Error('Screenshot timed out')), 60000);
    server.on('request', (req, res) => {
      if (req.method !== 'POST' || req.url !== '/result') { res.writeHead(404).end(); return; }
      let body = ''; req.on('data', data => body += data);
      req.on('end', () => { try { res.end('ok'); resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    });
  });
  await cp('extension', directory, {recursive:true});
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  manifest.host_permissions = ['<all_urls>'];
  manifest.background.scripts = ['capture.js'];
  manifest.content_security_policy.extension_pages = manifest.content_security_policy.extension_pages.replace("connect-src 'none'", 'connect-src http://127.0.0.1:*');
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest));
  await writeFile(join(directory, 'capture.js'), `
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
 await browser.storage.local.set({settings:{enabled:true,rules:[
  {prefix:'https://github.com/example/project',group:'work',color:'green'},
  {prefix:'https://university.example/course',group:'masters',color:'blue'}
 ]}});
 const tab = await browser.tabs.create({url:browser.runtime.getURL('options.html'),active:true});
 await browser.windows.update(tab.windowId,{width:1280,height:1200});
 let view;
 for (let i=0;i<100;i++) {
  view = browser.extension.getViews({type:'tab'}).find(v=>v.location.href===browser.runtime.getURL('options.html'));
  if(view?.document.querySelectorAll('.route').length===2) break;
  await sleep(50);
 }
 if(!view) throw Error('Settings view not ready');
 await sleep(300);
 const routes = await browser.tabs.captureTab(tab.id,{format:'png'});
 const canvas=view.document.createElement('canvas'); canvas.width=128; canvas.height=128;
 canvas.getContext('2d').drawImage(view.document.querySelector('.wordmark img'),0,0,128,128);
 const icon=canvas.toDataURL('image/png');
 const input=view.document.querySelector('#test-url');
 input.value='https://github.com/example/project/pull/42';
 input.dispatchEvent(new view.Event('input',{bubbles:true}));
 view.document.querySelector('.tester').scrollIntoView({block:'center'});
 await sleep(300);
 const preview = await browser.tabs.captureTab(tab.id,{format:'png'});
 await fetch(${JSON.stringify(endpoint)},{method:'POST',body:JSON.stringify({routes,preview,icon})});
} catch(e) { await fetch(${JSON.stringify(endpoint)},{method:'POST',body:JSON.stringify({error:String(e)})}); }
`);
  const args = ['node_modules/web-ext/bin/web-ext.js','run','--source-dir',directory,'--no-reload','--args=-headless'];
  if(process.env.FIREFOX_BINARY) args.push('--firefox',process.env.FIREFOX_BINARY);
  child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});
  const report=await result;
  if(report.error) throw Error(report.error);
  await mkdir('docs/listing',{recursive:true});
  for(const name of ['routes','preview','icon']) await writeFile(`docs/listing/${name}.png`,Buffer.from(report[name].split(',')[1],'base64'));
  console.log('Saved docs/listing/routes.png, preview.png, and icon.png');
} finally {
  clearTimeout(timer);
  if(child){const done=new Promise(r=>child.once('exit',r));child.kill('SIGINT');await done;}
  server.close();await rm(directory,{recursive:true,force:true});
}
