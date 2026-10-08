extends Node2D
## Sarah Maria — Highland Gold, Godot 4 playable port (prototype 0.1).
## Source of truth: dist/game.js, dist/highland.js, dist/creature-sprites-v731.js
## Import artwork and soundtrack from the SAME repository, res://dist/assets/.
const Highland = preload("res://godot/highland_data.gd")
const BACKGROUND = preload("res://dist/assets/highlands.webp")
const HERO = preload("res://dist/assets/sarah-mermaid.webp")
const REEF = preload("res://dist/assets/barrier-reef.webp")
const FLORA = preload("res://dist/assets/flora-layer.webp")
const CRAB = preload("res://dist/assets/crab-poses-v731.webp")
const EEL = preload("res://dist/assets/eel-poses-v731.webp")
const JELLY = preload("res://dist/assets/jelly-v731.webp")
const CARLO = preload("res://dist/assets/carlo.webp")
const MUSIC = preload("res://dist/assets/bubble-bell-adventure.mp3")

const WATER_SURFACE := 280.0
const BOTTOM := 902.0
const HERO_RADIUS := 43.0
const MAX_HEALTH := 5
const BOSS_MAX_HEALTH := 5
const SWIM_SPEED := 345.0
const BOOST_SPEED := 850.0

var player := Vector2(220.0, 460.0)
var player_velocity := Vector2.ZERO
var facing := 1.0
var camera := 0.0
var time := 0.0
var health := MAX_HEALTH
var energy := 1.0
var score := 0
var picked_count := 0
var checkpoint := 220.0
var invulnerable := 0.0
var boost_time := 0.0
var boost_cooldown := 0.0
var boost_direction := Vector2.RIGHT
var jump_time := 0.0
var leap_cooldown := 0.0
var state := "playing"
var fallen := false
var message := "Swim right. Discover the waterfall and Carlo's kingdom!"
var message_time := 5.0

var obstacles: Array[Rect2] = []
var enemies: Array[Dictionary] = []
var treasures: Array[Dictionary] = []
var bubbles: Array[Dictionary] = []
var boss_hp := BOSS_MAX_HEALTH
var boss_hit_cooldown := 0.0
var boss_clock := 0.0
var bubble_unlocked := false
var bubble_shots: Array[Dictionary] = []
var last_checkpoint_message := ""
var waterfall_phase := ""
var waterfall_time := 0.0
var waterfall_x := 0.0
var waterfall_y := 0.0
var waterfall_velocity := Vector2.ZERO
var waterfall_boost := 0.0
var waterfall_boost_cooldown := 0.0
var waterfall_hazards: Array[Dictionary] = []
var waterfall_gold: Array[Dictionary] = []
var waterfall_gold_count := 0
var touches: Dictionary = {}
var music_player: AudioStreamPlayer
var native_rig: Node2D
var native_fx: Node2D
var native_boss: Node2D
var premium_hud: CanvasLayer
var water_surface: Node2D
var world_depth: Node2D
var foreground_depth: Node2D
var relief_obstacles: Node2D
var high_depth_quality := true
var reduced_fx := false
var music_muted := false
var joy_last: Dictionary = {}

func _ready() -> void:
    obstacles = Highland.obstacles()
    enemies = Highland.enemies()
    treasures = Highland.treasure()
    music_player = AudioStreamPlayer.new()
    music_player.stream = MUSIC
    music_player.volume_db = -17.0
    if music_player.stream is AudioStreamMP3:
        music_player.stream.loop = true
    add_child(music_player)
    # Headless Godot 4.4 has an MP3 playback shutdown leak. Play only with a real display.
    # This does not mute desktop, Android or browser releases.
    if DisplayServer.get_name() != "headless":
        music_player.play()
    # Godot editor-authored child scenes, ready before the level controller.
    native_fx = get_node("NativeUnderwaterFX")
    native_rig = get_node("SarahAtlasRig")
    native_boss = get_node("CarloNativeBoss")
    premium_hud = get_node("PremiumHud")
    water_surface = get_node("PaintedWaterSurface")
    world_depth = get_node("PaintedWorldDepth")
    foreground_depth = get_node("SparseForegroundDepth")
    relief_obstacles = get_node("ReliefReefObstacles")
    native_fx.set_quality(high_depth_quality)
    _sync_native_visuals()
    queue_redraw()

func _exit_tree() -> void:
    # Headless CI must release MP3 playback explicitly before ResourceCache cleanup.
    if is_instance_valid(music_player):
        music_player.stop()
        music_player.stream = null

func _input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and not event.echo:
        match event.keycode:
            KEY_ESCAPE, KEY_P:
                if state != "victory":
                    state = "paused" if state == "playing" else "playing"
            KEY_R:
                _restart()
            KEY_SPACE, KEY_SHIFT:
                _boost()
            KEY_J:
                _jump()
            KEY_B, KEY_Z:
                _fire_bubble()
            KEY_M:
                music_muted = not music_muted
                if music_muted:
                    music_player.volume_db = -80.0
                else:
                    music_player.volume_db = -17.0
                _say("Music " + ("off" if music_muted else "on"), 1.5)
            KEY_F3:
                reduced_fx = not reduced_fx
                native_fx.set_reduced_motion(reduced_fx)
                native_rig.reduced_motion = reduced_fx
                native_boss.reduced_motion = reduced_fx
                _sync_native_visuals()
                _say("Visual effects " + ("reduced" if reduced_fx else "enabled"), 1.5)
            KEY_F4:
                high_depth_quality = not high_depth_quality
                native_fx.set_quality(high_depth_quality)
                _say("3D depth effects " + ("high" if high_depth_quality else "economy"), 1.7)
            KEY_ENTER:
                if state == "victory":
                    _restart()
    elif event is InputEventScreenTouch:
        if event.pressed:
            var action := _touch_target(event.position)
            touches[event.index] = action
            _touch_action(action)
        else:
            touches.erase(event.index)
    elif event is InputEventScreenDrag:
        var action := _touch_target(event.position)
        if touches.get(event.index, "") != action:
            touches[event.index] = action
            _touch_action(action)
    queue_redraw()

func _touch_action(action: String) -> void:
    if action == "boost":
        _boost()
    elif action == "jump":
        _jump()
    elif action == "bubble":
        _fire_bubble()
    elif action == "pause":
        if state != "victory":
            state = "paused" if state == "playing" else "playing"
    elif action == "restart":
        _restart()

func _touch_target(point: Vector2) -> String:
    var s := get_viewport_rect().size
    for action in ["left", "right", "up", "down", "boost", "jump", "bubble", "pause", "restart"]:
        if _touch_rect(action, s).has_point(point):
            return action
    return ""

