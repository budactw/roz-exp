#!/usr/bin/env python3
"""把各職業的站立圖（身體＋頭，正面）從客戶端 data.grf 合成 PNG。
用法：python3 -I build-chars.py <data.grf> <輸出資料夾>
"""
import os, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import grf

# 輸出檔名 → (客戶端職業圖檔名, 性別)
JOBS = {
    'novice': ('초보자', '남'), 'knight': ('기사', '남'), 'crusader': ('크루세이더', '남'), 'wizard': ('위저드', '남'), 'sage': ('세이지', '남'),
    'hunter': ('헌터', '남'), 'bard': ('바드', '남'), 'dancer': ('무희', '여'), 'priest': ('프리스트', '남'), 'monk': ('몽크', '남'),
    'blacksmith': ('제철공', '남'), 'alchemist': ('연금술사', '남'), 'assassin': ('어세신', '남'), 'rogue': ('로그', '남'),
    'ninja': ('닌자', '남'), 'gunslinger': ('건너', '남'),
}

def spr(b):
    """→ [(w, h, RGBA 列)]；只讀調色盤圖"""
    ver, n = struct.unpack_from('<HH', b, 2)
    i = 8 if ver >= 0x200 else 6
    pal = b[-1024:]; imgs = []
    for _ in range(n):
        w, h = struct.unpack_from('<HH', b, i); i += 4
        if ver >= 0x201:
            size, = struct.unpack_from('<H', b, i); i += 2
            raw = bytearray(); end = i + size
            while i < end:
                c = b[i]; i += 1
                if c == 0: raw.extend(b'\0' * b[i]); i += 1
                else: raw.append(c)
        else:
            raw = b[i:i + w * h]; i += w * h
        rows = [[(*pal[p * 4:p * 4 + 3], 255) if p else (0, 0, 0, 0) for p in raw[y * w:(y + 1) * w]] for y in range(h)]
        imgs.append((w, h, rows))
    return imgs

def act_frame(b, action=0, frame=0):
    """→ (圖層 [(x, y, 圖編號, 鏡像)], 錨點 [(x, y)])"""
    ver, = struct.unpack_from('<H', b, 2)
    i = 16
    for a in range(action + 1):
        nf, = struct.unpack_from('<I', b, i); i += 4
        for f in range(nf):
            i += 32
            nl, = struct.unpack_from('<I', b, i); i += 4
            layers = []
            for _ in range(nl):
                x, y, idx, mir = struct.unpack_from('<iiiI', b, i); i += 16
                if ver >= 0x200: i += 4 + 4 + (4 if ver >= 0x204 else 0) + 4 + 4 + (8 if ver >= 0x205 else 0)
                layers.append((x, y, idx, mir))
            anchors = []
            if ver >= 0x200: i += 4
            if ver >= 0x203:
                na, = struct.unpack_from('<I', b, i); i += 4
                for _ in range(na):
                    _, x, y, _ = struct.unpack_from('<iiii', b, i); i += 16; anchors.append((x, y))
            if a == action and f == frame: return layers, anchors
    raise ValueError('找不到影格')

def main():
    grf_path, out_dir = sys.argv[1:3]
    _, ents = grf.table(grf_path)
    idx = {n.lower(): e for e in ents for n in [e[0]]}
    os.makedirs(out_dir, exist_ok=True)
    with open(grf_path, 'rb') as f:
        def load(path):
            p = path.encode('cp949').lower()
            return spr(grf.read(f, idx[p + b'.spr'])), act_frame(grf.read(f, idx[p + b'.act']))
        for slug, (job, sex) in JOBS.items():
            body, (bl, ba) = load(f'data\\sprite\\인간족\\몸통\\{sex}\\{job}_{sex}')
            head, (hl, ha) = load(f'data\\sprite\\인간족\\머리통\\{sex}\\1_{sex}')
            dx, dy = (ba[0][0] - ha[0][0], ba[0][1] - ha[0][1]) if ba and ha else (0, 0)
            parts = [(x, y, body[i], m) for x, y, i, m in bl if i >= 0] + [(x + dx, y + dy, head[i], m) for x, y, i, m in hl if i >= 0]
            box = [(x - w // 2, y - h // 2, w, h, rows, m) for x, y, (w, h, rows), m in parts]
            x0 = min(b[0] for b in box); y0 = min(b[1] for b in box)
            W = max(b[0] + b[2] for b in box) - x0; H = max(b[1] + b[3] for b in box) - y0
            canvas = [[(0, 0, 0, 0)] * W for _ in range(H)]
            for bx, by, w, h, rows, m in box:
                for y in range(h):
                    for x in range(w):
                        px = rows[y][w - 1 - x if m else x]
                        if px[3]: canvas[by - y0 + y][bx - x0 + x] = px
            open(os.path.join(out_dir, slug + '.png'), 'wb').write(grf.png(W, H, [bytes(v for px in row for v in px) for row in canvas]))
            print(slug, W, H)

main()
