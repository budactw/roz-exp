#!/usr/bin/env python3
"""配裝 Buff 區的道具圖示：照 buff-data.js 裡的物品編號（ic）從客戶端解出 icons/<編號>.png。
用法：<有 lupa 的 python> -I build-buff-icons.py <data.grf> <ii64.lub> <buff-data.js> <輸出資料夾 public/icons>
"""
import importlib.util, os, re, sys, zlib
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
import grf
import lupa.lua51 as L
spec = importlib.util.spec_from_file_location('build_icons', os.path.join(here, 'build-icons.py'))
bi = importlib.util.module_from_spec(spec); spec.loader.exec_module(bi)

def main():
    grf_path, lub, buff_js, out_dir = sys.argv[1:5]
    src = open(buff_js, encoding='utf-8').read()
    ids = sorted({int(x) for x in re.findall(r'\bic: (\d+)', src)} | {int(x) for x in re.findall(r'[A-Z]{3}: (\d{4,})', src)})   # Buff 的 ic＋料理圖示 BUFF_FOOD_IC
    lua = L.LuaRuntime(encoding=None); lua.execute(open(lub, 'rb').read())
    tbl = lua.globals().tbl
    _, ents = grf.table(grf_path)
    files = {}
    for n, cs, ca, rs, fl, o in ents:
        low = n.lower()
        if low.endswith(b'.bmp') and b'\\item\\' in low and low.startswith(b'data\\texture\\'): files[low.rsplit(b'\\', 1)[1][:-4]] = (cs, ca, fl, o)
    miss = []
    with open(grf_path, 'rb') as f:
        for iid in ids:
            v = tbl[iid]; res = (v and v[b'identifiedResourceName']) or b''
            try: ent = files.get(res.decode('utf-8').encode('cp949').lower())
            except (UnicodeDecodeError, UnicodeEncodeError): ent = None
            ent = ent or files.get(res.lower())
            if not ent: miss.append(iid); continue
            cs, ca, fl, o = ent
            f.seek(o); data = f.read(ca)
            if fl & 6: data = grf.decode(data, fl, cs)
            w, h, rows = bi.bmp_rgba(zlib.decompress(data[:cs]))
            open(os.path.join(out_dir, f'{iid}.png'), 'wb').write(grf.png(w, h, rows))
    print('icons', len(ids) - len(miss), 'miss', miss)

main()