func _touch_rect(action: String, s: Vector2) -> Rect2:
    var y := s.y - 172.0
    match action:
        "left": return Rect2(16, y + 55, 82, 76)
        "right": return Rect2(190, y + 55, 82, 76)
        "up": return Rect2(103, y - 12, 82, 76)
        "down": return Rect2(103, y + 94, 82, 66)
        "boost": return Rect2(s.x - 225, y + 57, 102, 91)
        "jump": return Rect2(s.x - 110, y - 20, 94, 91)
        "bubble": return Rect2(s.x - 335, y - 20, 94, 91)
        "pause": return Rect2(s.x - 84, 12, 70, 52)
        "restart": return Rect2(s.x * 0.5 - 110, s.y * 0.5 + 95, 220, 65)
    return Rect2()

func _input_vector() -> Vector2:
    var direction := Vector2.ZERO
    if Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D):
        direction.x += 1.0
    if Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A):
        direction.x -= 1.0
    if Input.is_key_pressed(KEY_DOWN) or Input.is_key_pressed(KEY_S):
        direction.y += 1.0
    if Input.is_key_pressed(KEY_UP) or Input.is_key_pressed(KEY_W):
        direction.y -= 1.0
    for action in touches.values():
        match action:
            "left": direction.x -= 1.0
            "right": direction.x += 1.0
            "up": direction.y -= 1.0
            "down": direction.y += 1.0
    # Native analogue steering with radial dead zone plus the controller D-pad.
    if Input.get_connected_joypads().size() > 0:
        var stick := Vector2(Input.get_joy_axis(0, JOY_AXIS_LEFT_X), Input.get_joy_axis(0, JOY_AXIS_LEFT_Y))
        if stick.length() > 0.20:
            direction += stick
        if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_RIGHT):
            direction.x += 1.0
        if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_LEFT):
            direction.x -= 1.0
        if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_DOWN):
            direction.y += 1.0
        if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_UP):
            direction.y -= 1.0
    return direction.limit_length(1.0)

func _poll_gamepad() -> void:
    if Input.get_connected_joypads().is_empty():
        joy_last.clear()
        return
    var buttons := {
        "jump": Input.is_joy_button_pressed(0, JOY_BUTTON_A),
        "boost": Input.is_joy_button_pressed(0, JOY_BUTTON_B),
        "bubble": Input.is_joy_button_pressed(0, JOY_BUTTON_X),
        "pause": Input.is_joy_button_pressed(0, JOY_BUTTON_START)
    }
    for action in buttons:
        if buttons[action] and not joy_last.get(action, false):
            if action == "jump":
                _jump()
            elif action == "boost":
                _boost()
            elif action == "bubble":
                _fire_bubble()
            elif action == "pause" and state != "victory":
                state = "paused" if state == "playing" else "playing"
    joy_last = buttons

func _vibrate(soft: float, strong: float, duration: float) -> void:
    if not Input.get_connected_joypads().is_empty():
        Input.start_joy_vibration(0, soft, strong, duration)

func _boost() -> void:
    if state != "playing" or energy < 0.4:
        return
    if waterfall_phase != "":
        if waterfall_phase != "descent" or waterfall_boost_cooldown > 0.0:
            return
        energy -= 0.4
        var direction := _input_vector()
        if direction == Vector2.ZERO:
            direction = boost_direction
        boost_direction = direction
        waterfall_velocity = Vector2(direction.x * BOOST_SPEED / 520.0, direction.y * BOOST_SPEED)
        waterfall_boost = 0.30
        waterfall_boost_cooldown = 0.46
        native_fx.splash(_hero_screen_position(), Color("#92ffff"), 13)
        _vibrate(0.25, 0.08, 0.12)
        return
    if boost_cooldown > 0.0 or jump_time > 0.0:
        return
    energy -= 0.4
    boost_time = 0.38
    boost_cooldown = 0.55
    var direction := _input_vector()
    if direction == Vector2.ZERO:
        direction = Vector2(facing, 0)
    boost_direction = direction
    player_velocity = direction * BOOST_SPEED
    native_fx.splash(_hero_screen_position(), Color("#b4ffff"), 15)
    _vibrate(0.18, 0.07, 0.10)

func _jump() -> void:
    if state != "playing" or waterfall_phase != "" or energy < 0.4 or jump_time > 0 or leap_cooldown > 0:
        return
    energy -= 0.4
    jump_time = 1.1
    leap_cooldown = 1.5
    player_velocity = Vector2(maxf(player_velocity.x, 240.0) * facing, -780.0)
    _say("Sky leap! Steer through the air.", 1.8)
    native_fx.splash(_hero_screen_position(), Color("#e2ffff"), 22)
    _vibrate(0.24, 0.06, 0.14)

func _fire_bubble() -> void:
    if state != "playing" or not bubble_unlocked or waterfall_phase != "":
        return
    if bubble_shots.size() >= 8:
        return
    bubble_shots.append({"pos": player + Vector2(facing * 70, 0), "direction": facing, "life": 1.8})
    native_fx.splash(_hero_screen_position() + Vector2(facing * 56, 0), Color("#b4dbff"), 7)

func _say(text: String, duration: float = 3.0) -> void:
    message = text
    message_time = duration

func _process(delta: float) -> void:
    var dt := minf(delta, 0.04)
    _poll_gamepad()
    if state != "playing":
        if is_instance_valid(native_rig):
            native_rig.set_process(false)
        if is_instance_valid(premium_hud):
            premium_hud.update_hud(_hud_snapshot())
        queue_redraw()
        return
    if is_instance_valid(native_rig):
        native_rig.set_process(true)
    time += dt
    invulnerable = maxf(0.0, invulnerable - dt)
    boost_time = maxf(0.0, boost_time - dt)
    boost_cooldown = maxf(0.0, boost_cooldown - dt)
    leap_cooldown = maxf(0.0, leap_cooldown - dt)
    boss_hit_cooldown = maxf(0.0, boss_hit_cooldown - dt)
    energy = minf(1.0, energy + dt * 0.23)
    message_time = maxf(0.0, message_time - dt)
    if waterfall_phase != "":
        _update_waterfall(dt)
    else:
        _update_swimming(dt)
        _update_enemies(dt)
        _update_collectibles()
        _update_boss(dt)
        _update_bubbles(dt)
        _check_checkpoints()
    var view := get_viewport_rect().size
    # Cinematic anticipation: the view looks ahead in Sarah's direction of travel.
    var anticipation := 0.0 if waterfall_phase != "" else clampf(player_velocity.x * 0.18, -100.0, 160.0)
    var camera_target := clampf(player.x - view.x * 0.43 + anticipation, 0.0, maxf(0.0, Highland.LEVEL_LENGTH - view.x))
    camera = lerpf(camera, camera_target, 1.0 - exp(-dt * (7.2 if boost_time > 0.0 else 5.8)))
    _sync_native_visuals()
    queue_redraw()

