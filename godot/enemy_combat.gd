extends RefCounted
## Species-specific, locked attacks. Each encounter telegraphs before committing.
static func step(enemy: Dictionary, target: Vector2, clock: float, dt: float,
        obstacles: Array[Rect2]) -> String:
    if not enemy.has("mode"):
        enemy["mode"] = "patrol"
        enemy["mode_time"] = 0.0
        enemy["cooldown"] = 1.0 + fmod(float(enemy["phase"]), 3.0) * 0.4
        enemy["aim"] = Vector2.LEFT
        enemy["dir"] = int(enemy.get("dir", -1))
        var spawn := Vector2(float(enemy["x"]), float(enemy["y"]))
        for obstacle in obstacles:
            var expanded := obstacle.grow(49)
            if expanded.has_point(spawn):
                var above := expanded.position.y - 1.0
                var below := expanded.end.y + 1.0
                spawn.y = below if above < 350.0 or absf(below - spawn.y) < absf(above - spawn.y) else above
        enemy["y"] = clampf(spawn.y, 350.0, 840.0)
        enemy["by"] = enemy["y"]
    var kind := String(enemy["kind"])
    var pos := Vector2(float(enemy["x"]), float(enemy["y"]))
    var previous := pos
    var anchor := Vector2(float(enemy["bx"]), float(enemy["by"]))
    var phase := float(enemy["phase"])
    var mode := String(enemy["mode"])
    enemy["mode_time"] = float(enemy["mode_time"]) + dt
    enemy["cooldown"] = maxf(0.0, float(enemy["cooldown"]) - dt)
    var event := ""
    if mode == "patrol":
        if kind == "crab":
            pos.x += float(enemy["dir"]) * 90.0 * dt
            if absf(pos.x - anchor.x) > 170.0:
                enemy["dir"] = -int(enemy["dir"])
                pos.x = clampf(pos.x, anchor.x - 170, anchor.x + 170)
        elif kind == "jelly":
            pos = anchor + Vector2(sin(clock + phase) * 30, cos(clock * 1.6 + phase) * 55)
        else:
            pos = anchor + Vector2(sin(clock + phase) * 50, cos(clock * 1.6 + phase) * 30)
        var range_limit := 440.0 if kind != "crab" else 250.0
        if pos.distance_to(target) < range_limit and target.y > 280.0 and float(enemy["cooldown"]) <= 0.0:
            enemy["aim"] = (target - pos).normalized()
            enemy["mode"] = "windup"
            enemy["mode_time"] = 0.0
    elif mode == "windup":
        if float(enemy["mode_time"]) >= (0.95 if kind == "puffer" else 0.75):
            enemy["mode"] = "attack"
            enemy["mode_time"] = 0.0
            if kind in ["puffer", "jelly"]:
                event = "fire"
    elif mode == "attack":
        var speed := 540.0 if kind in ["swordfish", "shark"] else (430.0 if kind == "eel" else 230.0)
        if kind not in ["puffer", "jelly"]:
            pos += Vector2(enemy["aim"]) * speed * dt
        if float(enemy["mode_time"]) >= 0.48:
            enemy["mode"] = "recover"
            enemy["mode_time"] = 0.0
    else:
        pos = pos.move_toward(anchor, dt * 160.0)
        if float(enemy["mode_time"]) >= 1.25:
            enemy["mode"] = "patrol"
            enemy["mode_time"] = 0.0
            enemy["cooldown"] = 1.4
    pos.y = clampf(pos.y, 350.0, 840.0)
    for obstacle in obstacles:
        if obstacle.grow(48).has_point(pos):
            pos = previous
            enemy["mode"] = "recover"
            enemy["mode_time"] = 0.0
            break
    enemy["x"] = pos.x
    enemy["y"] = pos.y
    var aim := Vector2(enemy["aim"])
    if absf(aim.x) > 0.15 and String(enemy["mode"]) != "patrol":
        enemy["dir"] = -1 if aim.x < 0 else 1
    return event
