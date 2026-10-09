# apply-review-fixes.py <bundle.html> <unpacked dir>
# Applies Bhagyashree's HW2 design-review fixes to an unpacked Claude Design bundle (Hi-Fi or wireframe).
# Every edit asserts how many times it matched, so a missed edit fails loudly.
# Already applied: public/design/*.html hold the result. To redo it, start from the pre-review bundle
# (git show b5c2822:public/design/hifi.html), unpack, run this, repack, then export the frames.
import json, re, sys, os, glob

bundle, d = sys.argv[1:3]
s = open(bundle, encoding='utf-8').read()
ext = json.loads(re.search(r'<script type="__bundler/ext_resources">(.*?)</script>', s, re.S).group(1))
by_name = {}
for e in ext:
    by_name[e['id'].split('/')[-1]] = glob.glob(os.path.join(d, e['uuid'] + '.*'))[0]
TPL = os.path.join(d, 'template.html')
F = {
    'tpl': TPL,
    'icons': by_name['icons.css'],
    'colors': by_name['colors_and_type.css'],
    'tokens': by_name['invitation-tokens.css'],
    'table': by_name['InvitationTable.dc.html'],
    'card': by_name['InvitationCard.dc.html'],
    'sidebar': by_name['AdminSidebar.dc.html'],
    'pagination': by_name['Pagination.dc.html'],
    'form': by_name['InvitationForm.dc.html'],
    'dialog': by_name['ConfirmationDialog.dc.html'],
    'detail': by_name['InvitationDetail.dc.html'],
    'history': by_name['InvitationHistory.dc.html'],
}
text = {k: open(v, encoding='utf-8').read() for k, v in F.items()}


def rep(keys, old, new, count=None):
    """Replace old -> new in each file of keys; count = expected matches per file (None = at least 1)."""
    for k in keys.split():
        n = text[k].count(old)
        if (count is None and n == 0) or (count is not None and n != count):
            raise SystemExit(f'[{k}] expected {count} match(es), found {n}: {old[:90]!r}')
        text[k] = text[k].replace(old, new)


def sub(keys, pattern, repl, min_count=1):
    for k in keys.split():
        text[k], n = re.subn(pattern, repl, text[k])
        if n < min_count:
            raise SystemExit(f'[{k}] pattern matched {n} times: {pattern!r}')


# 1. Icons take their label's colour (white on filled buttons, red next to red text).
rep('icons', '  color: var(--fg-2, #334155);/* contextual — overridden by parent .text-* */',
    '  color: inherit;            /* takes the colour of its label: white on filled buttons, red on Revoke */', 1)
rep('tpl', '  color: var(--fg-2, #334155);/* contextual — overridden by parent .text-* */',
    '  color: inherit;            /* takes the colour of its label: white on filled buttons, red on Revoke */', 2)

# 7. One red, no purple. --error becomes the red every frame uses (danger text, Revoke, error states).
purple = re.compile(r'\n  /\* =+\n     SECONDARY — Purple.*?--secondary-focus-ring: #DDD8FB; /\* 3px ring used on secondary focus \*/\n', re.S)
for k in ('colors', 'tpl'):
    text[k], n = purple.subn('\n', text[k])
    if n != (1 if k == 'colors' else 2):
        raise SystemExit(f'[{k}] purple block matched {n}')
rep('colors', '  --secondary-on-dark: var(--purple-400); /* v1.6 — secondary as fg on dark (AA ~5.8:1) */\n', '', 1)
rep('tpl', '  --secondary-on-dark: var(--purple-400); /* v1.6 — secondary as fg on dark (AA ~5.8:1) */\n', '', 2)
rep('colors', '  --error:   #EF4444;', '  --error:   #942626; /* the only red: danger text, Revoke, error states (AA on white) */', 1)
rep('tpl', '  --error:   #EF4444;', '  --error:   #942626; /* the only red: danger text, Revoke, error states (AA on white) */', 2)
rep('icons tpl', '.icon-error    { color: var(--error,   #EF4444); }', '.icon-error    { color: var(--error); }')

