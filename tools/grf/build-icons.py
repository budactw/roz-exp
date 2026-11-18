#!/usr/bin/env python3
"""把配裝用到的裝備圖示從客戶端解出來，轉成 PNG（洋紅底轉透明）。
用法：<有 lupa 的 python> -I build-icons.py <data.grf> <ii64.lub> <裝備名稱.json> <輸出資料夾> <輸出 icon-data.js> [物品大圖輸出資料夾] [說明輸出 desc-data.json]
  ii64.lub：lub64.py 轉過的 iteminfo_new.lub；裝備名稱.json：GEAR_DB 的名稱陣列
"""
import json, os, struct, sys, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import grf
import lupa.lua51 as L

ALIAS = {'中級公會員昇龍拳套': '中級公會員昇龍拳套]', '雙龍戒指（左邊）': '雙龍戒指', '雙龍戒指（右邊）': '雙龍戒指'}

def dec(b):
    try: return b.decode('utf-8') if b else ''
    except UnicodeDecodeError: return b.decode('cp950', 'replace')

def bmp_rgba(b):
    off, = struct.unpack_from('<I', b, 10)
    hs, w, h, _, bpp, comp = struct.unpack_from('<IiiHHI', b, 14)
    if comp or bpp not in (8, 24): raise ValueError(f'不支援的 BMP（{bpp} 位元、壓縮 {comp}）')
    pal = [b[14 + hs + i * 4: 14 + hs + i * 4 + 3] for i in range(256)] if bpp == 8 else None
    stride = (w * bpp // 8 + 3) & ~3
    rows = []
    for y in range(abs(h)):
        line = b[off + y * stride: off + (y + 1) * stride]; row = bytearray()
        for x in range(w):
            bl, g, r = pal[line[x]] if pal else line[x * 3: x * 3 + 3]
            row += bytes((r, g, bl, 0 if r >= 248 and bl >= 248 and g <= 8 else 255))
        rows.append(bytes(row))
    if h > 0: rows.reverse()
    return w, abs(h), rows

def main():
    grf_path, lub, names_path, out_dir, out_js = sys.argv[1:6]
    coll_dir = sys.argv[6] if len(sys.argv) > 6 else None
    desc_path = sys.argv[7] if len(sys.argv) > 7 else None
    lua = L.LuaRuntime(encoding=None); lua.execute(open(lub, 'rb').read())
    by_name = {}
    for k, v in lua.globals().tbl.items():
        d = v[b'identifiedDescriptionName']
        by_name.setdefault(dec(v[b'identifiedDisplayName']), []).append((int(k), v[b'identifiedResourceName'] or b'', [dec(d[j]) for j in range(1, len(d) + 1)] if d else []))
    _, ents = grf.table(grf_path)
    files, colls = {}, {}
    for n, cs, ca, rs, fl, o in ents:
        low = n.lower()
        if low.endswith(b'.bmp') and b'\\item\\' in low and low.startswith(b'data\\texture\\'):
            files[low.rsplit(b'\\', 1)[1][:-4]] = (cs, ca, fl, o)
        elif low.endswith(b'.bmp') and b'\\collection\\' in low and low.startswith(b'data\\texture\\'):
            colls[low.rsplit(b'\\', 1)[1][:-4]] = (cs, ca, fl, o)
    os.makedirs(out_dir, exist_ok=True)
    if coll_dir: os.makedirs(coll_dir, exist_ok=True)
    out, miss, nc, descs = {}, [], 0, {}
    with open(grf_path, 'rb') as f:
        for name in json.load(open(names_path, encoding='utf-8')):
            cand = by_name.get(ALIAS.get(name, name)) or by_name.get(name.replace('（', '(').replace('）', ')')) or []
            for iid, res, desc in sorted(cand, key=lambda x: x[0]):
                ent = files.get(res.lower())
                if not ent:  # 資源名稱在物品表是 UTF-8，GRF 內的檔名是 cp949
                    try: ent = files.get(res.decode('utf-8').encode('cp949').lower())
                    except (UnicodeDecodeError, UnicodeEncodeError): pass
                if not ent: continue
                cs, ca, fl, o = ent
                f.seek(o); data = f.read(ca)
                if fl & 6: data = grf.decode(data, fl, cs)
                try: w, h, rows = bmp_rgba(zlib.decompress(data[:cs]))
                except Exception as e: print('略過', name, e, file=sys.stderr); continue
                open(os.path.join(out_dir, f'{iid}.png'), 'wb').write(grf.png(w, h, rows))
                out[name] = iid; descs[name] = desc   # 說明保留遊戲色碼 ^RRGGBB
                # 物品大圖（物品資訊視窗用）
                try: key = res.decode('utf-8').encode('cp949').lower()
                except (UnicodeDecodeError, UnicodeEncodeError): key = res.lower()
                ce = colls.get(key) or colls.get(res.lower())
                if coll_dir and ce:
                    cs, ca, fl, o = ce
                    f.seek(o); data = f.read(ca)
                    if fl & 6: data = grf.decode(data, fl, cs)
                    try: w, h, rows = bmp_rgba(zlib.decompress(data[:cs])); open(os.path.join(coll_dir, f'{iid}.png'), 'wb').write(grf.png(w, h, rows)); nc += 1
                    except Exception as e: print('大圖略過', name, e, file=sys.stderr)
                break
            else: miss.append(name)
    open(out_js, 'w', encoding='utf-8').write('// 由 tools/grf/build-icons.py 產生：裝備名稱 → 圖示編號（icons/<編號>.png，取自樂園客戶端）\n'
        f'const GEAR_ICON = {json.dumps(out, ensure_ascii=False, separators=(",", ":"))};\n')
    if desc_path: json.dump(descs, open(desc_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('icons', len(out), 'miss', len(miss), '、'.join(miss), 'collection', nc)

main()
