extends SceneTree
## Headless behaviour test: source geometry, waterfall timing, pickup and portal.

func _initialize() -> void:
    call_deferred("_run_checks")

func _run_checks() -> void:
    var level = load("res://godot/highland_level.tscn").instantiate()
    root.add_child(level)
    # Native-Godot v0.2: these are real editor scene nodes, not HTML-style canvas sprites.
    assert(level.native_rig.get_node("TailBase") is Node2D, "Articulated Sarah tail missing")
    assert(level.native_rig.get_node("HeadNeck") is Node2D, "Native face joint missing")
    assert(level.native_rig.get_node("NearArm") is Node2D, "Native arm joint missing")
    assert(level.native_fx.water_overlay.material is ShaderMaterial, "Water GPU shader missing")
    assert(level.native_fx.trail is CPUParticles2D, "Native particle trail missing")
    assert(level.native_boss.sprite is Sprite2D, "Godot Carlo sprite missing")
    assert(level.native_boss.light is PointLight2D, "Carlo vulnerability light missing")
    assert(level.obstacles.size() == 19, "Source obstacle count changed")
    assert(level.enemies.size() >= 25, "Expected a playable enemy roster")
    assert(level.treasures.size() > 80, "Expected exploration treasure")
    assert(level.boss_hp == 5, "Carlo boss not initialized")
    level._start_waterfall()
    assert(level.waterfall_phase == "pull", "Waterfall entry missing")
    assert(level.waterfall_hazards.size() == 12, "Source waterfall hazards missing")
    assert(level.waterfall_gold.size() == 22, "Source waterfall treasure missing")
    level._update_waterfall(1.9)
    assert(level.waterfall_phase == "descent", "Waterfall descent missing")
    level._update_waterfall(17.1)
    assert(level.waterfall_phase == "outflow", "Waterfall duration incorrect")
    level._update_waterfall(1.7)
    assert(level.waterfall_phase == "", "Outflow should finish")
    assert(level.fallen, "Post-waterfall route should unlock")
    assert(level.player.x == 4120.0, "Grotto exit mismatch")
    var first_pearl: Dictionary = level.treasures[0]
    level.player = Vector2(float(first_pearl["x"]), float(first_pearl["y"]))
    var score_before: int = level.score
    level._update_collectibles()
    assert(level.score > score_before, "Collectible should score")
    level.boss_hp = 0
    level.player = Vector2(20630, 530)
    level._update_swimming(0.016)
    assert(level.state == "victory", "Exit portal should complete level")
    print("GODOT LEVEL 1 LOGIC TEST PASSED")
    root.remove_child(level)
    level.free()
    quit(0)
