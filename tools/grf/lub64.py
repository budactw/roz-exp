#!/usr/bin/env python3
"""把 32 位元 size_t 的 Lua 5.1 bytecode（客戶端 .lub）轉成 64 位元，讓 64 位元的 Lua 5.1 能載入。
用法：python3 -I lub64.py <輸入.lub> <輸出.lub>
"""
import struct, sys

def conv(b):
    i = 12
    out = bytearray(b[:12]); out[8] = 8  # size_t → 8
    def rd(fmt):
        nonlocal i
        v = struct.unpack_from('<' + fmt, b, i); i += struct.calcsize(fmt); return v[0]
    def raw(n):
        nonlocal i
        v = b[i:i + n]; i += n; return v
    def string():
        n = rd('I'); out.extend(struct.pack('<Q', n)); out.extend(raw(n))
    def integer():
        v = rd('i'); out.extend(struct.pack('<i', v)); return v
    def func():
        string()
        integer(); integer()
        out.extend(raw(4))
        n = integer(); out.extend(raw(4 * n))
        n = integer()
        for _ in range(n):
            t = raw(1); out.extend(t)
            if t[0] == 1: out.extend(raw(1))
            elif t[0] == 3: out.extend(raw(8))
            elif t[0] == 4: string()
            elif t[0] != 0: sys.exit(f'未知常數型別 {t[0]}')
        n = integer()
        for _ in range(n): func()
        n = integer(); out.extend(raw(4 * n))
        n = integer()
        for _ in range(n): string(); integer(); integer()
        n = integer()
        for _ in range(n): string()
    func()
    return bytes(out)

open(sys.argv[2], 'wb').write(conv(open(sys.argv[1], 'rb').read()))
