#!/usr/bin/env python3
"""從客戶端 data.grf 產生技能樹資料、技能說明與技能圖示。
用法：<有 lupa 的 python> -I build-skills.py <data.grf> <輸出 skill-data.js> <輸出 skill-desc.json> <圖示資料夾>

讀 data\\luafiles514\\lua files\\skillinfoz 的 skillid、skillinfolist、skilltreeview、skilldescript（32 位元 bytecode 先轉 64 位元），
圖示取 data\\texture\\유저인터페이스\\item\\<技能英文代號>.bmp。
"""
import json, os, struct, sys, tempfile, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import grf
import lupa.lua51 as L

# 職業 → 技能樹（一轉、二轉）；初學者的技能併進一轉那一頁（位置 0、7、14）
CLASSES = {
    '騎士': ['JT_SWORDMAN', 'JT_KNIGHT'], '十字軍': ['JT_SWORDMAN', 'JT_CRUSADER'], '巫師': ['JT_MAGICIAN', 'JT_WIZARD'], '賢者': ['JT_MAGICIAN', 'JT_SAGE'],
    '獵人': ['JT_ARCHER', 'JT_HUNTER'], '吟遊詩人': ['JT_ARCHER', 'JT_BARD'], '舞孃': ['JT_ARCHER', 'JT_DANCER'], '祭司': ['JT_ACOLYTE', 'JT_PRIEST'],
    '武道家': ['JT_ACOLYTE', 'JT_MONK'], '鐵匠': ['JT_MERCHANT', 'JT_BLACKSMITH'], '鍊金術師': ['JT_MERCHANT', 'JT_ALCHEMIST'], '刺客': ['JT_THIEF', 'JT_ASSASSIN'],
    '流氓': ['JT_THIEF', 'JT_ROGUE'], '忍者': ['JT_NINJA'], '神槍手': ['JT_GUNSLINGER'],
}
JOB_NAME = {'JT_SWORDMAN': '劍士', 'JT_MAGICIAN': '魔法師', 'JT_ARCHER': '弓箭手', 'JT_ACOLYTE': '服事', 'JT_MERCHANT': '商人', 'JT_THIEF': '盜賊',
            'JT_KNIGHT': '騎士', 'JT_CRUSADER': '十字軍', 'JT_WIZARD': '巫師', 'JT_SAGE': '賢者', 'JT_HUNTER': '獵人', 'JT_BARD': '吟遊詩人', 'JT_DANCER': '舞孃',
            'JT_PRIEST': '祭司', 'JT_MONK': '武道家', 'JT_BLACKSMITH': '鐵匠', 'JT_ALCHEMIST': '鍊金術師', 'JT_ASSASSIN': '刺客', 'JT_ROGUE': '流氓',
            'JT_NINJA': '忍者', 'JT_GUNSLINGER': '神槍手'}

def dec(b):
    if not isinstance(b, bytes): return b
    for e in ('utf-8', 'cp950', 'cp949'):
        try: return b.decode(e)
        except UnicodeDecodeError: pass
    return b.decode('latin1')

