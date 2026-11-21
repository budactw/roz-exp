#!/usr/bin/env python3
"""從 data.grf 解出的 skillid.lub、skilldelaylist.lub 印出技能每級的 [變動詠唱, 固定詠唱, 技能後延遲, 冷卻]（毫秒），貼進 gear.html 的 DMG_CAST。
用法：python grf.py <data.grf> get 'data\\luafiles514\\lua files\\skillinfoz\\skilldelaylist.lub' <dir>/skilldelaylist.lub（skillid.lub 同理）
      <有 lupa 的 python> -I skill-delay.py <dir> 火箭術:MG_FIREBOLT,崩裂術:WZ_HEAVENDRIVE,…
      <有 lupa 的 python> -I skill-delay.py <dir> --all <skill-data.js> <輸出 skill-delay.json>   （技能樹說明用：{ 技能編號: [變詠, 固詠, 延遲, 冷卻] }，每項是每級的毫秒，全部相同的縮成一個數字）
"""
import json, os, sys
import lupa.lua51 as L
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lub64.py'), encoding='utf-8').read().split('\nopen(sys.argv[2]')[0]
ns = {}; exec(compile(src, 'lub64', 'exec'), ns)
lua = L.LuaRuntime(encoding=None)
for f in ('skillid.lub', 'skilldelaylist.lub'): lua.execute(ns['conv'](open(os.path.join(sys.argv[1], f), 'rb').read()))
g = lua.globals(); SK, D = g.SKID, g.SKILL_DELAY_LIST
KEYS = ('SkillCastStatDelay', 'SkillCastFixedDelay', 'SkillGlobalPostDelay', 'SkillSinglePostDelay')
if sys.argv[2] == '--all':
    import re
    ids = set(re.findall(r'"(\d+)":\{"n":', open(sys.argv[3], encoding='utf-8').read()))
    out = {}
    for k, e in D.items():
        if str(k) not in ids or e is None: continue
        row = []
        for key in KEYS:
            t = e[key.encode()]
            a = [int(t[i]) for i in range(1, len(t) + 1)] if t is not None else [0]
            row.append(a[0] if len(set(a)) == 1 else a)
        if any(x != 0 for x in row): out[str(k)] = row
    json.dump(out, open(sys.argv[4], 'w'), ensure_ascii=False, separators=(',', ':'))
    print('skills', len(out)); sys.exit()
out = {}
for w in sys.argv[2].split(','):
    nm, code = w.split(':'); e = D[SK[code.encode()]]
    out[nm] = [[int(e[k.encode()][i]) for i in range(1, len(e[k.encode()]) + 1)] if e[k.encode()] is not None else [0] for k in KEYS]
print(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
