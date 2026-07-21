"""生成底部 tab 线性图标(4 图标 x 2 态)。
4x 超采样绘制再降采样,得到平滑描边;弃用 emoji,统一线性风格。
"""
import os
from PIL import Image, ImageDraw

S = 4                      # 超采样倍数
SIZE = 81                  # 最终尺寸(px)
C = SIZE * S               # 画布尺寸
W = 5 * S                  # 描边宽度
NORMAL = (176, 169, 159, 255)   # 未选中:暖灰
ACTIVE = (200, 162, 109, 255)   # 选中:香槟金
OUT = os.path.dirname(os.path.abspath(__file__))


def canvas():
    img = Image.new("RGBA", (C, C), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def dot(d, xy, color):
    """圆点补齐线段接头,做出圆角效果"""
    x, y = xy
    r = W / 2
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)


def polyline(d, pts, color, closed=False):
    p = list(pts)
    if closed:
        p = p + [p[0]]
    d.line(p, fill=color, width=W, joint="curve")
    for pt in pts:
        dot(d, pt, color)


def s(v):
    return v * S


def home(d, color):
    # 屋顶
    polyline(d, [(s(15), s(42)), (s(40.5), s(17)), (s(66), s(42))], color)
    # 屋身
    d.rounded_rectangle([s(21), s(42), s(60), s(66)], radius=s(4),
                        outline=color, width=W)


def dress(d, color):
    # 衣架挂钩
    d.arc([s(48), s(12), s(64), s(30)], start=110, end=310, fill=color, width=W)
    # 衣架三角
    polyline(d, [(s(40.5), s(28)), (s(18), s(50)), (s(63), s(50))], color, closed=True)


def makeup(d, color):
    # 口红管身
    d.rounded_rectangle([s(30), s(40), s(51), s(68)], radius=s(5),
                        outline=color, width=W)
    # 口红膏体(斜切)
    polyline(d, [(s(30), s(40)), (s(30), s(28)), (s(40), s(15)),
                 (s(51), s(22)), (s(51), s(40))], color, closed=True)


def me(d, color):
    # 头
    d.ellipse([s(29), s(15), s(52), s(38)], outline=color, width=W)
    # 肩
    d.arc([s(19), s(46), s(62), s(86)], start=180, end=360, fill=color, width=W)


ICONS = {"home": home, "dress": dress, "makeup": makeup, "me": me}

for name, fn in ICONS.items():
    for state, color in (("normal", NORMAL), ("active", ACTIVE)):
        img, d = canvas()
        fn(d, color)
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
        img.save(os.path.join(OUT, f"{name}_{state}.png"))
        print("saved", f"{name}_{state}.png")