def lub64(raw):
    """32 位元 size_t 的 Lua 5.1 bytecode → 64 位元（同 lub64.py）"""
    import importlib.util
    spec = importlib.util.spec_from_file_location('lub64m', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lub64.py'))
    src = open(spec.origin, encoding='utf-8').read().split('\nopen(sys.argv[2]')[0]
    ns = {}; exec(compile(src, 'lub64', 'exec'), ns); return ns['conv'](raw)

def bmp_rgba(b):
    off, = struct.unpack_from('<I', b, 10); hs, w, h, _, bpp, comp = struct.unpack_from('<IiiHHI', b, 14)
    if comp or bpp not in (8, 24): raise ValueError('BMP 格式不支援')
    pal = [b[14 + hs + i * 4: 14 + hs + i * 4 + 3] for i in range(256)] if bpp == 8 else None
    stride = (w * bpp // 8 + 3) & ~3; rows = []
    for y in range(abs(h)):
        line = b[off + y * stride: off + (y + 1) * stride]; row = bytearray()
        for x in range(w):
            bl, g, r = pal[line[x]] if pal else line[x * 3: x * 3 + 3]
            row += bytes((r, g, bl, 0 if r >= 248 and bl >= 248 and g <= 8 else 255))
        rows.append(bytes(row))
    if h > 0: rows.reverse()
    return w, abs(h), rows

def main():
    grf_path, out_js, out_desc, icon_dir = sys.argv[1:5]
    _, ents = grf.table(grf_path)
    idx = {e[0].lower(): e for e in ents}
    pre = 'data\\luafiles514\\lua files\\skillinfoz\\'.encode('cp949')
    lua = L.LuaRuntime(encoding=None)
    lua.execute(b"JOBID = setmetatable({}, {__index = function(t, k) return k end}); JobSkillTab = setmetatable({}, {__index = function(t, k) return function(...) end end})")
    with open(grf_path, 'rb') as f:
        for name in ('skillid', 'skillinfolist', 'skilltreeview', 'skilldescript'):
            raw = lub64(grf.read(f, idx[pre + name.encode() + b'.lub']))
            try: lua.execute(raw)
            except Exception as e:   # skilltreeview 後段會呼叫客戶端的介面函式，前面的表已經建好
                if name != 'skilltreeview': raise
        g = lua.globals(); info, tree, desc, SK = g.SKILL_INFO_LIST, g.SKILL_TREEVIEW_FOR_JOB, g.SKILL_DESCRIPT, g.SKID
        code = {int(v): dec(k) for k, v in SK.items()}
        need_ids, trees = set(), {}
        for cls, jobs in CLASSES.items():
            pages = []
            for i, jt in enumerate(jobs):
                pos = {int(p): int(s) for p, s in tree[jt.encode()].items()}
                if i == 0:
                    pos.update({int(p): int(s) for p, s in tree[b'JT_NOVICE'].items()})
                pages.append({'job': JOB_NAME[jt], 'pos': pos})
                need_ids.update(pos.values())
            trees[cls] = pages
        # 前置技能可能不在畫面上（例如跨職業），一起收
        skills, todo = {}, list(need_ids)
        while todo:
            sid = todo.pop()
            if sid in skills: continue
            v = info[sid]
            if not v: continue
            ok = lambda x: x[1] is not None and x[2] is not None   # 客戶端有些前置寫了不存在的技能代號，略過
            need = [[int(x[1]), int(x[2])] for x in (v[b'_NeedSkillList'] or {}).values() if ok(x)]
            jneed = {dec(j): [[int(x[1]), int(x[2])] for x in t.values() if ok(x)] for j, t in (v[b'NeedSkillList'] or {}).items()}
            t = dec(v[b'Type']) if v[b'Type'] else ''
            skills[sid] = {'n': dec(v[b'SkillName']).strip(), 'm': int(v[b'MaxLv'] or 1), 'c': code.get(sid, '')}
            if need: skills[sid]['r'] = need
            if jneed: skills[sid]['jr'] = jneed
            if t in ('Quest', 'Soul'): skills[sid]['q'] = 1
            if v[b'IsPassive']: skills[sid]['p'] = 1
            for x in need: todo.append(x[0])
        descs = {sid: [dec(desc[sid][j]) for j in range(1, len(desc[sid]) + 1)] for sid in skills if desc[sid]}
        os.makedirs(icon_dir, exist_ok=True); n_icon = 0
        ipre = 'data\\texture\\유저인터페이스\\item\\'.encode('cp949')
        for sid, s in skills.items():
            e = idx.get(ipre + s['c'].lower().encode() + b'.bmp')
            if not e: continue
            try: w, h, rows = bmp_rgba(grf.read(f, e))
            except Exception: continue
            open(os.path.join(icon_dir, f'{sid}.png'), 'wb').write(grf.png(w, h, rows)); s['i'] = 1; n_icon += 1
    js = ('// 由 tools/grf/build-skills.py 產生：技能樹資料（取自樂園客戶端 skillinfoz）\n'
          '// SKILLS[編號] = { n 名稱, m 最高等級, c 英文代號, r 前置 [[編號, 等級]], jr 依職業的前置, q 任務／靈魂技能（不佔點數）, p 被動, i 有圖示 }\n'
          '// SKILL_TREES[職業] = [{ job 名稱, pos { 格子位置（列×7＋欄）: 技能編號 } }, …]（一轉頁含初學者技能）\n'
          f'const SKILLS = {json.dumps(skills, ensure_ascii=False, separators=(",", ":"))};\n'
          f'const SKILL_TREES = {json.dumps(trees, ensure_ascii=False, separators=(",", ":"))};\n')
    open(out_js, 'w', encoding='utf-8').write(js)
    json.dump(descs, open(out_desc, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('skills', len(skills), 'icons', n_icon, 'classes', len(trees), 'bytes', len(js))

main()
