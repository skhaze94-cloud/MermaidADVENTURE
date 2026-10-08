extends SceneTree
## Headless behaviour test: source geometry, waterfall timing, pickup and portal.

var failures := 0

func _initialize() -> void:
    call_deferred("_run_checks")

func _check(condition: bool, reason: String) -> void:
    if not condition:
        failures += 1
        push_error("GODOT LEVEL 1 TEST FAILURE: " + reason)

func _run_checks() -> void:
    var level = load("res://godot/highland_level.tscn").instantiate()
    root.add_child(level)
    # Native-Godot v0.2: these are real editor scene nodes, not HTML-style canvas sprites.
    _check(level.native_rig.get_node("TailBase") is Node2D, "Articulated Sarah tail missing")
    _check(level.native_rig.get_node("Torso/HeadNeck") is Node2D, "Native face joint missing")
    _check(level.native_rig.get_node("Torso/NearArm") is Node2D, "Native arm joint missing")
    _check(level.native_fx.water_overlay.material is ShaderMaterial, "Water GPU shader missing")
    # 0.3: all depth planes and passes must be native render resources.
    _check(level.world_depth.background.material is ShaderMaterial, "Painted background shader missing")
    _check(level.world_depth.far_entries.size() == 25, "Far garden plane missing")
    _check(level.world_depth.middle_entries.size() == 33, "Mid garden plane missing")
    _check(level.foreground_depth.entries.size() == 18, "Foreground parallax silhouettes missing")
    _check(level.relief_obstacles.sprites.size() == 19, "Native reef collision texture sprites missing")
    _check(level.relief_obstacles.sprites[0].material is ShaderMaterial, "Raised reef material shader missing")
    _check(level.world_depth.z_index < level.relief_obstacles.z_index, "Deep reefs must draw behind obstacles")
    _check(level.relief_obstacles.z_index <= level.native_fx.z_index, "Refraction must sample obstacle art before Sarah")

    _check(level.native_fx.refract_overlay.material is ShaderMaterial, "GPU refraction shader missing")
    _check(level.native_fx.mist_overlay.material is ShaderMaterial, "Volumetric depth mist shader missing")
    level.world_depth.set_camera(3900.0, true, false)
    var depth_entry: Dictionary = level.world_depth.middle_entries[0]
    var far_entry: Dictionary = level.world_depth.far_entries[0]
    _check(is_equal_approx(float(level.world_depth.background_material.get_shader_parameter("grotto_mix")), 1.0), "Grotto tint not updating")
    _check(float(depth_entry["factor"]) > float(far_entry["factor"]), "Parallax order incorrect")
    level.foreground_depth.set_camera(3900.0, false, false)
    _check(not level.foreground_depth.visible, "Foreground must disappear during waterfall")
    level.foreground_depth.set_camera(3900.0, true, false)
    level.native_fx.set_quality(false)
    _check(not level.native_fx.refract_overlay.visible, "Economy mode should disable refraction")
    level.native_fx.set_quality(true)
    _check(level.native_fx.refract_overlay.visible, "High mode should restore refraction")

    _check(level.native_fx.trail is CPUParticles2D, "Native particle trail missing")
    _check(level.native_boss.sprite is Sprite2D, "Godot Carlo sprite missing")
    _check(level.native_boss.light is PointLight2D, "Carlo vulnerability light missing")
    # Graphics overhaul: HUD is above every shader, with native actor lighting.
    _check(level.premium_hud is CanvasLayer, "Native premium HUD must be a CanvasLayer")
    _check(level.premium_hud.layer >= 6, "HUD must draw above the 2.5D post-processing")
    _check(level.premium_hud.canvas is Control, "Native HUD drawing control missing")
    _check(level.premium_hud.canvas.mouse_filter == Control.MOUSE_FILTER_IGNORE,
        "HUD must not intercept touchscreen controls")
    _check(level.native_rig.hero_light is PointLight2D, "Sarah's key light missing")
    _check(level.water_surface is Node2D, "Water surface shader composition missing")
    _check(level.water_surface.foam.size() == 32, "Wave foam highlights not initialized")
    _check(level.native_fx.cinematic_overlay.material is ShaderMaterial,
        "Cinematic depth edge grade shader missing")
    var sample := level._hud_snapshot()
    _check(int(sample.get("health", -1)) == 5, "HUD health snapshot mismatched")
    level.premium_hud.update_hud(sample)
    _check(level.premium_hud.info.has("progress"), "HUD missing level progress")
    level.native_fx.set_quality(false)
    _check(not level.native_fx.cinematic_overlay.visible,
        "Economy preset must omit cinematic grade")
    level.native_fx.set_quality(true)
    _check(level.native_fx.cinematic_overlay.visible,
        "High preset must restore cinematic grade")

    _check(level.obstacles.size() == 19, "Source obstacle count changed")
    _check(level.enemies.size() >= 25, "Expected a playable enemy roster")
    _check(level.treasures.size() > 80, "Expected exploration treasure")
    _check(level.boss_hp == 5, "Carlo boss not initialized")
    level._start_waterfall()
    _check(level.waterfall_phase == "pull", "Waterfall entry missing")
    _check(level.waterfall_hazards.size() == 12, "Source waterfall hazards missing")
    _check(level.waterfall_gold.size() == 22, "Source waterfall treasure missing")
    level._update_waterfall(1.9)
    _check(level.waterfall_phase == "descent", "Waterfall descent missing")
    level._update_waterfall(17.1)
    _check(level.waterfall_phase == "outflow", "Waterfall duration incorrect")
    level._update_waterfall(1.7)
    _check(level.waterfall_phase == "", "Outflow should finish")
    _check(level.fallen, "Post-waterfall route should unlock")
    _check(level.player.x == 4120.0, "Grotto exit mismatch")
    var first_pearl: Dictionary = level.treasures[0]
    level.player = Vector2(float(first_pearl["x"]), float(first_pearl["y"]))
    var score_before: int = level.score
    level._update_collectibles()
    _check(level.score > score_before, "Collectible should score")
    level.boss_hp = 0
    level.player = Vector2(20630, 530)
    level._update_swimming(0.016)
    _check(level.state == "victory", "Exit portal should complete level")
    if failures == 0:
        print("GODOT LEVEL 1 LOGIC TEST PASSED")
    else:
        print("GODOT LEVEL 1 LOGIC TEST FAILED: " + str(failures))
    root.remove_child(level)
    level.free()
    quit(0 if failures == 0 else 1)
