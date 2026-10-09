extends Node2D
## Pooled, combat-driven creature portraits shared by lake and waterfall.
const Art = preload("res://godot/creature_art.gd")
const VISUAL_HZ := 30.0
const VIEW_MARGIN := 250.0
var sprites: Array[Sprite2D] = []
var atlases: Array[AtlasTexture] = []
var materials: Array[ShaderMaterial] = []
var kinds: Array[String] = []
var indices: Array[int] = []
var last_frames: Array[int] = []
var death_times: Array[float] = []
var source_enemies: Array[Dictionary] = []
var active_count := 0
var animation_ticks := 0
var frame_accumulator := 1.0
var viewport_width := 1400.0

func _ready() -> void:
    z_index = 0
    viewport_width = get_viewport_rect().size.x
    get_viewport().size_changed.connect(_resized)

func _resized() -> void:
    viewport_width = get_viewport_rect().size.x
    frame_accumulator = 1.0

func bind_enemies(data: Array[Dictionary]) -> void:
    source_enemies = data
    for sprite in sprites:
        remove_child(sprite)
        sprite.queue_free()
    sprites.clear()
    atlases.clear()
    materials.clear()
    kinds.clear()
    indices.clear()
    last_frames.clear()
    death_times.clear()
    for i in range(data.size()):
        var kind := String(data[i]["kind"])
        if not Art.TEXTURES.has(kind) or kind == "carlo":
            continue
        var sprite := Sprite2D.new()
        sprite.name = "Creature_%02d_%s" % [i, kind]
        sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
        var atlas := Art.atlas(kind)
        var surface := Art.material(kind)
        sprite.texture = atlas
        sprite.material = surface
        sprite.scale = Art.base_scale(kind)
        sprite.visible = false
        add_child(sprite)
        sprites.append(sprite)
        atlases.append(atlas)
        materials.append(surface)
        kinds.append(kind)
        indices.append(i)
        last_frames.append(-1)
        death_times.append(-1.0)
    frame_accumulator = 1.0

func animate_visible(camera_x: float, elapsed: float, reduced_motion: bool, dt: float,
        enabled: bool = true, high_quality: bool = true) -> void:
    visible = enabled
    active_count = 0
    if not enabled:
        return
    frame_accumulator += minf(dt, 0.05)
    var animate_frame := frame_accumulator >= 1.0 / (VISUAL_HZ if high_quality else 20.0)
    if animate_frame:
        frame_accumulator = 0.0
        animation_ticks += 1
    for i in range(sprites.size()):
        var source: Dictionary = source_enemies[indices[i]]
        var sprite: Sprite2D = sprites[i]
        var kind := kinds[i]
        var alive := int(source["hp"]) > 0
        if alive:
            death_times[i] = -1.0
        elif death_times[i] < 0.0:
            death_times[i] = 0.0
        else:
            death_times[i] += dt
        var sx := float(source["x"]) - camera_x
        var sy := float(source["y"])
        sprite.visible = (alive or (death_times[i] < 0.24 and not reduced_motion)) and sx > -VIEW_MARGIN and sx < viewport_width + VIEW_MARGIN and sy > -VIEW_MARGIN and sy < get_viewport_rect().size.y + VIEW_MARGIN
        if not sprite.visible:
            continue
        active_count += 1
        var frame := Art.pose(String(source.get("mode", "patrol")))
        # Combat cues update immediately, even between capped decorative updates.
        if frame != last_frames[i]:
            atlases[i].region = Art.region(kind, frame)
            Art.set_region(materials[i], kind, frame)
            materials[i].set_shader_parameter("combat_pose", frame)
            last_frames[i] = frame
        var phase := float(source.get("phase", 0.0))
        var bob := 0.0 if reduced_motion else sin(elapsed * 2.8 + phase) * (3.0 if kind == "jelly" else 1.5)
        sprite.position = Vector2(sx, sy + bob)
        sprite.flip_h = int(source.get("dir", 1)) < 0
        sprite.rotation = 0.0 if reduced_motion else sin(elapsed * 2.1 + phase) * (0.015 if kind == "crab" else 0.028)
        if frame == 2 and kind != "crab" and kind != "jelly" and not reduced_motion:
            var aim: Vector2 = source.get("aim", Vector2.RIGHT)
            sprite.rotation += clampf(aim.y * signf(aim.x), -0.22, 0.22)
        sprite.scale = Art.base_scale(kind)
        sprite.modulate = Color.WHITE
        var mode := String(source.get("mode","patrol"))
        var age := float(source.get("mode_time",0.0))
        var depth_turn := 0.0
        if not reduced_motion:
            var aim: Vector2 = source.get("aim",Vector2.RIGHT)
            var anticipation := sin(clampf(age/0.75,0.0,1.0)*PI) if mode == "windup" else 0.0
            var strike := exp(-age*7.0) if mode == "attack" else 0.0
            var wobble := sin(age*11.0)*exp(-age*3.5) if mode == "recover" else 0.0
            # Small sculpted pose changes retain each painted species' silhouette.
            var inflation := 0.08 if kind == "puffer" else 0.04
            sprite.scale *= Vector2(1.0-anticipation*0.04+strike*0.06,1.0+anticipation*inflation-strike*0.04)
            sprite.rotation += anticipation*(-0.08 if kind == "crab" else -aim.y*0.10)+wobble*0.065
            depth_turn = sin(elapsed*1.7+phase)*0.22 + aim.y*0.25 if mode in ["approach","windup","attack"] else sin(elapsed*1.2+phase)*0.16
            sprite.skew = depth_turn*0.045
            sprite.scale.x *= 1.0-absf(depth_turn)*0.05
        else:
            sprite.skew = 0.0
        materials[i].set_shader_parameter("depth_turn",depth_turn)
        materials[i].set_shader_parameter("alert_mix",1.0 if mode in ["approach","windup"] else 0.0)
        if kind == "jelly" and not reduced_motion:
            var pulse := sin(elapsed * 2.4 + phase) * 0.025
            sprite.scale *= Vector2(1.0 + pulse, 1.0 - pulse)
        if not alive:
            var progress := clampf(death_times[i] / 0.24, 0.0, 1.0)
            sprite.modulate.a = 1.0 - progress
            sprite.position.y -= progress * 18.0
            sprite.scale *= 1.0 + sin(progress * PI) * 0.12
        materials[i].set_shader_parameter("animate_detail", not reduced_motion)
        materials[i].set_shader_parameter("high_quality", high_quality)
        if animate_frame:
            materials[i].set_shader_parameter("visual_clock", 0.0 if reduced_motion else elapsed + phase)
