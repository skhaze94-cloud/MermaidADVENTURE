extends RefCounted
## Shared geometry for input and HUD: sliding pad supports one-finger diagonals.
static func pad_rect(size: Vector2) -> Rect2:
    return Rect2(16, size.y - 184, 224, 168)

static func pad_vector(point: Vector2, size: Vector2) -> Vector2:
    var offset := point - pad_rect(size).get_center()
    if offset.length() < 18.0:
        return Vector2.ZERO
    return offset.normalized()

static func radial_stick(stick: Vector2) -> Vector2:
    var magnitude := stick.length()
    if magnitude <= 0.20:
        return Vector2.ZERO
    return stick.normalized() * clampf((magnitude - 0.20) / 0.80, 0.0, 1.0)

static func rect(action: String, size: Vector2) -> Rect2:
    var y := size.y - 172.0
    match action:
        "boost": return Rect2(size.x - 225, y + 57, 102, 91)
        "jump": return Rect2(size.x - 110, y - 20, 94, 91)
        "bubble": return Rect2(size.x - 335, y - 20, 94, 91)
        "pause": return Rect2(size.x - 84, 12, 70, 52)
        "resume": return Rect2(size.x * 0.5 - 235, size.y * 0.5 + 62, 220, 58)
        "restart": return Rect2(size.x * 0.5 + 15, size.y * 0.5 + 62, 220, 58)
    return Rect2()

static func controller_id(current: int, devices: Array[int]) -> int:
    if devices.is_empty():
        return -1
    return current if current in devices else devices[0]