# Tokens: danger set from the one red; 3 control heights; one disabled look; sidebar width; table columns.
TOK = 'tokens tpl'
rep(TOK, '  --color-danger: color-mix(in oklch, var(--error), black 30%);', '  --color-danger: var(--error);', 1)
rep(TOK, '  --color-danger-soft: color-mix(in oklch, var(--error) 9%, #FFFFFF);', '  --color-danger-soft: #FFF0EE;   /* tint of --error */', 1)
rep(TOK, '  --color-danger-border: color-mix(in oklch, var(--error) 55%, #FFFFFF);', '  --color-danger-border: #FFA098; /* tint of --error */', 1)
rep(TOK, '  --control-h-sm: 36px;\n  --control-h-md: 40px;\n  --control-h-lg: 48px;\n  --control-h-touch: 44px;\n  --input-h: 44px;',
    '  /* three button heights only: sm 36 (table rows, pagination) · md 44 (default, inputs, every phone action) · lg 48 (form submit, dialogs) */\n'
    '  --control-h-sm: 36px;\n  --control-h-md: 44px;\n  --control-h-lg: 48px;\n'
    '  --control-h-touch: var(--control-h-md); /* alias: phone targets use md */\n  --input-h: var(--control-h-md);\n'
    '  --opacity-disabled: 0.6; /* the one disabled / busy look for every control */', 1)
rep(TOK, '  --layout-sidebar-w-md: 200px;', '  --layout-sidebar-w-md: 216px; /* labels stay on one line at 1024 */', 1)
rep(TOK, '  --table-min-w: 720px;', '  --table-min-w: 1000px;        /* full columns; 768 scrolls inside the card */\n  --table-min-w-compact: 720px; /* 1024 fits without scrolling */', 1)
sub(TOK, r'  --table-cols-compact: [^;]+;',
    '  --table-cols-compact: minmax(104px, 1.2fr) minmax(112px, 1fr) minmax(96px, 0.8fr) minmax(84px, 0.6fr) minmax(98px, 0.8fr) minmax(110px, 0.8fr) minmax(130px, 1.2fr);')
sub(TOK, r'  --table-cols: [^;]+;',
    '  --table-cols: minmax(150px, 1.2fr) minmax(128px, 1fr) minmax(108px, 0.8fr) minmax(88px, 0.6fr) minmax(116px, 0.8fr) minmax(112px, 0.8fr) minmax(296px, 2.2fr);')

# 3. Dates YYYY-MM-DD everywhere (as the build and the Edit / Detail frames).
sub('table card tpl', r"'(\d\d)/(\d\d)/(\d\d)'", r"'20\1-\2-\3'")

# 4. Sidebar labels never wrap (so icons and labels stay on one line at 1024).
rep('sidebar', 'style="height:100%; box-sizing:border-box; display:flex;', 'style="height:100%; box-sizing:border-box; white-space:nowrap; display:flex;', 1)

# 10. One disabled treatment: opacity, for busy buttons and Previous alike.
rep('form dialog', 'busyOpacity: busy ? 0.7 : 1,', "busyOpacity: busy ? 'var(--opacity-disabled)' : 1,", 1)
rep('pagination', 'background:var(--color-surface); color:var(--color-placeholder); font-size:var(--font-size-body); font-weight:var(--font-weight-medium); cursor:not-allowed"',
    'background:var(--color-surface); color:var(--color-text); opacity:var(--opacity-disabled); font-size:var(--font-size-body); font-weight:var(--font-weight-medium); cursor:not-allowed"', 1)
rep('pagination', 'background:var(--color-surface); color:var(--color-placeholder); font-size:var(--font-size-body); font-weight:var(--font-weight-semibold)"',
    'background:var(--color-surface); color:var(--color-text); opacity:var(--opacity-disabled); font-size:var(--font-size-body); font-weight:var(--font-weight-semibold)"', 1)