func _hero_screen_position() -> Vector2:
    if waterfall_phase == "":
        return player - Vector2(camera, 0.0)
    var viewport := get_viewport_rect().size
    var half := minf(viewport.x * 0.40, 520.0)
    var pos := Vector2(viewport.x * 0.5 + waterfall_x * half, 384.0 + waterfall_y)
    if waterfall_phase == "pull":
        return (player - Vector2(camera, 0.0)).lerp(pos, clampf(waterfall_time / Highland.FALL_ENTRY, 0.0, 1.0))
    return pos

func _hud_snapshot() -> Dictionary:
    return {
        "health": health,
        "energy": energy,
        "score": score,
        "pearls": picked_count,
        "progress": clampf(player.x / Highland.LEVEL_LENGTH, 0.0, 1.0),
        "message": message,
        "message_time": message_time,
        "boss_active": player.x > Highland.BOSS_X - 850.0 and boss_hp > 0,
        "boss_health": float(boss_hp) / float(BOSS_MAX_HEALTH),
        "boss_vulnerable": _boss_vulnerable(),
        "bubble": bubble_unlocked,
        "paused": state == "paused",
        "victory": state == "victory",
        "touch": DisplayServer.is_touchscreen_available()
    }

func _sync_native_visuals() -> void:
    if not is_instance_valid(native_rig) or not is_instance_valid(native_fx):
        return
    var pos := _hero_screen_position()
    native_rig.position = pos
    var waterfall_active := waterfall_phase != ""
    var velocity := waterfall_velocity * Vector2(520.0, 1.0) if waterfall_active else player_velocity
    var faded := 1.0 if invulnerable <= 0.0 else 0.65 + 0.35 * absf(sin(time * 13.0))
    native_rig.set_motion(velocity, facing, boost_time > 0.0 or waterfall_boost > 0.0, jump_time > 0.0, faded)
    native_rig.rotation = clampf(velocity.y / 1150.0, -0.26, 0.26) * facing
    # Depth shaders affect scenery without refracting Sarah or covering the HUD.
    # During the waterfall, render the refractive field in front of the shaft.
    native_fx.z_index = 1 if waterfall_active else -1
    native_fx.set_motion(pos, velocity, jump_time <= 0.0)
    if is_instance_valid(world_depth):
        world_depth.visible = not waterfall_active
        world_depth.set_camera(camera, fallen, reduced_fx)
    if is_instance_valid(foreground_depth):
        foreground_depth.set_camera(camera, not waterfall_active, reduced_fx)
    if is_instance_valid(relief_obstacles):
        relief_obstacles.set_camera(camera, not waterfall_active)
    if is_instance_valid(water_surface):
        water_surface.set_scene(camera, not waterfall_active, reduced_fx)
    native_fx.set_depth_profile(fallen)
    if is_instance_valid(premium_hud):
        premium_hud.update_hud(_hud_snapshot())
    if is_instance_valid(native_boss):
        var boss_x := Highland.BOSS_X - camera
        var boss_y := 570.0 + sin(boss_clock * 1.3) * 67.0
        native_boss.set_boss_state(boss_hp, _boss_vulnerable(), boss_clock, boss_x, boss_y, get_viewport_rect().size.x)

func _update_swimming(dt: float) -> void:
    var input_dir := _input_vector()
    var previous := player
    if input_dir.x != 0.0:
        facing = signf(input_dir.x)
    if jump_time > 0.0:
        jump_time -= dt
        player_velocity.y += 1250.0 * dt
        player_velocity.x = lerpf(player_velocity.x, input_dir.x * 420.0, dt * 2.2)
        player += player_velocity * dt
        if jump_time <= 0.0 or player.y >= WATER_SURFACE + 40.0:
            jump_time = 0.0
            player.y = maxf(player.y, WATER_SURFACE + 40.0)
    elif boost_time > 0.0:
        player += player_velocity * dt
    else:
        player_velocity = player_velocity.move_toward(input_dir * SWIM_SPEED, dt * 1200.0)
        player += player_velocity * dt
        if input_dir == Vector2.ZERO:
            player.y += sin(time * 3.0) * 0.15
    player.x = clampf(player.x, 50.0 if not fallen else Highland.WATERFALL_EXIT, Highland.LEVEL_LENGTH - 40.0)
    player.y = clampf(player.y, 80.0 if jump_time > 0 else WATER_SURFACE + 45.0, BOTTOM - 26.0)
    for obstacle in obstacles:
        if obstacle.grow(HERO_RADIUS * 0.73).has_point(player):
            player = previous
            player_velocity *= 0.25
            break
    if not fallen and player.x >= Highland.WATERFALL_START and jump_time <= 0:
        _start_waterfall()
        return
    if player.x >= Highland.PORTAL_X and boss_hp <= 0:
        state = "victory"
        _say("Highland Gold complete! Mermaid Bubble unlocked.", 1000.0)

func _check_checkpoints() -> void:
    var positions := [
        [2770.0, "Waterfall inlet"],
        [Highland.route_x(6500.0), "Secret Grotto"],
        [Highland.route_x(9050.0), "Kelp Cathedral"],
        [Highland.route_x(11700.0), "Shell Ruins"],
        [Highland.route_x(13720.0), "Carlo's Court"]
    ]
    for item in positions:
        if player.x > float(item[0]) and checkpoint < float(item[0]):
            checkpoint = float(item[0])
            health = MAX_HEALTH
            _say("Checkpoint: " + String(item[1]))
    if player.x > Highland.BOSS_X - 900 and checkpoint < Highland.BOSS_X - 1000:
        checkpoint = Highland.BOSS_X - 900
        _say("Checkpoint: Carlo's arena")

func _update_enemies(dt: float) -> void:
    for enemy in enemies:
        if int(enemy["hp"]) <= 0:
            continue
        if absf(float(enemy["x"]) - player.x) > 1200:
            continue
        var kind: String = enemy["kind"]
        var phase := float(enemy["phase"])
        var bx := float(enemy["bx"])
        if kind == "crab":
            var direction := float(enemy["dir"])
            var ex := float(enemy["x"]) + direction * dt * 110.0
            if ex < float(enemy["min"]) or ex > float(enemy["max"]):
                direction *= -1.0
                enemy["dir"] = int(direction)
                ex = clampf(ex, float(enemy["min"]), float(enemy["max"]))
            enemy["x"] = ex
            enemy["y"] = 832.0 + sin(time * 9.0 + phase) * 5.0
        else:
            enemy["x"] = bx + sin(time * (1.0 + phase * 0.025) + phase) * (68.0 if kind == "eel" else 37.0)
            enemy["y"] = float(enemy["by"]) + cos(time * 1.6 + phase) * (55.0 if kind == "eel" else 30.0)
        var pos := Vector2(float(enemy["x"]), float(enemy["y"]))
        var radius := 96.0 if kind == "eel" else 79.0
        if player.distance_to(pos) < radius:
            if boost_time > 0.0:
                enemy["hp"] = 0
                score += 50
                _say("Boost boop! +50", 1.1)
                native_fx.splash(pos - Vector2(camera, 0), Color("#e5ffce"), 17)
                _vibrate(0.22, 0.08, 0.12)
            else:
                _damage(pos)

