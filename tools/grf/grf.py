#!/usr/bin/env python3
"""讀 RO 客戶端 data.grf（0x200／0x300 版）：列出檔案、解出指定檔案。

用法：
  python3 -I grf.py <data.grf> list [關鍵字]
  python3 -I grf.py <data.grf> get <GRF 內路徑> <輸出檔>
支援未加密與傳統混淆（flags 2／4）的檔案。
"""
import struct, sys, zlib


# ===== GRF 傳統混淆（flags 2＝MIXCRYPT、4＝只有檔頭）：移植自 roBrowser GameFileDecrypt.js（源自 rAthena des.c）=====
MASK = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,
      57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7]
FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,
      36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25]
TP = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25]
SBOX = [bytes.fromhex(x) for x in (
 'ef0341fdd8741e4726effb22b3d8841e39aca76062c1cdba5c969059053b7a8540fd1ec8e78a8b21da43649f2d14b172f55bc8b69c3776ec39a0a305526e0fd9',
 'a7dd0d789e0be395603636' '4ff9605aa31124d287c85275ecbbc14cba24fe8f19da1366af49d090068c6afb91378d0d78bf4911f423e5ce3b55bca257e82274ce',
 '2ceac1bf4a241fc27947a27cb6d968158056 5d0133fdf4aede30079be5839b6849b42e831fc2b57ca219d8e57c2f83daf76b90fec4015a9761a63d400b58e63d'.replace(' ', ''),
 '4dd1b20f28bde478f64a0f938b17d1a43aecc93593567ecb5520a0fe6c891762 17624bb1b4ded187c9143c4a7ea8e27da09ff65c6a098df00fe35325953628cb'.replace(' ', ''))]
SUB = list(range(256))
for a, b in [(0x00,0x2b),(0x6c,0x80),(0x01,0x68),(0x48,0x77),(0x60,0xff),(0xb9,0xc0),(0xfe,0xeb)]:
    SUB[a], SUB[b] = b, a

def _perm(src, table):
    out = bytearray(8)
    for i, t in enumerate(table):
        j = t - 1
        if src[(j >> 3) & 7] & MASK[j & 7]: out[(i >> 3) & 7] |= MASK[i & 7]
    return out

def _block(b):
    b = _perm(b, IP)
    t = bytes([((b[7]<<5)|(b[4]>>3))&63, ((b[4]<<1)|(b[5]>>7))&63, ((b[4]<<5)|(b[5]>>3))&63, ((b[5]<<1)|(b[6]>>7))&63,
               ((b[5]<<5)|(b[6]>>3))&63, ((b[6]<<1)|(b[7]>>7))&63, ((b[6]<<5)|(b[7]>>3))&63, ((b[7]<<1)|(b[4]>>7))&63])
    s = [(SBOX[i][t[i*2]] & 0xf0) | (SBOX[i][t[i*2+1]] & 0x0f) for i in range(4)]
    p = bytearray(8)
    for i, v in enumerate(TP):
        j = v - 1
        if s[j >> 3] & MASK[j & 7]: p[(i >> 3) + 4] |= MASK[i & 7]
    for i in range(4): b[i] ^= p[4 + i]
    return _perm(b, FP)

def decode(buf, flags, cs):
    buf = bytearray(buf); n = len(buf) >> 3
    for i in range(min(20, n)): buf[i*8:i*8+8] = _block(buf[i*8:i*8+8])
    if flags & 2:
        d = len(str(cs)); cycle = 1 if d < 3 else d + 1 if d < 5 else d + 9 if d < 7 else d + 15
        j = 0
        for i in range(20, n):
            if i % cycle == 0: buf[i*8:i*8+8] = _block(buf[i*8:i*8+8]); continue
            if j == 7:
                x = buf[i*8:i*8+8]
                buf[i*8:i*8+8] = bytes([x[3], x[4], x[6], x[0], x[1], x[2], x[5], SUB[x[7]]]); j = 0
            j += 1
    return bytes(buf)

def table(path):
    with open(path, 'rb') as f:
        h = f.read(46)
        if not (h.startswith(b'Master of Magic') or h.startswith(b'Event Horizon')):
            sys.exit('不是 GRF 檔')
        off, seed, cnt, ver = struct.unpack('<IIII', h[30:46])
        if ver == 0x300:  # 0x300 版的表位置是 64 位元
            off = struct.unpack('<Q', h[30:38])[0]
        f.seek(off + 46)
        if ver == 0x300:
            f.read(4)
        csize, rsize = struct.unpack('<II', f.read(8))
        raw = zlib.decompress(f.read(csize))
    out, i = [], 0
    while i < len(raw):
        j = raw.index(b'\0', i)
        name = raw[i:j]; i = j + 1
        if ver == 0x300:
            cs, ca, rs, fl, o = struct.unpack('<IIIBQ', raw[i:i + 21]); i += 21
        else:
            cs, ca, rs, fl, o = struct.unpack('<IIIBI', raw[i:i + 17]); i += 17
        out.append((name, cs, ca, rs, fl, o + 46))
    return hex(ver), out

def png(w, h, rows):
    """rows：每列 RGBA 位元組 → PNG"""
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + \
        chunk(b'IDAT', zlib.compress(b''.join(b'\0' + bytes(r) for r in rows), 9)) + chunk(b'IEND', b'')

def read(f, ent):
    """ent：table() 的一筆 → 解開後的檔案內容"""
    n, cs, ca, rs, fl, o = ent
    f.seek(o); data = f.read(ca)
    if fl & 6: data = decode(data, fl, cs)
    return zlib.decompress(data[:cs])

def dec(b):
    for enc in ('cp949', 'big5', 'utf-8'):
        try: return b.decode(enc)
        except UnicodeDecodeError: pass
    return b.decode('latin1')

def main():
    path, cmd = sys.argv[1], sys.argv[2]
    ver, ents = table(path)
    if cmd == 'list':
        kw = sys.argv[3].lower() if len(sys.argv) > 3 else ''
        print('版本', ver, '檔案數', len(ents), file=sys.stderr)
        for n, cs, ca, rs, fl, o in ents:
            s = dec(n)
            if kw in s.lower(): print(fl, rs, s)
    elif cmd == 'get':
        want = sys.argv[3].lower()
        for n, cs, ca, rs, fl, o in ents:
            if dec(n).lower() == want:
                with open(path, 'rb') as f:
                    f.seek(o); data = f.read(ca)
                if fl & 6: data = decode(data, fl, cs)
                open(sys.argv[4], 'wb').write(zlib.decompress(data[:cs]))
                print('ok', rs); return
        sys.exit('找不到')

if __name__ == '__main__':
    main()
