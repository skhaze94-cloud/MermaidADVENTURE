extends Node2D
## Native Godot visual effects. One shader pass, CPU swim particles, native Tweens.
const CAUSTICS: Shader = preload("res://godot/shaders/underwater_caustics.gdshader")
var water_overlay: ColorRect
var impact_overlay: ColorRect
var trail: CPUParticles2D
var bubble_texture: Texture2D
var reduced_motion := false
var viewport_size := Vector2.ZERO

func _ready() -> void:
    bubble_texture = _make_bubble_texture()
    water_overlay = ColorRect.new()
    water_overlay.name = "RealtimeUnderwaterCaustics"
    water_overlay.color = Color.WHITE
    water_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
    var material := ShaderMaterial.new()
    material.shader = CAUSTICS
    water_overlay.material = material
    add_child(water_overlay)
    impact_overlay = ColorRect.new()
    impact_overlay.name = "TweenedHitFlash"
    impact_overlay.color = Color("#ffe7ca")
    impact_overlay.modulate.a = 0.0
    impact_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(impact_overlay)
    trail = CPUParticles2D.new()
    trail.name = "SwimBubbleParticles"
    trail.texture = bubble_texture
    trail.amount = 26
    trail.lifetime = 1.3
    trail.speed_scale = 1.0
    trail.explosiveness = 0.0
    trail.direction = Vector2(-1, -0.45)
    trail.spread = 28.0
    trail.gravity = Vector2(0.0, -42.0)
    trail.initial_velocity_min = 8.0
    trail.initial_velocity_max = 46.0
    trail.scale_amount_min = 0.35
    trail.scale_amount_max = 0.95
    trail.color = Color(0.73, 1.0, 0.96, 0.45)
    trail.emitting = false
    add_child(trail)
    get_viewport().size_changed.connect(_fit_viewport)
    _fit_viewport()

func _fit_viewport() -> void:
    viewport_size = get_viewport_rect().size
    water_overlay.size = viewport_size
    impact_overlay.size = viewport_size

func _make_bubble_texture() -> Texture2D:
    var im := Image.create(16, 16, false, Image.FORMAT_RGBA8)
    im.fill(Color.TRANSPARENT)
    for y in range(16):
        for x in range(16):
            var dist := Vector2(float(x) - 7.5, float(y) - 7.5).length()
            if dist <= 6.9:
                var rim := smoothstep(4.6, 6.8, dist)
                var highlight := maxf(0.0, 1.0 - Vector2(float(x)-5.1, float(y)-4.9).length() / 4.5)
                im.set_pixel(x, y, Color(0.67 + 0.28 * highlight, 0.90 + 0.1 * highlight,
                    1.0, minf(1.0, rim * 0.64 + highlight * 0.58 + 0.03)))
    return ImageTexture.create_from_image(im)

func set_motion(screen_position: Vector2, velocity: Vector2, in_water: bool) -> void:
    trail.position = screen_position - velocity.normalized() * 50.0
    trail.direction = (-velocity.normalized() + Vector2(0, -0.45)).normalized()
    trail.emitting = not reduced_motion and in_water and velocity.length() > 55.0

func splash(screen_position: Vector2, tint: Color = Color("#b8ffef"), count: int = 20) -> void:
    if reduced_motion:
        return
    var burst := CPUParticles2D.new()
    burst.texture = bubble_texture
    burst.one_shot = true
    burst.amount = count
    burst.lifetime = 0.65
    burst.explosiveness = 1.0
    burst.direction = Vector2(0.0, -1.0)
    burst.spread = 180.0
    burst.initial_velocity_min = 45.0
    burst.initial_velocity_max = 160.0
    burst.gravity = Vector2(0.0, -28.0)
    burst.scale_amount_min = 0.45
    burst.scale_amount_max = 1.25
    burst.color = tint
    burst.position = screen_position
    add_child(burst)
    burst.emitting = true
    get_tree().create_timer(1.35).timeout.connect(func() -> void:
        if is_instance_valid(burst):
            burst.queue_free()
    )

func flash(tint: Color = Color("#ffb3c0"), intensity: float = 0.22, duration: float = 0.28) -> void:
    if reduced_motion:
        return
    impact_overlay.color = tint
    impact_overlay.modulate.a = intensity
    var tween := create_tween()
    tween.tween_property(impact_overlay, "modulate:a", 0.0, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

func set_reduced_motion(enabled: bool) -> void:
    reduced_motion = enabled
    water_overlay.visible = not enabled
    trail.emitting = not enabled and trail.emitting