func _update_collectibles() -> void:
    for treasure in treasures:
        if treasure["taken"]:
            continue
        var pos := Vector2(float(treasure["x"]), float(treasure["y"]))
        if player.distance_to(pos) < 59.0:
            treasure["taken"] = true
            var kind: String = treasure["kind"]
            if kind == "heart":
                health = mini(MAX_HEALTH, health + 1)
                _say("Heart restored!", 1.3)
            elif kind == "boost":
                energy = 1.0
                _say("Boost crystal!", 1.3)
            else:
                score += 100 if kind == "chest" else 10
                picked_count += 1
                if kind == "chest":
                    _say("Treasure chest! +100", 1.4)
                    native_fx.splash(pos - Vector2(camera, 0), Color("#ffeaaa"), 29)
                elif picked_count % 5 == 0:
                    native_fx.splash(pos - Vector2(camera, 0), Color("#b2feff"), 12)

func _damage(from_pos: Vector2) -> void:
    if invulnerable > 0.0 or state != "playing" or jump_time > 0.0:
        return
    health -= 1
    invulnerable = 1.5
    player_velocity = (player - from_pos).normalized() * 240.0
    _say("Ouch! Careful, Sarah.", 1.6)
    native_fx.flash(Color("#ff9bad"), 0.27, 0.33)
    native_fx.splash(_hero_screen_position(), Color("#ffc1cb"), 14)
    _vibrate(0.65, 0.42, 0.20)
    if health <= 0:
        _respawn()

func _respawn() -> void:
    health = MAX_HEALTH
    energy = 1.0
    jump_time = 0.0
    boost_time = 0.0
    waterfall_phase = ""
    fallen = checkpoint >= Highland.WATERFALL_EXIT
    player = Vector2(checkpoint, 480.0)
    player_velocity = Vector2.ZERO
    invulnerable = 2.0
    _say("Back to your checkpoint!", 2.6)

func _update_boss(dt: float) -> void:
    if player.x < Highland.BOSS_X - 850.0 or boss_hp <= 0:
        return
    boss_clock += dt
    var vulnerable := _boss_vulnerable()
    var boss_pos := Vector2(Highland.BOSS_X, 570.0 + sin(boss_clock * 1.3) * 67.0)
    if player.distance_to(boss_pos) < 180.0:
        if boost_time > 0.0 and vulnerable and boss_hit_cooldown <= 0:
            boss_hp -= 1
            boss_hit_cooldown = 1.15
            invulnerable = 0.65
            score += 200
            _say("Carlo hit! " + str(boss_hp) + " hearts remaining.", 1.8)
            native_fx.splash(boss_pos - Vector2(camera, 0), Color("#fff1a4"), 32)
            native_fx.flash(Color("#ffffc1"), 0.17, 0.22)
            native_boss.play_hit()
            _vibrate(0.32, 0.40, 0.22)
            if boss_hp == 0:
                score += 1000
                bubble_unlocked = true
                _say("Carlo defeated! Mermaid Bubble unlocked. Find the portal!", 7.0)
                native_boss.defeat()
                native_fx.splash(boss_pos - Vector2(camera, 0), Color("#b5ffdc"), 48)
        elif boost_time <= 0.0:
            _damage(boss_pos)
    if boss_hp > 0 and fmod(boss_clock, 6.0) > 4.9 and player.distance_to(boss_pos) < 450.0:
        if absf(player.y - boss_pos.y) < 110.0:
            _damage(boss_pos)

func _boss_vulnerable() -> bool:
    return fmod(boss_clock, 5.5) > 2.3 and fmod(boss_clock, 5.5) < 4.4

func _update_bubbles(dt: float) -> void:
    for shot in bubble_shots:
        shot["pos"] = Vector2(shot["pos"]) + Vector2(float(shot["direction"]) * 700.0 * dt, 0)
        shot["life"] = float(shot["life"]) - dt
        for enemy in enemies:
            if int(enemy["hp"]) <= 0:
                continue
            if Vector2(shot["pos"]).distance_to(Vector2(float(enemy["x"]), float(enemy["y"]))) < 70.0:
                enemy["hp"] = 0
                shot["life"] = 0.0
                score += 50
                break
    bubble_shots = bubble_shots.filter(func(shot): return float(shot["life"]) > 0.0)

func _start_waterfall() -> void:
    waterfall_phase = "pull"
    waterfall_time = 0.0
    waterfall_x = 0.0
    waterfall_y = 0.0
    waterfall_velocity = Vector2.ZERO
    waterfall_hazards = Highland.waterfall_hazards()
    waterfall_gold = Highland.waterfall_gold()
    waterfall_gold_count = 0
    checkpoint = 2770.0
    boost_time = 0.0
    player_velocity = Vector2.ZERO
    _say("The waterfall! Swim in all four directions. Boost to dodge!", 5.0)
    native_fx.flash(Color("#a5ffff"), 0.30, 0.90)
    if not music_muted:
        create_tween().tween_property(music_player, "volume_db", -23.0, 1.1)