rep('dialog', '<button type="button" autoFocus="{{ true }}" style="flex:{{ btnFlex }}; height:var(--control-h-lg);',
    '<button type="button" autoFocus="{{ true }}" disabled="{{ busy }}" style="flex:{{ btnFlex }}; opacity:{{ busyOpacity }}; height:var(--control-h-lg);', 1)

# Long names wrap inside the card title and the detail (built, now drawn in 3k).
rep('card', '<h3 style="margin:0; font-size:var(--font-size-body-lg);', '<h3 style="margin:0; min-width:0; overflow-wrap:anywhere; font-size:var(--font-size-body-lg);', 1)
rep('detail', 'font-weight:var(--font-weight-semibold)">Dr. Jung Min-seok</dd>', 'font-weight:var(--font-weight-semibold); overflow-wrap:anywhere">{{ doctorName }}</dd>', 1)

# 14. Detail "not found" state (built, now drawn in 2p).
NOT_FOUND = '''  <sc-if value="{{ isNotFound }}" hint-placeholder-val="{{ false }}">
    <section data-component="EmptyState" role="status" style="display:flex; flex-direction:column; align-items:center; gap:var(--space-ms); padding:var(--space-2xl) var(--space-lg); text-align:center; background:var(--color-surface); border:var(--border-w) solid var(--color-border); border-radius:var(--radius-lg)">
      <span style="width:calc(var(--icon-lg) * 2); height:calc(var(--icon-lg) * 2); display:flex; align-items:center; justify-content:center; border-radius:var(--radius-pill); background:var(--color-surface-alt); color:var(--color-muted)"><i class="ph ph-magnifying-glass" aria-hidden="true" style="font-size:var(--icon-lg)"></i></span>
      <span style="font-size:var(--font-size-h4); font-weight:var(--font-weight-semibold)">Invitation not found</span>
      <span style="font-size:var(--font-size-body-lg); color:var(--color-muted); line-height:var(--line-height-body); text-wrap:pretty">This invitation does not exist. It may have been entered incorrectly.</span>
      <a href="#" style="height:var(--control-h-md); box-sizing:border-box; display:inline-flex; align-items:center; gap:var(--space-sm); padding:0 var(--space-md); border:var(--border-w) solid var(--color-border-strong); border-radius:var(--radius-md); background:var(--color-surface); color:var(--color-text); text-decoration:none; font-size:var(--font-size-body); font-weight:var(--font-weight-semibold)" style-hover="background:var(--color-surface-alt); color:var(--color-text)"><i class="ph ph-arrow-left" aria-hidden="true"></i>Back to the list</a>
    </section>
  </sc-if>
  <div style="display:flex">
    <a href="#" style="flex:{{ backFlex }};'''
rep('detail', '  <div style="display:flex">\n    <a href="#" style="flex:{{ backFlex }};', NOT_FOUND, 1)
rep('detail', "isFilled: st === 'filled', isLoading: st === 'loading', isError: st === 'error',",
    "isFilled: st === 'filled', isLoading: st === 'loading', isError: st === 'error', isNotFound: st === 'notfound',\n"
    "      doctorName: this.props.doctorName || 'Dr. Jung Min-seok',", 1)
rep('detail', '&quot;options&quot;:[&quot;filled&quot;,&quot;loading&quot;,&quot;error&quot;]',
    '&quot;options&quot;:[&quot;filled&quot;,&quot;loading&quot;,&quot;error&quot;,&quot;notfound&quot;]', 1)
rep('detail', "&quot;'filled'|'loading'|'error'&quot;", "&quot;'filled'|'loading'|'error'|'notfound'&quot;", 1)

# History times in the WM format, AM/PM after the number (as built: 2026-09-08 08:33 PM).
rep('history', '2026-08-26 10:12', '2026-08-26 10:12 AM', 1)
rep('history', '2026-09-02 14:40', '2026-09-02 02:40 PM', 1)
rep('history', '2026-09-09 09:05', '2026-09-09 09:05 AM', 1)

