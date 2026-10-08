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
    _check(level.native_fx.trail is CPUParticles2D, "Native particle trail missing")
    _check(level.native_boss.sprite is Sprite2D, "Godot Carlo sprite missing")
    _check(level.native_boss.light is PointLight2D, "Carlo vulnerability light missing")
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