func _update_waterfall(dt: float) -> void:
    waterfall_time += dt
    if waterfall_phase == "pull":
        if waterfall_time >= Highland.FALL_ENTRY:
            waterfall_phase = "descent"
            waterfall_time = 0.0
        return
    if waterfall_phase == "outflow":
        if waterfall_time >= Highland.FALL_EXIT:
            waterfall_phase = ""
            fallen = true
            player = Vector2(Highland.WATERFALL_EXIT, 610.0)
            camera = player.x - get_viewport_rect().size.x * 0.4
            checkpoint = Highland.WATERFALL_EXIT
            invulnerable = 1.5
            _say("Secret Grotto! Keep swimming right.", 4.0)
            native_fx.flash(Color("#e0ffff"), 0.18, 0.45)
            if not music_muted:
                create_tween().tween_property(music_player, "volume_db", -17.0, 1.0)
        return
    waterfall_boost = maxf(0.0, waterfall_boost - dt)
    waterfall_boost_cooldown = maxf(0.0, waterfall_boost_cooldown - dt)
    var direction := _input_vector()
    if direction != Vector2.ZERO:
        boost_direction = direction
        if direction.x != 0:
            facing = signf(direction.x)
    var half := minf(get_viewport_rect().size.x * 0.40, 520.0)
    var swirl := sin(waterfall_time * 1.4) * 0.18 if waterfall_time > 4.0 else 0.0
    if waterfall_boost <= 0:
        var target := Vector2(direction.x * 430.0 / half + swirl, direction.y * 430.0)
        waterfall_velocity = waterfall_velocity.lerp(target, 1.0 - exp(-dt * 9.0))
    waterfall_x = clampf(waterfall_x + waterfall_velocity.x * dt, -0.84, 0.84)
    waterfall_y = clampf(waterfall_y + waterfall_velocity.y * dt, -145.0, 205.0)
    var hero_x := get_viewport_rect().size.x * 0.5 + waterfall_x * half
    var hero_y := 384.0 + waterfall_y
    # Dispersed spray and foam respond to the shaft's downward current.
    for i in range(18):
        var shift := sin(float(i) * 8.7) * half * 0.87
        var yy := fposmod(float(i) * 71.0 + waterfall_time * 240.0, s.y + 100.0) - 50.0
        var spray_x := cx + shift + sin(time * 1.6 + float(i)) * 8.0
        draw_circle(Vector2(spray_x, yy), 2.0 + float(i % 3),
            Color(0.83, 1.0, 0.98, 0.12 + 0.08 * float(i % 2)))
    for hazard in waterfall_hazards:
        if hazard["passed"]:
            continue
        var age := float(hazard["at"]) - waterfall_time
        if age * 350.0 < -290.0:
            hazard["passed"] = true
            continue
        var h_x := get_viewport_rect().size.x * 0.5 + float(hazard["x"]) * half
        var h_y := 384.0 + age * 350.0
        var radius := 100.0 if hazard["kind"] == "reef" else 76.0
        if absf(hero_x - h_x) < radius and absf(hero_y - h_y) < 85.0:
            if waterfall_boost > 0 and hazard["kind"] != "reef":
                hazard["passed"] = true
                score += 50
            elif invulnerable <= 0.0:
                _damage(Vector2(player.x + h_x - hero_x, player.y + h_y - hero_y))
    for pearl in waterfall_gold:
        if pearl["taken"]:
            continue
        var p_x := get_viewport_rect().size.x * 0.5 + float(pearl["x"]) * half
        var p_y := 384.0 + (float(pearl["at"]) - waterfall_time) * 350.0
        if absf(hero_x - p_x) < 66.0 and absf(hero_y - p_y) < 62.0:
            pearl["taken"] = true
            waterfall_gold_count += 1
            picked_count += 1
            score += 20
    if waterfall_time >= Highland.FALL_DURATION:
        waterfall_phase = "outflow"
        waterfall_time = 0.0
        _say("There it is — the secret grotto!", 3.0)

func _restart() -> void:
    player = Vector2(220.0, 460.0)
    player_velocity = Vector2.ZERO
    camera = 0.0
    time = 0.0
    health = MAX_HEALTH
    energy = 1.0
    score = 0
    picked_count = 0
    checkpoint = 220.0
    invulnerable = 0.0
    boost_time = 0.0
    boost_cooldown = 0.0
    jump_time = 0.0
    leap_cooldown = 0.0
    boss_clock = 0.0
    boss_hp = BOSS_MAX_HEALTH
    boss_hit_cooldown = 0.0
    if is_instance_valid(native_boss):
        native_boss.reset_boss()
    bubble_unlocked = false
    bubble_shots.clear()
    fallen = false
    waterfall_phase = ""
    touches.clear()
    obstacles = Highland.obstacles()
    enemies = Highland.enemies()
    treasures = Highland.treasure()
    state = "playing"
    _say("Highland Gold — your adventure begins!", 3.0)
    if is_instance_valid(native_fx):
        native_fx.flash(Color("#d6ffff"), 0.16, 0.4)
    if is_instance_valid(premium_hud):
        premium_hud.update_hud(_hud_snapshot())

func _draw() -> void:
    var s := get_viewport_rect().size
    # Godot's native PaintedWorldDepth is the opaque 2.5D underlay.
    # Keep the solid colour as a fallback if the compositor is absent.
    if not is_instance_valid(world_depth):
        draw_rect(Rect2(Vector2.ZERO, s), Color("#09283f"))
    if waterfall_phase == "descent" or waterfall_phase == "pull" or waterfall_phase == "outflow":
        _draw_waterfall(s)
    else:
        _draw_world(s)
    # All text/UI is now drawn by PremiumHud on a separate CanvasLayer.
    # It remains crisp and remains legible above GPU post-processing.

func _draw_world(s: Vector2) -> void:
    # The backdrop and gardens now come from the GPU-shaded, depth-separated
    # Godot world plane; never repaint its source image as a second ghost layer.
    draw_rect(Rect2(0, WATER_SURFACE, s.x, s.y - WATER_SURFACE), Color(0.01, 0.17, 0.28, 0.075))
    # PaintedWaterSurface draws the 3-frequency animated specular waterline.
    for i in range(20):
        var x := fposmod(float(i) * 223.0 - camera * 0.37 + time * (9.0 + float(i % 4)), s.x + 120.0) - 50.0
        var y := WATER_SURFACE + 80.0 + fmod(float(i) * 133.0, maxf(10.0, s.y - WATER_SURFACE - 90.0))
        draw_circle(Vector2(x, y), 2.5 + float(i % 3), Color(0.72, 1.0, 0.97, 0.34))
    # Far and medium garden textures are rendered by PaintedWorldDepth.
    for index in range(obstacles.size()):
        var r := obstacles[index]
        var x := r.position.x - camera
        if x > s.x + 160.0 or x + r.size.x < -160.0:
            continue
        # Actual textured geometry is the native ReliefReefObstacles node.
        if index % 2 == 0:
            draw_circle(Vector2(x + r.size.x * 0.5, r.position.y + r.size.y * 0.5), 9.0, Color(0.41, 0.95, 0.93, 0.18))
    if not fallen:
        var fall_x := 3220.0 - camera
        if fall_x > -230 and fall_x < s.x + 230:
            draw_rect(Rect2(fall_x - 125, WATER_SURFACE, 250, s.y - WATER_SURFACE), Color("#b0fff7", 0.18))
            for i in range(9):
                var yy := WATER_SURFACE + fposmod(float(i) * 97.0 + time * 160.0, s.y - WATER_SURFACE)
                draw_line(Vector2(fall_x + sin(time * 2.0 + i) * 93.0, yy), Vector2(fall_x + sin(time * 2.0 + i) * 72.0, yy + 70), Color(0.81, 1.0, 1.0, 0.42), 3.0)
    for treasure in treasures:
        if treasure["taken"]:
            continue
        var x := float(treasure["x"]) - camera
        if x < -80 or x > s.x + 80:
            continue
        var y := float(treasure["y"]) + sin(time * 2.0 + float(treasure["phase"])) * 5.0
        _draw_collectible(Vector2(x, y), String(treasure["kind"]))
    for enemy in enemies:
        if int(enemy["hp"]) <= 0:
            continue
        var x := float(enemy["x"]) - camera
        if x < -200 or x > s.x + 200:
            continue
        _draw_enemy(enemy, Vector2(x, float(enemy["y"])))
    if player.x > Highland.BOSS_X - s.x - 200 or camera > Highland.BOSS_X - s.x - 200:
        _draw_boss()
    for shot in bubble_shots:
        var pos := Vector2(shot["pos"]) - Vector2(camera, 0)
        draw_circle(pos, 24.0, Color(0.55, 0.96, 1.0, 0.45))
        draw_arc(pos, 20.0, 0, TAU, 40, Color("#d9ffff"), 3.0)
    if boss_hp <= 0:
        var portal_x := Highland.PORTAL_X - camera
        if portal_x > -150 and portal_x < s.x + 150:
            draw_arc(Vector2(portal_x, 530), 95.0, 0, TAU, 80, Color("#ffe79c"), 11.0)
            draw_arc(Vector2(portal_x, 530), 81.0, 0, TAU, 80, Color("#a1ffff"), 4.0)
    _draw_hero(player - Vector2(camera, 0))
    draw_rect(Rect2(0, s.y - 60, s.x, 60), Color(0.02, 0.14, 0.24, 0.24))

