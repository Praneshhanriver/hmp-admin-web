# unpack.py <bundle.html> <out dir>
# Writes the bundle template (template.html) and every asset (decompressed, named by uuid) into out dir.
import json,re,base64,gzip,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
def block(t):
    m=re.search(r'<script type="__bundler/%s">(.*?)</script>'%t,s,re.S); return m.group(1) if m else None
man=json.loads(block('manifest')); tpl=json.loads(block('template'))
po=block('page_order'); ext=block('ext_resources')
print('page_order',po[:200] if po else None); print('ext',ext[:500] if ext else None)
open(os.path.join(out,'template.html'),'w',encoding='utf-8').write(tpl)
for u,e in man.items():
    b=base64.b64decode(e['data'])
    if e.get('compressed'): b=gzip.decompress(b)
    ext_='.bin'
    if 'javascript' in e['mime'] or 'jsx' in e['mime']: ext_='.js'
    elif 'css' in e['mime']: ext_='.css'
    elif 'html' in e['mime']: ext_='.html'
    elif 'font' in e['mime']: ext_='.font'
    open(os.path.join(out,u+ext_),'wb').write(b)
    print(u,e['mime'],e.get('compressed'),len(b))
