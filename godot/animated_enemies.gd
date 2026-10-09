extends Node2D
## v0.5: pooled native sprites for the already-existing enemy data.
## Atlas regions and nodes are allocated exactly once, not on each draw call.
## Visuals are screen-space only; all combat and collision stay in HighlandGold.
const CRAB: Texture2D = preload("res://dist/assets/crab-poses-v731.webp")
const EEL: Texture2D = preload("res://dist/assets/eel-poses-v731.webp")
const JELLY: Texture2D = preload("res://dist/assets/jelly-v731.webp")
const VISUAL_HZ := 30.0
const VIEW_MARGIN := 230.0
var sprites: Array[Sprite2D] = []
var atlases: Array[AtlasTexture] = []
var kinds: Array[String] = []
var indices: Array[int] = []
var last_frames: Array[int] = []
var source_enemies: Array[Dictionary] = []
var active_count := 0
var animation_ticks := 0
var frame_accumulator := 1.0
var last_camera := -999999.0
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
        sprite.queue_free()
    sprites.clear()
    atlases.clear()
    kinds.clear()
    indices.clear()
    last_frames.clear()
    for i in range(data.size()):
        var enemy: Dictionary = data[i]
        var kind: String = String(enemy["kind"])
        if kind != "crab" and kind != "eel" and kind != "jelly":
            continue
        var sprite := Sprite2D.new()
        sprite.name = "Creature_%02d_%s" % [i, kind]
        sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
        var tex: Texture2D = CRAB if kind == "crab" else (EEL if kind == "eel" else JELLY)
        var src := AtlasTexture.new()
        src.atlas = tex
        var rect := Rect2(0, 0, float(tex.get_width()) / 4.0, float(tex.get_height()))
        if kind == "jelly":
            rect = Rect2(Vector2.ZERO, tex.get_size())
        src.region = rect
        sprite.texture = src
        var target := Vector2(155.0, 124.0) if kind == "crab" else (
            Vector2(185.0, 110.0) if kind == "eel" else Vector2(96.0, 144.0))
        sprite.scale = target / rect.size
        sprite.visible = false
        add_child(sprite)
        sprites.append(sprite)
        atlases.append(src)
        kinds.append(kind)
        indices.append(i)
        last_frames.append(-1)
    frame_accumulator = 1.0

func animate_visible(camera_x: float, elapsed: float, reduced_motion: bool, dt: float,
        enabled: bool = true, high_quality: bool = true) -> void:
    if not enabled:
        visible = false
        active_count = 0
        return
    visible = true
    frame_accumulator += minf(dt, 0.05)
    # Cap skeleton/atlas updates at 30Hz on 60/120Hz monitors.
    # Fast panning invalidates the LOD throttle to prevent noticeable lag.
    var visual_rate := VISUAL_HZ if high_quality else 20.0
    if frame_accumulator < 1.0 / visual_rate and absf(camera_x - last_camera) < 7.0:
        return
    frame_accumulator = 0.0
    last_camera = camera_x
    animation_ticks += 1
    active_count = 0
    for i in range(sprites.size()):
        var sprite: Sprite2D = sprites[i]
        var source: Dictionary = source_enemies[indices[i]]
        var sx := float(source["x"]) - camera_x
        var alive := int(source["hp"]) > 0
        var onscreen := alive and sx > -VIEW_MARGIN and sx < viewport_width + VIEW_MARGIN
        sprite.visible = onscreen
        if not onscreen:
            continue
        active_count += 1
        var kind := kinds[i]
        var phase := float(source["phase"])
        var bob := 0.0 if reduced_motion else sin(elapsed * 2.8 + phase) * (4.0 if kind == "jelly" else 2.5)
        sprite.position = Vector2(sx, float(source["y"]) + bob)
        var sprite_frame := 0
        if kind != "jelly" and not reduced_motion:
            sprite_frame = int(floor(elapsed * (7.0 if kind == "crab" else 6.0) + phase)) % 4
        if sprite_frame != last_frames[i]:
            var texture: Texture2D = CRAB if kind == "crab" else (EEL if kind == "eel" else JELLY)
            var cell_width := float(texture.get_width()) / 4.0
            if kind != "jelly":
                atlases[i].region = Rect2(sprite_frame * cell_width, 0, cell_width, float(texture.get_height()))
            last_frames[i] = sprite_frame
        if kind == "crab":
            sprite.flip_h = int(source["dir"]) < 0
            sprite.rotation = 0.0 if reduced_motion else sin(elapsed * 5.2 + phase) * 0.028
        elif kind == "eel":
            sprite.rotation = 0.0 if reduced_motion else sin(elapsed * 2.7 + phase) * 0.075
            sprite.flip_h = sin(elapsed * (1.0 + phase * 0.025) + phase) < 0.0
        else:
            sprite.rotation = 0.0 if reduced_motion else sin(elapsed * 1.9 + phase) * 0.045