func _draw_collectible(pos: Vector2, kind: String) -> void:
    var pulse := 1.0 + sin(time * 3.1 + pos.x * 0.015) * 0.065
    var r := 21.0 * pulse
    if kind == "heart":
        draw_circle(pos, r + 7.0, Color(0.93, 0.39, 0.67, 0.14))
        draw_circle(pos + Vector2(-9, -5), 15.0, Color("#f580a8"))
        draw_circle(pos + Vector2(9, -5), 15.0, Color("#f580a8"))
        draw_colored_polygon(PackedVector2Array([
            pos + Vector2(-24, -2), pos + Vector2(24, -2),
            pos + Vector2(0, 28)]), Color("#f580a8"))
        draw_circle(pos + Vector2(-10, -10), 5, Color(1.0, 0.93, 0.98, 0.72))
        draw_arc(pos, 31.0, time * 0.4, time * 0.4 + PI * 0.78, 19,
            Color(1, 0.84, 0.94, 0.35), 2.0, true)
    elif kind == "boost":
        draw_circle(pos, r + 13.0, Color(0.15, 0.96, 0.83, 0.16))
        draw_colored_polygon(PackedVector2Array([
            pos + Vector2(0, -29), pos + Vector2(24, -5), pos + Vector2(0, 29),
            pos + Vector2(-24, -5)]), Color("#41d9d6"))
        draw_colored_polygon(PackedVector2Array([
            pos + Vector2(0, -24), pos + Vector2(0, 25),
            pos + Vector2(18, -4)]), Color("#c3fff3"))
        draw_line(pos + Vector2(-4, -19), pos + Vector2(9, -9), Color.WHITE, 3)
        draw_arc(pos, 32.0, time * 1.4, time * 1.4 + PI * 0.5, 15,
            Color(0.61, 1.0, 0.95, 0.66), 2.0, true)
    elif kind == "chest":
        draw_circle(pos, 45.0, Color(1.0, 0.72, 0.35, 0.12))
        draw_rect(Rect2(pos + Vector2(-31, -15), Vector2(62, 43)), Color("#623b36"))
        draw_rect(Rect2(pos + Vector2(-33, -28), Vector2(66, 24)), Color("#e5a854"))
        draw_rect(Rect2(pos + Vector2(-30, -24), Vector2(60, 7)), Color("#ffe1a2"))
        draw_rect(Rect2(pos + Vector2(-6, -19), Vector2(12, 47)), Color("#eec775"))
        draw_circle(pos + Vector2(0, 4), 6, Color("#fff0bd"))
        draw_line(pos + Vector2(-24, 17), pos + Vector2(24, 17), Color("#d89c56"), 3)
    else:
        draw_circle(pos, r + 7, Color(0.22, 0.78, 1.0, 0.18))
        draw_circle(pos, r, Color(0.70, 0.93, 1.0, 0.73))
        draw_circle(pos, r * 0.72, Color("#e6faff"))
        draw_circle(pos + Vector2(-6, -7), 5, Color(1, 1, 1, 0.87))
        draw_arc(pos, r + 3, PI * 0.9, PI * 1.65, 14, Color("#fff7dd"), 2)
    # Sparse four-point sparkle reads better than dozens of particle sprites.
    if int(floor(time * 1.8 + pos.x * 0.007)) % 4 == 0:
        var sp := pos + Vector2(r + 13, -r - 7)
        draw_line(sp + Vector2(-6, 0), sp + Vector2(6, 0), Color(1, 1, 1, 0.69), 2)
        draw_line(sp + Vector2(0, -6), sp + Vector2(0, 6), Color(1, 1, 1, 0.69), 2)

func _draw_enemy(enemy: Dictionary, pos: Vector2) -> void:
    var kind: String = enemy["kind"]
    var ph := time * 3.0 + float(enemy["phase"])
    if kind == "crab" or kind == "eel":
        var texture: Texture2D = CRAB if kind == "crab" else EEL
        var frame := int(time * (6.0 if kind == "crab" else 4.0) + float(enemy["phase"])) % 4
        var cell_width := float(texture.get_width()) / 4.0
        var source := Rect2(float(frame) * cell_width, 0, cell_width, texture.get_height())
        var w := 155.0 if kind == "crab" else 185.0
        var h := 124.0 if kind == "crab" else 110.0
        draw_circle(pos, 81.0 if kind == "crab" else 94.0,
            Color(0.96, 0.51, 0.33, 0.075) if kind == "crab" else Color(0.25, 0.95, 1.0, 0.08))
        draw_texture_rect_region(texture,
            Rect2(pos.x - w * 0.5, pos.y - h * 0.5 + sin(ph) * 2.0, w, h), source)
        if kind == "eel":
            draw_arc(pos, 95.0, -0.62, 0.75, 22, Color(0.48, 1.0, 1.0, 0.23), 2.0)
    elif kind == "jelly":
        var halo := 0.08 + 0.034 * sin(ph)
        draw_circle(pos + Vector2(0, -9), 68.0, Color(0.71, 0.64, 1.0, halo))
        draw_texture_rect(JELLY, Rect2(pos.x - 48, pos.y - 72, 96, 144), false)
        draw_arc(pos + Vector2(0, -16), 42.0, -PI * 0.8, -PI * 0.1, 20,
            Color(0.82, 0.95, 1.0, 0.32), 2.0)
    elif kind == "puffer":
        _draw_puffer(pos, ph)
    elif kind == "swordfish":
        _draw_swordfish(pos, ph)
    else:
        _draw_puffer(pos, ph)

