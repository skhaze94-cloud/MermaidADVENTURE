extends Node2D
## Native Godot boss: Sprite2D, PointLight2D vulnerability cue and Tween hit reaction.
const CARLO: Texture2D = preload("res://dist/assets/carlo.webp")
var sprite: Sprite2D
var light: PointLight2D
var sparkle: Sprite2D
var clock := 0.0
var active := false
var vulnerable := false
var life := 5
var defeating := false
var hit_tween: Tween
var boss_scale := Vector2.ONE
var reduced_motion := false

func _ready() -> void:
    sprite = Sprite2D.new()
    sprite.name = "PaintedCarlo"
    sprite.texture = CARLO
    sprite.scale = Vector2(324.0 / CARLO.get_width(), 352.0 / CARLO.get_height())
    sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
    add_child(sprite)
    light = PointLight2D.new()
    light.name = "VulnerabilityLight"
    light.texture = _light_texture()
    light.texture_scale = 2.3
    light.energy = 0.20
    light.color = Color("#ff8775")
    add_child(light)
    visible = false

func _light_texture() -> Texture2D:
    var img := Image.create(96, 96, false, Image.FORMAT_RGBA8)
    img.fill(Color.TRANSPARENT)
    for y in range(96):
        for x in range(96):
            var dist := Vector2(float(x) - 47.5, float(y) - 47.5).length() / 47.5
            if dist < 1.0:
                var falloff := pow(1.0 - smoothstep(0.0, 1.0, dist), 1.6)
                img.set_pixel(x, y, Color(1.0, 1.0, 1.0, falloff))
    return ImageTexture.create_from_image(img)

func set_boss_state(hp: int, can_hit: bool, global_clock: float, screen_x: float, screen_y: float, screen_width: float) -> void:
    life = hp
    vulnerable = can_hit
    clock = global_clock
    position = Vector2(screen_x, screen_y)
    visible = (hp > 0 or defeating) and screen_x > -320.0 and screen_x < screen_width + 320.0
    light.color = Color("#7cffad") if vulnerable else Color("#ff9d92")
    light.energy = (0.9 if vulnerable else 0.22) * (1.0 if reduced_motion else 0.85 + 0.15 * sin(clock * 3.8))
    if not reduced_motion:
        sprite.rotation = sin(clock * 1.8) * 0.075
        sprite.position = Vector2(0, sin(clock * 2.3) * 4.0)
    else:
        sprite.rotation = 0.0
        sprite.position = Vector2.ZERO

func play_hit() -> void:
    if hit_tween and hit_tween.is_running():
        hit_tween.kill()
    sprite.self_modulate = Color("#fffae2")
    var base := Vector2(324.0 / CARLO.get_width(), 352.0 / CARLO.get_height())
    hit_tween = create_tween()
    hit_tween.tween_property(sprite, "scale", base * 1.20, 0.08).set_trans(Tween.TRANS_CUBIC)
    hit_tween.tween_property(sprite, "scale", base, 0.28).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    hit_tween.parallel().tween_property(sprite, "self_modulate", Color.WHITE, 0.3)

func defeat() -> void:
    defeating = true
    if hit_tween and hit_tween.is_running():
        hit_tween.kill()
    var tween := create_tween()
    tween.tween_property(sprite, "modulate:a", 0.0, 0.7).set_trans(Tween.TRANS_CUBIC)
    tween.parallel().tween_property(sprite, "rotation", 0.7, 0.7)
    tween.tween_callback(func() -> void:
        visible = false
        defeating = false
    )

func reset_boss() -> void:
    defeating = false
    sprite.modulate = Color.WHITE
    sprite.self_modulate = Color.WHITE
    sprite.rotation = 0.0
    sprite.scale = Vector2(324.0 / CARLO.get_width(), 352.0 / CARLO.get_height())
    visible = false
