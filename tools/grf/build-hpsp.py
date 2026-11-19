#!/usr/bin/env python3
"""配裝頁人物狀態的基礎 HP／SP（樂園）。
用法：python3 -I build-hpsp.py <rathena>/db/pre-re/job_basepoints.yml <rathena>/db/re/job_basepoints.yml <輸出 hpsp-data.js>

規則（和遊戲內對照反推；✓ 是已經用遊戲數字確認過的）：
- Lv 1～99：原版（pre-renewal）表 × 0.7（四捨五入），二轉再 × 1.25（捨去）。賢者、鍊金術師的 SP 用巫師的表，十字軍 SP +1。
  ✓ 服事 Lv48（一轉）。二轉這段沿用 Ragnarok Zero 國際服的反推規則，樂園還沒確認。
- Lv 100 以上：三轉的 renewal 表 × 0.7（四捨五入）× 1.25 × 1.25（各自捨去）。
  ✓ 祭司 Lv111、賢者 Lv119（賢者的 HP 用大主教的表、SP 用術士的表 − 1）。其他職業照轉職路線對應，還沒確認。
最大 HP ＝ ⌊基礎 × (1 + VIT/100)⌋ ＋ 裝備 HP，再乘裝備 HP%；SP 一樣看 INT。
"""
import json, math, re, sys

def load(path):
    t = open(path, encoding='utf-8').read(); out = {}
    for kind, key in (('BaseHp', 'Hp'), ('BaseSp', 'Sp')):
        for m in re.finditer(r'  - Jobs:\n((?:      \w+: true\n)+)    ' + kind + r':\n((?:      - Level: \d+\n        ' + key + r': \d+\n)+)', t):
            tb = {int(a): int(b) for a, b in re.findall(r'Level: (\d+)\n\s+\w+: (\d+)', m.group(2))}
            for j in re.findall(r'(\w+): true', m.group(1)): out[(j, kind)] = tb
    return out

half = lambda x: math.floor(x + 0.5)
# 職業 → [原版二轉, 原版 SP 表, Lv100 以上 HP 表, Lv100 以上 SP 表, SP 調整, 是否 ×1.25（二轉）, 已確認]
CLS = {
    '騎士': ['Knight', 'Knight', 'Rune_Knight', 'Rune_Knight', 0, True, False],
    '十字軍': ['Crusader', 'Crusader', 'Royal_Guard', 'Royal_Guard', 1, True, False],
    '巫師': ['Wizard', 'Wizard', 'Warlock', 'Warlock', 0, True, False],
    '賢者': ['Sage', 'Wizard', 'Arch_Bishop', 'Sorcerer', -1, True, True],
    '獵人': ['Hunter', 'Hunter', 'Ranger', 'Ranger', 0, True, False],
    '吟遊詩人': ['Bard', 'Bard', 'Minstrel', 'Minstrel', 0, True, False],
    '舞孃': ['Dancer', 'Dancer', 'Wanderer', 'Wanderer', 0, True, False],
    '祭司': ['Priest', 'Priest', 'Arch_Bishop', 'Arch_Bishop', 0, True, True],
    '武道家': ['Monk', 'Monk', 'Sura', 'Sura', 0, True, False],
    '鐵匠': ['Blacksmith', 'Blacksmith', 'Mechanic', 'Mechanic', 0, True, False],
    '鍊金術師': ['Alchemist', 'Wizard', 'Genetic', 'Genetic', 0, True, False],
    '刺客': ['Assassin', 'Assassin', 'Guillotine_Cross', 'Guillotine_Cross', 0, True, False],
    '流氓': ['Rogue', 'Rogue', 'Shadow_Chaser', 'Shadow_Chaser', 0, True, False],
    '忍者': ['Ninja', 'Ninja', 'Kagerou', 'Kagerou', 0, False, False],
    '神槍手': ['Gunslinger', 'Gunslinger', 'Rebellion', 'Rebellion', 0, False, False],
}

def main():
    pre, ren, out_path = load(sys.argv[1]), load(sys.argv[2]), sys.argv[3]
    data = {}
    for cls, (j2, jsp, j3hp, j3sp, spadj, second, sure) in CLS.items():
        hp, sp = [], []
        for lv in range(1, 201):
            if lv <= 99:
                f = lambda T: math.floor(half(T * 0.7) * 1.25) if second else half(T * 0.7)
                h, s = f(pre[(j2, 'BaseHp')][lv]), f(pre[(jsp, 'BaseSp')][lv]) + spadj
            else:
                f = lambda T: math.floor(math.floor(half(T * 0.7) * 1.25) * 1.25)
                h, s = f(ren[(j3hp, 'BaseHp')][lv]), f(ren[(j3sp, 'BaseSp')][lv]) + spadj
            hp.append(h); sp.append(s)
        data[cls] = {'hp': hp, 'sp': sp, 'ok': 100 if sure else 0}
    js = ('// 由 tools/grf/build-hpsp.py 產生：樂園的基礎 HP／SP（Base Lv 1～200，索引＝等級 − 1）。規則與確認狀況見該檔說明\n'
          '// HPSP[職業] = { hp: [...], sp: [...], ok: 從幾級開始已用遊戲數字確認（0＝都還沒確認） }\n'
          f'const HPSP = {json.dumps(data, ensure_ascii=False, separators=(",", ":"))};\n')
    open(out_path, 'w', encoding='utf-8').write(js)
    s, p = data['賢者'], data['祭司']
    print('賢者 Lv119', s['hp'][118], s['sp'][118], '| 祭司 Lv111', p['hp'][110], p['sp'][110], '| bytes', len(js))

main()