func _draw_puffer(pos: Vector2, phase: float) -> void:
    var wobble := sin(phase) * 0.07
    draw_set_transform(pos, wobble, Vector2.ONE)
    draw_circle(Vector2.ZERO, 62.0, Color(0.23, 0.86, 0.84, 0.11))
    # Finlets and soft coral quills, all sharing the same anatomical silhouette.
    for i in range(10):
        var theta := TAU * float(i) / 10.0 + 0.12
        var a := Vector2(cos(theta), sin(theta))
        var b := Vector2(-a.y, a.x)
        var base := a * 36.0
        draw_colored_polygon(PackedVector2Array([
            base + b * 8.0, base + a * 15.0, base - b * 8.0]), Color("#b0d99b"))
    draw_circle(Vector2(0, 3), 43.0, Color("#399f9d"))
    draw_circle(Vector2(-4, -2), 36.0, Color("#a6e2bd"))
    draw_circle(Vector2(9, 14), 23.0, Color("#e7d9a5"))
    draw_circle(Vector2(20, -15), 9.0, Color("#f5fff0"))
    draw_circle(Vector2(23, -15), 4.4, Color("#1b4657"))
    draw_circle(Vector2(24, -16), 1.5, Color.WHITE)
    draw_circle(Vector2(35, 7), 4.1, Color("#6a5362"))
    draw_circle(Vector2(-22, 8), 8.0, Color("#58bdb6"))
    draw_arc(Vector2(-6, -14), 18.0, PI * 1.13, PI * 1.65, 14,
        Color(1, 1, 1, 0.39), 3.0)
    draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

func _draw_swordfish(pos: Vector2, phase: float) -> void:
    var bank := sin(phase * 0.8) * 0.07
    draw_set_transform(pos, bank, Vector2.ONE)
    draw_circle(Vector2(-3, 0), 78.0, Color(0.28, 0.71, 1.0, 0.07))
    draw_colored_polygon(PackedVector2Array([
        Vector2(-60, -15), Vector2(-92, -36), Vector2(-77, 0),
        Vector2(-96, 32), Vector2(-54, 18)]), Color("#3c99b7"))
    draw_colored_polygon(PackedVector2Array([
        Vector2(-27, -23), Vector2(-9, -50), Vector2(14, -20)]), Color("#367eaa"))
    draw_colored_polygon(PackedVector2Array([
        Vector2(-61, -21), Vector2(12, -32), Vector2(54, -10),
        Vector2(62, 6), Vector2(12, 29), Vector2(-55, 18)]), Color("#2788a9"))
    draw_colored_polygon(PackedVector2Array([
        Vector2(-53, 4), Vector2(26, 5), Vector2(58, 1),
        Vector2(10, 24), Vector2(-51, 16)]), Color("#b3e1c8"))
    draw_colored_polygon(PackedVector2Array([
        Vector2(45, -9), Vector2(115, -15), Vector2(46, 1)]), Color("#8cd5e9"))
    draw_circle(Vector2(39, -9), 6.5, Color("#e6ffff"))
    draw_circle(Vector2(42, -9), 3.5, Color("#163a51"))
    draw_line(Vector2(-38, -19), Vector2(21, -23), Color(0.93, 1.0, 0.95, 0.33), 2.0)
    draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

func _draw_boss() -> void:
    if boss_hp <= 0:
        return
    var x := Highland.BOSS_X - camera
    if x < -360 or x > get_viewport_rect().size.x + 360:
        return
    var y := 570.0 + sin(boss_clock * 1.3) * 67.0
    var glow := Color(0.28, 1.0, 0.58, 0.22) if _boss_vulnerable() else Color(1.0, 0.44, 0.47, 0.18)
    draw_circle(Vector2(x, y), 180.0, glow)
    if not is_instance_valid(native_boss):
        draw_texture_rect(CARLO, Rect2(x - 162, y - 180, 324, 352), false)
    draw_rect(Rect2(x - 140, y - 206, 280, 15), Color("#123349"))
    draw_rect(Rect2(x - 140, y - 206, 280.0 * float(boss_hp) / BOSS_MAX_HEALTH, 15), Color("#80ffc8") if _boss_vulnerable() else Color("#ffba8a"))
    _draw_text(Vector2(x - 90, y - 220), "CARLO", 25, Color("#fff0d1"))

func _draw_hero(pos: Vector2) -> void:
    var opacity := 1.0 if invulnerable <= 0.0 else 0.58 + 0.42 * absf(sin(time * 13.0))
    var tilt := clampf(player_velocity.y / 1150.0, -0.30, 0.30) * facing
    var bob := sin(time * 5.0) * 3.0 if jump_time <= 0.0 else 0.0
    draw_set_transform(pos + Vector2(0, bob), tilt, Vector2(facing, 1.0))
    # The character is now a native articulated Sprite2D hierarchy; keep fallback only.
    if not is_instance_valid(native_rig):
        draw_texture_rect(HERO, Rect2(-115, -77, 230, 154), false, Color(1, 1, 1, opacity))
    draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
    if boost_time > 0.0 or waterfall_boost > 0.0:
        for i in range(5):
            draw_circle(pos - boost_direction * float(25 + i * 25), float(12 - i), Color(0.7, 1.0, 1.0, 0.23))