# ---------- board (template) ----------
# 5. 1920 frame exports at 1920 (not stretched to the 4200 board); content centred in main as built.
rep('tpl', '<div id="3a" style="display:flex; flex-direction:column; gap:var(--space-ms)">',
    '<div id="3a" style="align-self:flex-start; display:flex; flex-direction:column; gap:var(--space-ms)">', 1)
# 4. 1024: compact columns fit without scrolling; headers no longer touch.
rep('tpl', '--table-cell-px:var(--space-ms); --table-cell-py:var(--space-ms); --page-pad:var(--space-lg); --table-cols:var(--table-cols-compact)">',
    '--table-cell-px:var(--space-sm); --table-cell-py:var(--space-ms); --page-pad:var(--space-lg); --table-cols:var(--table-cols-compact); --table-min-w:var(--table-min-w-compact)">', 1)
rep('tpl', 'Narrow sidebar, compact table density</span>', 'Narrow sidebar (216px, labels on one line), compact table that fits without scrolling</span>', 1)
# 6. Toast: bottom-right on desktop (2d–2f, 2l), bottom full width on phones (3j) — as built.
rep('tpl', '<div style="position:absolute; top:var(--space-md); right:var(--space-xl); width:var(--toast-w)">',
    '<div style="position:absolute; right:var(--space-lg); bottom:var(--space-lg); width:var(--toast-w)">', 3)
old_2l = re.search(r'(      <div style="width:624px; box-sizing:border-box; display:flex; flex-direction:column; gap:var\(--space-md\); padding:var\(--page-pad\);)([^>]*>)\n'
                   r'(        <dc-import name="Toast"[^\n]*</dc-import>)\n'
                   r'(        <dc-import name="InvitationCard"[^\n]*</dc-import>)\n', text['tpl'])
if not old_2l:
    raise SystemExit('2l block not found')
new_2l = ('      <div style="position:relative; width:624px; min-height:560px; box-sizing:border-box; display:flex; flex-direction:column; gap:var(--space-md); padding:var(--page-pad);'
          + old_2l.group(2) + '\n' + old_2l.group(4) + '\n'
          + '        <div style="position:absolute; right:var(--space-lg); bottom:var(--space-lg); width:var(--toast-w)">' + old_2l.group(3).strip() + '</div>\n')
text['tpl'] = text['tpl'].replace(old_2l.group(0), new_2l)
rep('tpl', 'color:var(--color-muted)">toast on the list</span>', 'color:var(--color-muted)">toast bottom-right, as on every desktop screen</span>', 1)
# 11. Manage actions stay on one line at 1440 (as built); they wrap only in the narrow 1024 column.
rep('tpl', '⑥ Actions by status (see rules table). Manage column wraps to two lines when a row has two buttons.',
    '⑥ Actions by status (see rules table). At 1440 all actions sit on one line; they stack only in the narrow 1024 column.', 1)

# Size table on the board (section 4).
rep('tpl', "{ name: '--control-h-md', value: '40px', use: 'Header buttons, Issue invitation' },",
    "{ name: '--control-h-md', value: '44px', use: 'Default: Issue invitation, Search, Retry, header, inputs, every phone action' },", 1)
rep('tpl', "{ name: '--control-h-touch', value: '44px', use: 'All mobile actions' },",
    "{ name: '--opacity-disabled', value: '0.6', use: 'The one disabled / busy look (Save, Previous, dialog buttons)' },", 1)
rep('tpl', "{ name: '--input-h', value: '44px', use: 'Text inputs, select, Search' },",
    "{ name: '--input-h', value: '= md (44px)', use: 'Text inputs, select; same height as Search' },", 1)
rep('tpl', "{ name: '--table-cols / -compact', value: 'min 856 / 748px', use: 'Compact at 1024 fits without scrolling; 768 scrolls in its card' },",
    "{ name: '--table-cols / -compact', value: 'min 998 / 734px', use: 'Compact at 1024 fits without scrolling; 768 scrolls in its card' },", 1)
