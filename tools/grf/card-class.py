"""卡片分類（一般／Boss／MVP）：看 rAthena 資料庫裡掉這張卡的怪物（以編號最小、最早的那隻為準）。
用法：python3 -I card-class.py <re/item_db_etc.yml> <re/mob_db.yml,pre-re/mob_db.yml> <card-data.js> <輸出 card-class.json>
rAthena：https://github.com/rathena/rathena（db/re、db/pre-re）。樂園自己編號的卡片對不到，用下面的 MANUAL 補。
輸出 { 卡片編號: 1 Boss／2 MVP }（一般卡不列）
"""
import json, re, sys
# rAthena 對不到的（樂園／台服自己的編號）：MVP 卡；其餘當一般卡
MANUAL = {27153: 2, 27154: 2, 27206: 2, 27207: 2, 27208: 2, 27267: 2, 27268: 2, 27269: 2, 300021: 2,
          300985: 2, 300986: 2, 300987: 2, 300988: 2, 300989: 2, 300990: 2}   # 生體研究所 3 樓 MVP（凱特莉娜、瑪嘉雷特…）
item_f, mob_fs, cards_js, out = sys.argv[1], sys.argv[2].split(','), sys.argv[3], sys.argv[4]
def blocks(path):
    cur = None
    for line in open(path, encoding='utf-8'):
        if line.startswith('  - Id:'):
            if cur: yield cur
            cur = [line]
        elif cur is not None: cur.append(line)
    if cur: yield cur
aegis = {}
for b in blocks(item_f):
    t = ''.join(b)
    if re.search(r'^\s+Type: Card', t, re.M):
        aegis[re.search(r'AegisName: (\S+)', t).group(1)] = int(re.search(r'Id: (\d+)', t).group(1))
cls = {}   # card id -> rank (2 MVP, 1 Boss, 0 normal) — 取最低（有一般怪掉就算一般卡）? 用掉落怪物的最高等級
seen = set()
for f in mob_fs:
    for b in blocks(f):
        t = ''.join(b); mid = re.search(r'Id: (\d+)', t).group(1)
        if mid in seen: continue
        seen.add(mid)
        rank = 2 if re.search(r'^\s+Mvp: true', t, re.M) else 1 if re.search(r'^\s+Class: Boss', t, re.M) else 0
        for it in re.findall(r'Item: (\S+)', t):
            if it in aegis:
                cid = aegis[it]; cls.setdefault(cid, []).append((int(mid), rank))
ids = [int(x) for x in re.findall(r'"(\d+)":\{"n"', open(cards_js, encoding='utf-8').read())]
res = {i: min(cls[i])[1] for i in ids if i in cls}   # 以編號最小（最早、原本）的那隻怪物為準
names = dict(re.findall(r"\"(\d+)\":\{\"n\":\"([^\"]+)\"", open(cards_js, encoding="utf-8").read()))
for i in ids:
    if i in cls and len({r for _, r in cls[i]}) > 1: print("mixed", i, names[str(i)], res[i], sorted(cls[i])[:4])
res.update({i: v for i, v in MANUAL.items() if i in ids})
json.dump({str(k): v for k, v in sorted(res.items()) if v}, open(out, 'w'), separators=(',', ':'))
from collections import Counter
print('cards', len(ids), 'found', len(res), Counter(res.values()), 'missing', [i for i in ids if i not in res][:80])