func _draw_waterfall(s: Vector2) -> void:
    draw_texture_rect(BACKGROUND, Rect2(0, 0, s.x, s.y), false, Color("#a4c7e2"))
    draw_rect(Rect2(0, 0, s.x, s.y), Color(0.012, 0.11, 0.23, 0.72))
    var half := minf(s.x * 0.40, 520.0)
    var cx := s.x * 0.5
    # Opaque rock banks use existing painted reef material, split into three
    # natural-height sections instead of one visibly stretched billboard.
    var cliff := clampf(s.x * 0.085, 75.0, 122.0)
    draw_rect(Rect2(cx - half - cliff, 0, cliff, s.y), Color("#123946"))
    draw_rect(Rect2(cx + half, 0, cliff, s.y), Color("#123946"))
    var piece_height := s.y / 3.0 + 8.0
    for i in range(3):
        var y := float(i) * (s.y / 3.0) - 4.0
        var tint := Color(0.46, 0.78, 0.77, 0.44 - float(i) * 0.055)
        draw_texture_rect(REEF, Rect2(cx - half - cliff, y, cliff, piece_height), false, tint)
        draw_texture_rect(REEF, Rect2(cx + half, y, cliff, piece_height), false, tint)
    draw_line(Vector2(cx - half, 0), Vector2(cx - half, s.y), Color(0.67, 0.98, 0.94, 0.29), 4.0)
    draw_line(Vector2(cx + half, 0), Vector2(cx + half, s.y), Color(0.67, 0.98, 0.94, 0.29), 4.0)
    # Distant shafts pass behind hazards and pearls; no duplicate transparent walls.
    for i in range(7):
        var fraction := float(i + 1) / 8.0
        var xx := cx + (fraction * 2.0 - 1.0) * half
        var alpha := 0.027 + float(i % 3) * 0.013
        draw_line(Vector2(xx, 30), Vector2(xx + sin(time * 0.7 + i) * 18.0, s.y),
            Color(0.72, 1.0, 0.98, alpha), 17.0 if i % 2 == 0 else 10.0)
    for i in range(33):
        var xx := cx + sin(float(i) * 6.2) * half * 0.93
        var yy := fposmod(float(i) * 91.0 - waterfall_time * 260.0, s.y + 100.0) - 50.0
        draw_line(Vector2(xx, yy), Vector2(xx + sin(time * 2.0 + float(i)) * 8.0, yy + 55), Color(0.73, 1.0, 1.0, 0.20 if i % 3 else 0.40), 2.0)
    for hazard in waterfall_hazards:
        if hazard["passed"]:
            continue
        var yy := 384.0 + (float(hazard["at"]) - waterfall_time) * 350.0
        if yy < -180 or yy > s.y + 180:
            continue
        var xx := cx + float(hazard["x"]) * half
        var kind: String = hazard["kind"]
        if kind == "eel":
            var src := Rect2(0, 0, float(EEL.get_width()) * 0.25, EEL.get_height())
            draw_texture_rect_region(EEL, Rect2(xx - 105, yy - 60, 210, 120), src)
        elif kind == "jelly":
            draw_texture_rect(JELLY, Rect2(xx - 51, yy - 70, 102, 140), false)
        elif kind == "reef":
            draw_texture_rect(REEF, Rect2(xx - 115, yy - 90, 230, 180), false)
        else:
            draw_circle(Vector2(xx, yy), 48, Color("#b8deab"))
    for pearl in waterfall_gold:
        if pearl["taken"]:
            continue
        var yy := 384.0 + (float(pearl["at"]) - waterfall_time) * 350.0
        if yy < -50 or yy > s.y + 50:
            continue
        _draw_collectible(Vector2(cx + float(pearl["x"]) * half, yy), "pearl")
    var hero_pos := Vector2(cx + waterfall_x * half, 384.0 + waterfall_y)
    if waterfall_phase == "pull":
        var u := clampf(waterfall_time / Highland.FALL_ENTRY, 0.0, 1.0)
        hero_pos = (player - Vector2(camera, 0)).lerp(hero_pos, u)
    _draw_hero(hero_pos)
    draw_rect(Rect2(cx - half, 88, half * 2.0 * clampf(waterfall_time / Highland.FALL_DURATION, 0, 1), 7), Color("#a5ffeb"))
    _draw_text(Vector2(cx - 150, 74), "THE WATERFALL", 29, Color("#f5ffff"))

func _draw_hud(s: Vector2) -> void:
    draw_rect(Rect2(12, 10, s.x - 24, 79), Color(0.035, 0.13, 0.22, 0.75))
    _draw_text(Vector2(30, 46), "HIGHLAND GOLD", 27, Color("#fff2d2"))
    _draw_text(Vector2(30, 76), "Carlo's Cold Kingdom", 18, Color("#b4edee"))
    if s.x >= 1100:
        _draw_text(Vector2(s.x - 380, 72), "F3: MOTION   F4: DEPTH   M: MUSIC", 14, Color("#b4edee"))
    for i in range(MAX_HEALTH):
        draw_circle(Vector2(315.0 + float(i) * 29.0, 43.0), 11.0, Color("#ff8eb9") if i < health else Color("#465568"))
    _draw_text(Vector2(490, 48), "SCORE  " + str(score), 23, Color("#fff1bc"))
    draw_rect(Rect2(700, 29, 178, 20), Color("#25495e"))
    draw_rect(Rect2(700, 29, 178 * energy, 20), Color("#72ead9"))
    _draw_text(Vector2(705, 70), "BOOST", 18, Color("#d9fffd"))
    _draw_text(Vector2(905, 47), "PEARLS  " + str(picked_count), 21, Color("#d9fbff"))
    var progress := clampf(player.x / Highland.LEVEL_LENGTH, 0.0, 1.0)
    draw_rect(Rect2(12, s.y - 11, s.x - 24, 6), Color("#123a54"))
    draw_rect(Rect2(12, s.y - 11, (s.x - 24.0) * progress, 6), Color("#f7d78b"))
    if message_time > 0.0 and state == "playing":
        var width := minf(s.x - 36.0, 900.0)
        var start := (s.x - width) * 0.5
        draw_rect(Rect2(start, 118, width, 59), Color(0.025, 0.17, 0.28, 0.76))
        _draw_text(Vector2(start + 21, 155), message, 21, Color("#f3fff5"))
    if player.x > Highland.BOSS_X - 850.0 and boss_hp > 0:
        _draw_text(Vector2(s.x * 0.5 - 215, 200), "CARLO: BOOST WHEN HE GLOWS GREEN", 23, Color("#ffeed1"))
    if bubble_unlocked:
        _draw_text(Vector2(s.x - 287, 76), "B / Z : BUBBLE", 20, Color("#aeffee"))

func _draw_text(pos: Vector2, value: String, font_size: int = 23, color: Color = Color.WHITE) -> void:
    draw_string(ThemeDB.fallback_font, pos, value, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, color)

func _draw_touch_controls(s: Vector2) -> void:
    for action in ["left", "right", "up", "down", "boost", "jump", "bubble", "pause"]:
        if action == "bubble" and not bubble_unlocked:
            continue
        var rect := _touch_rect(action, s)
        draw_rect(rect, Color(0.04, 0.21, 0.30, 0.70))
        var labels := {"left": "LEFT", "right": "RIGHT", "up": "UP", "down": "DOWN", "boost": "BOOST", "jump": "JUMP", "bubble": "BUBBLE", "pause": "II"}
        _draw_text(rect.position + Vector2(8, rect.size.y * 0.60), labels[action], 20, Color("#eafffa"))

func _draw_overlay(s: Vector2) -> void:
    draw_rect(Rect2(Vector2.ZERO, s), Color(0.015, 0.075, 0.11, 0.78))
    var center := s * 0.5
    var heading := "LEVEL COMPLETE" if state == "victory" else "PAUSED"
    _draw_text(center + Vector2(-160, -70), heading, 45, Color("#fff0cb"))
    _draw_text(center + Vector2(-174, -20), "Score: " + str(score) + "   |   Collected: " + str(picked_count), 25, Color("#c7fff6"))
    _draw_text(center + Vector2(-220, 33), "Press P to resume, or R to restart" if state == "paused" else "Press Enter or R to play again", 22, Color("#f1fdff"))
    if DisplayServer.is_touchscreen_available():
        var rect := _touch_rect("restart", s)
        draw_rect(rect, Color("#268d93"))
        _draw_text(rect.position + Vector2(48, 43), "RESTART", 23, Color.WHITE)
