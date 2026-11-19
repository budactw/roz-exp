#!/usr/bin/env python3
"""從客戶端 System\\Rune 讀出符文石碑（符文智慧石碑）各組的名稱與效果說明。
用法：<有 lupa 的 python> -I build-runes.py <客戶端 System\\Rune 資料夾> <輸出 rune-sets.json>
接著用 build-runes.js 把說明轉成配裝效果。
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lupa.lua51 as L

def lub64(raw):
    """32 位元 size_t 的 Lua 5.1 bytecode → 64 位元（同 lub64.py）"""
    src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lub64.py'), encoding='utf-8').read().split('\nopen(sys.argv[2]')[0]
    ns = {}; exec(compile(src, 'lub64', 'exec'), ns); return ns['conv'](raw)

def dec(b):
    if not isinstance(b, bytes): return b
    for e in ('utf-8', 'cp950', 'cp949'):
        try: return b.decode(e)
        except UnicodeDecodeError: pass
    return b.decode('latin1')

def main():
    rune_dir, out = sys.argv[1:3]
    lua = L.LuaRuntime(encoding=None)
    for f in ('runesystemid.lub', 'runeset_info.lub', 'runeset_desc.lub'):
        lua.execute(lub64(open(os.path.join(rune_dir, f), 'rb').read()))
    g = lua.globals()
    info, desc = g.RuneSettbl_info, g.RuneSettbl_desc
    sets = []
    for tab in sorted(desc.keys(), key=int):                      # 頁籤 1～4（Ⅰ～Ⅳ）
        for sid in sorted(desc[tab].keys(), key=int):
            v = desc[tab][sid]
            lines = [dec(t) for blk in v[b'RuneSetDescription'].values() for _, t in sorted(blk.items())]
            res = dec(info[tab][sid][b'RuneSetRes']) if info[tab] and info[tab][sid] else ''
            sets.append({'id': int(sid), 'tier': int(tab), 'n': dec(v[b'RuneSetDisplayName']).strip(), 'res': res, 'lines': lines})
    json.dump(sets, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('rune sets', len(sets))

main()