rep('tpl', "{ name: '--table-cell-px / py', value: '16 / 14px', use: 'Compact ≤1024: 12 / 12px' },",
    "{ name: '--table-cell-px / py', value: '16 / 14px', use: '1024: 8 / 12px · 768: 12 / 12px' },", 1)
rep('tpl', "use: '≥1440; 200px at 1024; hidden ≤768' }", "use: '≥1440; 216px at 1024; hidden ≤768' }", 1)
rep('tpl', '≥ 44 px mobile (--control-h-touch).', '≥ 44 px mobile (--control-h-md).', 1)

# New frames: 2p (detail not found) and 3k (long doctor name at 375).
LABEL = ('<div style="display:flex; align-items:center; gap:var(--space-sm)"><span style="font-family:var(--font-mono); font-size:var(--font-size-body); '
         'font-weight:var(--font-weight-bold); padding:var(--space-xs) var(--space-sm); border-radius:var(--radius-sm); background:var(--color-primary); '
         'color:var(--color-on-primary)">{id}</span><span style="font-size:var(--font-size-h4); font-weight:var(--font-weight-semibold)">{title}</span>'
         '<span style="font-size:var(--font-size-body); color:var(--color-muted)">{note}</span></div>')
FRAME_2P = f'''    <div id="2p" style="display:flex; flex-direction:column; gap:var(--space-ms)">
      {LABEL.format(id='2p', title='Detail — not found', note='wrong or deleted id · Edit shows the same')}
      <div style="width:944px; box-sizing:border-box; padding:var(--page-pad); background:var(--color-canvas); border:var(--border-w) solid var(--color-border-strong); border-radius:var(--radius-md)"><dc-import name="InvitationDetail" style="width:100%" state="notfound" uid="d2p" hint-size="100%,420px"></dc-import></div>
    </div>
'''
rep('tpl', '  </div>\n</section>\n\n<section aria-labelledby="sec-3"', FRAME_2P + '  </div>\n</section>\n\n<section aria-labelledby="sec-3"', 1)
LONG = 'Dr. Seo-yeon Park-Jung Ha-eun Kim-Lee Min-ji'
FRAME_3K = f'''
    <div id="3k" style="display:flex; flex-direction:column; gap:var(--space-ms)">
      {LABEL.format(id='3k', title='375 — long name', note='wraps in card and detail')}
      <div style="width:var(--bp-xs); display:flex; flex-direction:column; background:var(--color-canvas); border:var(--border-w) solid var(--color-border-strong); border-radius:var(--radius-lg); overflow:hidden; --form-pad:var(--space-md); --detail-cols:2">
        <dc-import name="AdminHeader" style="width:100%" variant="mobile" hint-size="100%,64px"></dc-import>
        <main style="padding:var(--space-md); display:flex; flex-direction:column; gap:var(--space-md)">
          <dc-import name="InvitationCard" style="width:100%" item="{{{{ longNameCard }}}}" hint-size="100%,280px"></dc-import>
          <dc-import name="InvitationDetail" style="width:100%" compact="{{{{ true }}}}" uid="d3k" doctor-name="{LONG}" hint-size="100%,820px"></dc-import>
        </main>
      </div>
    </div>
'''
rep('tpl', '  </div>\n</section>\n\n<section aria-labelledby="sec-4"', FRAME_3K + '  </div>\n</section>\n\n<section aria-labelledby="sec-4"', 1)
rep('tpl', "      skeletonCards: [{ k: 1 }, { k: 2 }],",
    "      skeletonCards: [{ k: 1 }, { k: 2 }],\n"
    f"      longNameCard: {{ id: 'inv-1010', name: '{LONG}', contact: '010-****-1357', issued: '2026-09-09', reissues: 2, expiry: '2026-09-23', status: 'pending' }},", 1)

for k, v in F.items():
    open(v, 'w', encoding='utf-8', newline='').write(text[k])
print('applied fixes to', d)
