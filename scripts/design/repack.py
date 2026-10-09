# repack.py <original bundle> <unpacked dir> <out bundle> [fidelity]
# Replaces the template and every non-font asset with the (edited) files in the unpacked dir.
import json, re, base64, gzip, sys, os, glob

src, d, out = sys.argv[1:4]
fid = sys.argv[4] if len(sys.argv) > 4 else None
s = open(src, encoding='utf-8').read()


def span(t):
    m = re.search(r'(<script type="__bundler/%s">)(.*?)(</script>)' % t, s, re.S)
    return m.start(2), m.end(2), m.group(2)


a, b, man_txt = span('manifest')
man = json.loads(man_txt)
for u, e in man.items():
    if 'font' in e['mime']:
        continue
    f = glob.glob(os.path.join(d, u + '.*'))[0]
    data = open(f, 'rb').read()
    if e.get('compressed'):
        data = gzip.compress(data, mtime=0)
    e['data'] = base64.b64encode(data).decode()
s = s[:a] + '\n' + json.dumps(man, separators=(',', ':')) + '\n  ' + s[b:]

a, b, _ = span('template')
tpl = open(os.path.join(d, 'template.html'), encoding='utf-8').read()
if fid:
    tpl = tpl.replace('<div data-fidelity="hifi" style="width:', '<div data-fidelity="%s" style="width:' % fid, 1)
enc = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
s = s[:a] + '\n' + enc + '\n  ' + s[b:]
open(out, 'w', encoding='utf-8', newline='\n').write(s)
print('wrote', out, len(s))
