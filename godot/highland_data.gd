extends RefCounted
## Highland Gold source constants: dist/highland.js (9.1).
## Coordinates are deliberately aligned with the HTML release, not rescaled to a shorter demo.
const LEVEL_LENGTH := 20748.0
const WATERFALL_START := 3010.0
const WATERFALL_EXIT := 4120.0
const BOSS_X := 20358.0
const PORTAL_X := 20620.0
const SOURCE_ROUTE_START := 4060.0
const SOURCE_BOSS_X := 14600.0
const ROUTE_SCALE := (BOSS_X - SOURCE_ROUTE_START) / (SOURCE_BOSS_X - SOURCE_ROUTE_START)
const FALL_DURATION := 17.0
const FALL_ENTRY := 1.8
const FALL_EXIT := 1.6

static func route_x(x: float) -> float:
    if x <= SOURCE_ROUTE_START:
        return x
    return roundf(SOURCE_ROUTE_START + (x - SOURCE_ROUTE_START) * ROUTE_SCALE)

static func obstacles() -> Array[Rect2]:
    # Source positions, widths and heights from setupHighland().
    var specs := [
        [4350, 280, 185, 235], [4750, 710, 240, 185],
        [5280, 280, 170, 265], [5720, 685, 190, 210],
        [6170, 280, 180, 250], [7350, 280, 190, 245],
        [7800, 700, 230, 190], [8260, 280, 170, 270],
        [8700, 690, 210, 205], [9180, 280, 190, 245],
        [9640, 705, 230, 185], [10120, 280, 170, 260],
        [10570, 680, 205, 215], [11100, 280, 185, 250],
        [11610, 700, 230, 190], [12170, 280, 180, 260],
        [12700, 690, 215, 205], [13260, 280, 190, 245],
        [13750, 705, 210, 185]
    ]
    var result: Array[Rect2] = []
    for spec in specs:
        result.append(Rect2(route_x(float(spec[0])), float(spec[1]), float(spec[2]), float(spec[3])))
    return result

static func enemies() -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    # Original named enemy line-up along the post-fall route.
    var swimmers := [
        [4450, "jelly", 440], [5190, "puffer", 610],
        [5930, "jelly", 440], [6470, "puffer", 610],
        [7480, "eel", 460], [8160, "swordfish", 660],
        [8840, "jelly", 430], [9520, "puffer", 650],
        [10220, "eel", 470], [10900, "shark", 650],
        [11600, "jelly", 430], [12320, "puffer", 650],
        [13040, "eel", 470], [13620, "shark", 620]
    ]
    for i in range(swimmers.size()):
        var s: Array = swimmers[i]
        var x := route_x(float(s[0]))
        result.append({"kind": s[1], "x": x, "bx": x, "y": float(s[2]), "by": float(s[2]), "hp": 1, "phase": float(i), "cooldown": 0.0})
    var crab_xs := [1680, 2590, 4570, 5580, 6280, 7520, 8420, 9340, 10280, 11220, 12180, 13120, 13880]
    for i in range(crab_xs.size()):
        var x := route_x(float(crab_xs[i]))
        result.append({"kind": "crab", "x": x, "bx": x, "y": 832.0, "by": 832.0, "hp": 1, "phase": float(i), "dir": -1 if i % 2 == 0 else 1, "min": x - 170.0, "max": x + 170.0, "cooldown": 0.0})
    # Opening characters remain spaced apart ahead of the waterfall.
    for i in range(3):
        var x := float([760, 1660, 2580][i])
        result.append({"kind": ["jelly", "puffer", "eel"][i], "x": x, "bx": x, "y": 720.0 if i % 2 == 0 else 440.0, "by": 720.0 if i % 2 == 0 else 440.0, "hp": 1, "phase": float(i) + 8.0, "cooldown": 0.0})
    return result

static func treasure() -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    # Regular exploration gold; the waterfall has its own 22-piece timeline.
    for i in range(105):
        var x := 450.0 + float(i) * 192.0
        if x > 2900.0 and x < SOURCE_ROUTE_START:
            continue
        if x > LEVEL_LENGTH - 320.0:
            continue
        var y := float([440, 565, 690, 770][i % 4])
        result.append({"x": x, "y": y, "kind": "pearl", "taken": false, "phase": float(i) * 0.8})
    for i in range(9):
        var x := route_x(float([4660, 5620, 6370, 7750, 9140, 10540, 11920, 13280, 14120][i]))
        result.append({"x": x, "y": 845.0, "kind": "chest", "taken": false, "phase": float(i) * 0.7})
    var powerups := [
        [4190, 600, "heart"], [4900, 450, "boost"], [5560, 550, "heart"],
        [6280, 650, "heart"], [6750, 520, "boost"], [7920, 470, "heart"],
        [9020, 610, "boost"], [10380, 500, "heart"], [11520, 620, "boost"],
        [12620, 500, "heart"], [13680, 610, "boost"], [14320, 520, "heart"]
    ]
    for p in powerups:
        result.append({"x": route_x(float(p[0])), "y": float(p[1]), "kind": p[2], "taken": false, "phase": 0.0})
    return result

static func waterfall_hazards() -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    var offsets := [-0.56, 0.50, -0.45, 0.57, 0.0, -0.55]
    for i in range(12):
        var kind: String = "eel" if i in [4, 7, 10] else ["reef", "jelly", "puffer"][i % 3]
        result.append({"at": 2.3 + float(i) * 1.17, "x": offsets[i % 6], "kind": kind, "passed": false})
    return result

static func waterfall_gold() -> Array[Dictionary]:
    var result: Array[Dictionary] = []
    for i in range(22):
        result.append({"at": 1.3 + float(i) * 0.68, "x": sin(float(i) * 0.85) * 0.48, "taken": false})
    return result
