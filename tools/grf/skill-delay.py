#!/usr/bin/env python3
"""從 data.grf 解出的 skillid.lub、skilldelaylist.lub 印出技能每級的 [變動詠唱, 固定詠唱, 技能後延遲, 冷卻]（毫秒），貼進 gear.html 的 DMG_CAST。
用法：python grf.py <data.grf> get 'data\\luafiles514\\lua files\\skillinfoz\\skilldelaylist.lub' <dir>/skilldelaylist.lub（skillid.lub 同理）
      <有 lupa 的 python> -I skill-delay.py <dir> 火箭術:MG_FIREBOLT,崩裂術:WZ_HEAVENDRIVE,…
"""
import json, os, sys
import lupa.lua51 as L
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lub64.py'), encoding='utf-8').read().split('\nopen(sys.argv[2]')[0]
ns = {}; exec(compile(src, 'lub64', 'exec'), ns)
lua = L.LuaRuntime(encoding=None)
for f in ('skillid.lub', 'skilldelaylist.lub'): lua.execute(ns['conv'](open(os.path.join(sys.argv[1], f), 'rb').read()))
g = lua.globals(); SK, D = g.SKID, g.SKILL_DELAY_LIST
KEYS = ('SkillCastStatDelay', 'SkillCastFixedDelay', 'SkillGlobalPostDelay', 'SkillSinglePostDelay')
out = {}
for w in sys.argv[2].split(','):
    nm, code = w.split(':'); e = D[SK[code.encode()]]
    out[nm] = [[int(e[k.encode()][i]) for i in range(1, len(e[k.encode()]) + 1)] if e[k.encode()] is not None else [0] for k in KEYS]
print(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
