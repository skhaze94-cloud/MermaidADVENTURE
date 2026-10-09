extends Node2D
## Native Sprite2D / AtlasTexture hierarchy derived from dist/sarah-dynamic-v81.js.
## Parent-child transforms preserve the face while animating hair, tail and fins.
const ArmMesh = preload("res://godot/sarah_arm_mesh.gd")
const Ribbon = preload("res://godot/sarah_ribbon_mesh.gd")
const PERFORMANCE: AnimationLibrary = preload("res://godot/animations/sarah_magnifique.tres")
const SCALES: Shader = preload("res://godot/shaders/sarah_scales.gdshader")
const ATLAS: Texture2D = preload("res://dist/assets/sarah-parts-v81.webp")
const JUMP_LIBRARY: AnimationLibrary = preload("res://godot/animations/sarah_jump.tres")
const ARMS: Texture2D = preload("res://dist/assets/sarah-arms-refined-v81.webp")
const BODY_CROPS := [
    [0.0078125,0.0185546875,0.234375,0.212890625],
    [0.2578125,0.0107421875,0.234375,0.2275390625],
    [0.5078125,0.044921875,0.234375,0.16015625],
    [0.7578125,0.013671875,0.234375,0.2216796875],
    [0.0078125,0.30859375,0.234375,0.1318359375],
    [0.2578125,0.3173828125,0.234375,0.115234375],
    [0.51171875,0.296875,0.2265625,0.1552734375],
    [0.7578125,0.306640625,0.234375,0.1357421875],
    [0.0078125,0.56640625,0.234375,0.1171875],
    [0.2578125,0.544921875,0.234375,0.16015625],
    [0.5078125,0.56640625,0.234375,0.1171875],
    [0.7578125,0.5634765625,0.234375,0.123046875],
    [0.0078125,0.7783203125,0.234375,0.1923828125],
    [0.2578125,0.7744140625,0.234375,0.201171875],
    [0.5078125,0.822265625,0.234375,0.10546875],
    [0.7578125,0.7998046875,0.234375,0.150390625]
]
const ARM_CROPS := [
    [0.015625,0.201171875,0.46875,0.59765625],
    [0.515625,0.193359375,0.46875,0.611328125]
]
var back_hair: Node2D
var hair_strand: Node2D
var tail_base: Node2D
var tail_tip: Node2D
var fin_upper: Node2D
var fin_lower: Node2D
var side_fin: Node2D
var torso: Node2D
var head_joint: Node2D
var front_hair: Node2D
var near_arm: Node2D
var far_arm: Node2D
var hero_light: PointLight2D
var velocity_value := Vector2.ZERO
var facing_value := 1.0
var boosting := false
var leaping := false
var alpha_value := 1.0
var clock := 0.0
var reduced_motion := false
# Blend weights are state, not extra textures or allocations per frame.
var swim_blend := 0.0
var boost_blend := 0.0
var leap_blend := 0.0
var turn_kick := 0.0
var hit_kick := 0.0
var smoothed_speed := 0.0
var animation_mode := "idle"
var last_facing := 1.0

# Timeline poses are independent of collision and input timing.
var jump_player: AnimationPlayer
var launch_curl := 0.0
var launch_stretch := 0.0
var landing_compress := 0.0
var jump_phase := ""
var jump_air_time := 0.0
var jump_chain := 0
var jump_direction := 1.0
var jump_pose_blend := 0.0
var spin_curve: Curve
var hair_drag := 0.0
var hair_drag_speed := 0.0
var previous_vertical_speed := 0.0
var body_pitch := 0.0

# Magnifique: six UV-locked strips and additive, interruptible native gestures.
var ribbons: Array[Polygon2D] = []
var arm_meshes: Array[Polygon2D] = []
var ribbon_materials: Array[ShaderMaterial] = []
var gesture_player: AnimationPlayer
var gesture_wave := 0.0
var gesture_nod := 0.0
var gesture_reach := 0.0
var gesture_arch := 0.0
var high_quality := true
var swim_clock := 0.0
var mesh_accumulator := 0.0
var mesh_was_active := false
var turn_elapsed := 1.0
var brake_blend := 0.0
var steering_value := Vector2.ZERO
var previous_speed := 0.0
var horizontal_drag := 0.0
var horizontal_drag_speed := 0.0
var idle_elapsed := 0.0
var last_gesture := ""

func set_steering(direction: Vector2) -> void:
    steering_value = direction.limit_length(1.0)

func set_quality(high: bool) -> void:
    high_quality = high
    for material in ribbon_materials:
        material.set_shader_parameter("motion_enabled", high and not reduced_motion)

func play_gesture(action: String) -> void:
    if not gesture_player or not gesture_player.has_animation(action):
        return
    # Greeting/reward cannot interrupt a cast, impact or victory performance.
    if action in ["greet","reward"] and gesture_player.is_playing():
        return
    _clear_gesture_values()
    last_gesture = action
    gesture_player.play(action)
    gesture_player.advance(0.0)

func _clear_gesture_values() -> void:
    gesture_wave = 0.0
    gesture_nod = 0.0
    gesture_reach = 0.0
    gesture_arch = 0.0

func reset_performance() -> void:
    if gesture_player:
        gesture_player.stop()
    _clear_gesture_values()
    last_gesture = ""
    idle_elapsed = 0.0
    swim_clock = 0.0
    turn_elapsed = 1.0
    brake_blend = 0.0
    steering_value = Vector2.ZERO
    previous_speed = 0.0
    horizontal_drag = 0.0
    horizontal_drag_speed = 0.0
    hit_kick = 0.0
    turn_kick = 0.0
    swim_blend = 0.0
    boost_blend = 0.0
    leap_blend = 0.0
    smoothed_speed = 0.0
    velocity_value = Vector2.ZERO
    facing_value = 1.0
    last_facing = 1.0
    mesh_accumulator = 0.0
    scale = Vector2.ONE
    rotation = 0.0
    for joint in [back_hair,hair_strand,tail_base,tail_tip,fin_upper,fin_lower,side_fin,torso,head_joint,front_hair,near_arm,far_arm]:
        joint.rotation = 0.0
    torso.position = Vector2(12,24)
    for ribbon in ribbons + arm_meshes:
        ribbon.reset_shape()

func _arm(index: int, parent: Node2D, length: float, height: float) -> void:
    var crop: Array = ARM_CROPS[index]
    var size := Vector2(ARMS.get_width(),ARMS.get_height())
    var region := Rect2(Vector2(crop[0],crop[1])*size,Vector2(crop[2],crop[3])*size)
    var mesh := ArmMesh.new()
    mesh.name = "ContinuousArmSkin_%d" % index
    mesh.configure(ARMS,region,Rect2(-5.0,-height*0.28,length,height))
    parent.add_child(mesh)
    arm_meshes.append(mesh)

func _ribbon(index: int, parent: Node2D, destination: Rect2, shining: bool) -> void:
    var crop: Array = BODY_CROPS[index]
    var region := Rect2(Vector2(crop[0],crop[1]) * Vector2(ATLAS.get_width(),ATLAS.get_height()), Vector2(crop[2],crop[3]) * Vector2(ATLAS.get_width(),ATLAS.get_height()))
    var mesh := Ribbon.new()
    mesh.name = "FlexiblePaintedPart_%d" % index
    mesh.configure(ATLAS,region,destination)
    if shining:
        var material := ShaderMaterial.new()
        material.shader = SCALES
        material.set_shader_parameter("atlas_bounds", Vector4(crop[0],crop[1],crop[0]+crop[2],crop[1]+crop[3]))
        mesh.material = material
        ribbon_materials.append(material)
    parent.add_child(mesh)
    ribbons.append(mesh)

func _update_ribbons(dt: float, phase: float, swim_amount: float) -> void:
    var active := high_quality and not reduced_motion
    if not active:
        if mesh_was_active:
            for ribbon in ribbons + arm_meshes:
                ribbon.reset_shape()
        mesh_was_active = false
        return
    mesh_was_active = true
    mesh_accumulator += dt
    if mesh_accumulator < 1.0/45.0:
        return
    mesh_accumulator = fmod(mesh_accumulator,1.0/45.0)
    # Fixed attachment edges and bounded curvature protect the head/hip seams.
    var strength := 0.35 + swim_amount * 3.0 + boost_blend * 0.5
    ribbons[0].deform(phase*0.7,2.3+strength*0.45,hair_drag*6.0+horizontal_drag*4.0)
    ribbons[1].deform(phase*0.8-0.7,1.5+strength*0.8,hair_drag*4.0+horizontal_drag*5.0)
    ribbons[2].deform(phase-0.9,strength*1.1,turn_kick*3.0)
    ribbons[3].deform(phase-1.4,strength*1.2,0.0)
    ribbons[4].deform(phase-0.2,strength*1.3,0.0)
    # Keep the hip seam stable; more of the travelling wave lives at the fin.
    ribbons[5].deform(phase,strength*0.40,0.0)
    var expression := 0.25 if leaping or boosting else 1.0
    arm_meshes[1].skin(0.12+sin(phase-0.8)*swim_amount*0.15-boost_blend*0.08+gesture_wave*expression*0.12, sin(phase-1.4)*0.025+gesture_wave*expression*0.14-gesture_reach*expression*0.08)
    arm_meshes[0].skin(0.10+sin(phase+1.6)*swim_amount*0.12-boost_blend*0.06, -sin(phase+0.8)*0.025-gesture_wave*expression*0.10)
    for material in ribbon_materials:
        material.set_shader_parameter("motion_clock", clock)
        material.set_shader_parameter("charge_mix", boost_blend)
        material.set_shader_parameter("motion_enabled", not reduced_motion)

func start_jump(chain: int, direction: float) -> void:
    jump_chain = chain
    jump_direction = direction
    landing_compress = 0.0
    jump_player.play("launch")
    jump_player.advance(0.0)

func land_jump() -> void:
    launch_curl = 0.0
    launch_stretch = 0.0
    jump_player.play("land")
    jump_player.advance(0.0)

func set_jump_state(phase: String, air_time: float, chain: int, direction: float) -> void:
    jump_phase = phase
    jump_air_time = air_time
    jump_chain = chain
    jump_direction = direction

func airborne_clearance(screen_y: float) -> float:
    if jump_phase != "airborne" or reduced_motion:
        return 0.0
    var angle := body_pitch * facing_value + spin_curve.sample_baked(clampf(jump_air_time/0.88,0.0,1.0)) * TAU * jump_direction
    var top := 0.0
    # Conservative painted-rig bounds protect fins/hair throughout the turn.
    for corner in [Vector2(-162,-110),Vector2(135,-110),Vector2(-162,77),Vector2(135,77)]:
        top = minf(top,Vector2(corner.x*facing_value,corner.y).rotated(angle).y)
    return maxf(0.0,14.0-screen_y-top)

func reset_jump() -> void:
    jump_player.stop()
    launch_curl = 0.0
    launch_stretch = 0.0
    landing_compress = 0.0
    jump_phase = ""
    jump_air_time = 0.0
    jump_pose_blend = 0.0
    hair_drag = 0.0
    hair_drag_speed = 0.0
    previous_vertical_speed = 0.0
    body_pitch = 0.0
    rotation = 0.0
    scale = Vector2(facing_value,1.0)

func _joint(name: String, parent: Node2D, where: Vector2) -> Node2D:
    var node := Node2D.new()
    node.name = name
    node.position = where
    parent.add_child(node)
    return node

func _part(index: int, parent: Node2D, x: float, y: float, w: float, h: float, arm: bool = false) -> Sprite2D:
    var texture: Texture2D = ARMS if arm else ATLAS
    var crop: Array = ARM_CROPS[index] if arm else BODY_CROPS[index]
    var region := Rect2(float(crop[0]) * float(texture.get_width()),
        float(crop[1]) * float(texture.get_height()),
        float(crop[2]) * float(texture.get_width()),
        float(crop[3]) * float(texture.get_height()))
    var atlas := AtlasTexture.new()
    atlas.atlas = texture
    atlas.region = region
    atlas.filter_clip = true
    var sprite := Sprite2D.new()
    sprite.texture = atlas
    sprite.centered = false
    sprite.position = Vector2(x,y)
    sprite.scale = Vector2(w / region.size.x, h / region.size.y)
    sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
    parent.add_child(sprite)
    return sprite

func _ready() -> void:
    jump_player = AnimationPlayer.new()
    jump_player.name = "JumpAnimationPlayer"
    add_child(jump_player)
    jump_player.add_animation_library("", JUMP_LIBRARY)
    spin_curve = Curve.new()
    spin_curve.add_point(Vector2(0.0,0.0),0.0,0.0)
    spin_curve.add_point(Vector2(0.22,0.06),0.65,0.65)
    spin_curve.add_point(Vector2(0.62,0.85),1.3,1.3)
    spin_curve.add_point(Vector2(1.0,1.0),0.0,0.0)
    gesture_player = AnimationPlayer.new()
    gesture_player.name = "MagnifiquePerformancePlayer"
    add_child(gesture_player)
    gesture_player.add_animation_library("", PERFORMANCE)
    gesture_player.animation_finished.connect(func(_action: StringName): _clear_gesture_values())
    # Draw order is intentionally far to near, matching the HTML 8.1 rig.
    back_hair = _joint("BackHair", self, Vector2(46, -23))
    _ribbon(2, back_hair, Rect2(-105,-46,116,77),false)
    back_hair.scale = Vector2(0.96,0.94)
    hair_strand = _joint("BackHairStrand", back_hair, Vector2.ZERO)
    _ribbon(15, hair_strand, Rect2(-109,-18,109,28),false)

    tail_base = _joint("TailBase", self, Vector2(13, 30))
    # Lengthen the trailing silhouette from the fixed hip socket.
    tail_base.scale = Vector2(1.14,0.96)
    tail_tip = _joint("TailTip", tail_base, Vector2(-62, -1))
    _ribbon(11, tail_tip, Rect2(-42,-13,50,29),true)
    var fins := _joint("FinSockets", tail_tip, Vector2(-34, -2))
    fin_lower = _joint("LowerFin", fins, Vector2.ZERO)
    fin_lower.scale = Vector2(1.04,1.06)
    _ribbon(13, fin_lower, Rect2(-37,-7,46,38),true)
    fin_upper = _joint("UpperFin", fins, Vector2.ZERO)
    fin_upper.scale = Vector2(1.04,1.06)
    _ribbon(12, fin_upper, Rect2(-40,-49,49,57),true)
    _ribbon(10, tail_base, Rect2(-70,-24,78,51),true)

    side_fin = _joint("SideFin", self, Vector2(5, 45))
    _part(14, side_fin, -36, -6, 43, 20)

    torso = _joint("Torso", self, Vector2(12, 24))
    far_arm = _joint("FarArm", torso, Vector2(46, -26))
    _arm(1, far_arm, 61, 38)
    _part(0, torso, -7, -42, 70, 67)

    head_joint = _joint("HeadNeck", torso, Vector2(41, -29))
    head_joint.scale = Vector2(0.91,0.91)
    _part(1, head_joint, -34, -69, 67, 73)
    front_hair = _joint("FrontHair", torso, Vector2(32, -49))
    front_hair.scale = Vector2(0.94,0.94)
    _part(3, front_hair, -27, -4, 33, 49)

    near_arm = _joint("NearArm", torso, Vector2(10, -31))
    _arm(0, near_arm, 64, 40)

    # A real Godot 2D light subtly lifts Sarah away from deep blue scenery.
    # This is an independent light, not a blurry duplicate of her painted face.
    hero_light = PointLight2D.new()
    hero_light.name = "MermaidSoftKeyLight"
    hero_light.texture = _radial_texture()
    hero_light.texture_scale = 2.4
    hero_light.color = Color("#8ef8dc")
    hero_light.energy = 0.24
    hero_light.position = Vector2(21.0, -12.0)
    add_child(hero_light)
    play_gesture("greet")

func _radial_texture() -> Texture2D:
    var image := Image.create(96, 96, false, Image.FORMAT_RGBA8)
    image.fill(Color.TRANSPARENT)
    for y in range(96):
        for x in range(96):
            var u := (float(x) - 47.5) / 47.5
            var v := (float(y) - 47.5) / 47.5
            var d := sqrt(u * u + v * v)
            if d < 1.0:
                image.set_pixel(x, y, Color(1.0, 1.0, 1.0,
                    pow(maxf(0.0, 1.0 - d), 2.1) * 0.74))
    return ImageTexture.create_from_image(image)

func set_motion(velocity: Vector2, direction: float, is_boosting: bool, is_leaping: bool, opacity: float) -> void:
    velocity_value = velocity
    facing_value = -1.0 if direction < 0.0 else 1.0
    if facing_value != last_facing:
        # Quick turn recoil without mirroring through an ugly zero-width pose.
        turn_kick = -0.22 * facing_value
        turn_elapsed = 0.0
        last_facing = facing_value
    boosting = is_boosting
    leaping = is_leaping
    alpha_value = opacity

func play_impact() -> void:
    hit_kick = 1.0
    play_gesture("impact")

func _process(delta: float) -> void:
    var dt := minf(delta, 0.05)
    clock += dt
    var ease := 1.0 - exp(-dt * 9.0)
    var fast_ease := 1.0 - exp(-dt * 16.0)
    var speed := velocity_value.length()
    smoothed_speed = lerpf(smoothed_speed, speed, ease)
    var swim_target := clampf(smoothed_speed / 310.0, 0.0, 1.0)
    swim_blend = lerpf(swim_blend, swim_target, ease)
    boost_blend = lerpf(boost_blend, 1.0 if boosting else 0.0, fast_ease)
    leap_blend = lerpf(leap_blend, 1.0 if leaping else 0.0, ease)
    turn_kick = lerpf(turn_kick, 0.0, fast_ease)
    hit_kick = lerpf(hit_kick, 0.0, 1.0 - exp(-dt * 12.0))
    animation_mode = "boost" if boost_blend > 0.6 else ("leap" if leap_blend > 0.6 else ("swim" if swim_blend > 0.22 else "idle"))
    # Integrate frequency instead of multiplying all elapsed time by changing speed.
    swim_clock += dt * (2.9 + 3.0 * swim_blend + 2.0 * boost_blend)
    var swim_phase := swim_clock
    turn_elapsed = minf(1.0,turn_elapsed + dt)
    var turn_pose := sin(clampf(turn_elapsed/0.30,0.0,1.0)*PI) if not reduced_motion else 0.0
    var braking := steering_value.length_squared() < 0.02 and speed > 30.0 and previous_speed > speed
    brake_blend = lerpf(brake_blend,1.0 if braking else 0.0,fast_ease)
    previous_speed = speed
    var gesture_amount := (0.20 if reduced_motion else 1.0) * (0.25 if leaping or boosting else 1.0)
    var wave := gesture_wave * gesture_amount
    var reach := gesture_reach * gesture_amount
    var arch := gesture_arch * gesture_amount
    var nod := gesture_nod * gesture_amount
    idle_elapsed = idle_elapsed + dt if speed < 20.0 and not leaping and not boosting else 0.0
    if idle_elapsed > 8.0 and not gesture_player.is_playing():
        play_gesture("greet")
        idle_elapsed = 0.0
    var slow_phase := clock * 1.6
    var amount := (0.04 + 0.135 * swim_blend) * (1.0 - boost_blend * 0.65) * (1.0 - leap_blend * 0.62)
    if reduced_motion:
        amount = 0.0
    var active_jump := jump_phase != ""
    jump_pose_blend = lerpf(jump_pose_blend, 1.0 if active_jump else 0.0, fast_ease)
    var air_progress := clampf(jump_air_time / 0.88,0.0,1.0)
    var tuck := sin(air_progress * PI) * jump_pose_blend if jump_phase == "airborne" else 0.0
    var dive := smoothstep(0.60,0.93,air_progress) * jump_pose_blend if jump_phase == "airborne" else 0.0
    var lift := jump_pose_blend if jump_phase == "ascent" else (1.0 - dive) * jump_pose_blend
    var curl := launch_curl * 0.22 + tuck * (0.42 + minf(jump_chain,3) * 0.035)
    var stretch := launch_stretch * 0.065 - landing_compress * 0.085
    var vertical_acceleration := clampf((velocity_value.y - previous_vertical_speed) / maxf(dt,0.001), -1800.0,1800.0)
    previous_vertical_speed = velocity_value.y
    # Damped secondary motion follows launches, apex and re-entry.
    var drag_target := clampf(velocity_value.y / 3600.0 - vertical_acceleration / 20000.0,-0.24,0.24)
    hair_drag_speed += ((drag_target - hair_drag) * 95.0 - hair_drag_speed * 17.0) * dt
    hair_drag += hair_drag_speed * dt
    var drag_x_target := clampf((velocity_value.x*facing_value-smoothed_speed)/1800.0,-0.22,0.22)
    horizontal_drag_speed += ((drag_x_target-horizontal_drag)*75.0-horizontal_drag_speed*15.0)*dt
    horizontal_drag += horizontal_drag_speed*dt
    if reduced_motion:
        horizontal_drag = 0.0
        horizontal_drag_speed = 0.0
    var pitch_limit := 0.22 if reduced_motion else 0.36
    var pitch_target := clampf(atan2(velocity_value.y,absf(velocity_value.x)+180.0)*0.38,-pitch_limit,pitch_limit)
    body_pitch = lerp_angle(body_pitch,pitch_target,ease)
    if reduced_motion:
        body_pitch = clampf(body_pitch,-0.22,0.22)
    rotation = body_pitch * facing_value
    if jump_phase == "airborne" and not reduced_motion:
        rotation += spin_curve.sample_baked(air_progress) * TAU * jump_direction
    if reduced_motion:
        curl = 0.0
        stretch = 0.0
        hair_drag = 0.0
        hair_drag_speed = 0.0
        lift *= 0.3
        dive *= 0.3
    # All motion is local to joints; collision location and face stay stable.
    scale = Vector2(facing_value * (1.0 + stretch) * (1.0 - turn_pose*0.12), 1.0 - stretch * 0.65)
    var tail_angle := sin(swim_phase) * amount + turn_kick * 0.8 - curl - lift * 0.10 + landing_compress * 0.08 + brake_blend*0.18 - arch*0.12
    var tail_tip_angle := sin(swim_phase - 0.91) * amount * 1.55 + turn_kick * 0.9 - curl * 0.85 + dive * 0.12 + brake_blend*0.24
    tail_base.rotation = lerpf(tail_base.rotation, tail_angle, ease)
    tail_tip.rotation = lerpf(tail_tip.rotation, tail_tip_angle, ease)
    fin_upper.rotation = lerpf(fin_upper.rotation, sin(swim_phase - 1.25) * amount * 1.60 + tuck * 0.18 - dive * 0.12, fast_ease)
    fin_lower.rotation = lerpf(fin_lower.rotation, sin(swim_phase - 0.70) * amount * 1.75 - tuck * 0.14 + dive * 0.10, fast_ease)
    side_fin.rotation = lerpf(side_fin.rotation, sin(swim_phase * 0.91) * amount + turn_kick * 0.27, ease)
    var current := 0.0 if reduced_motion else sin(slow_phase) * 0.035
    back_hair.rotation = lerpf(back_hair.rotation, current + turn_kick * 0.5 + swim_blend * 0.018 + hair_drag + horizontal_drag, ease)
    hair_strand.rotation = lerpf(hair_strand.rotation, -current * 1.6 + turn_kick * 0.85 + hair_drag * 0.75, ease)
    front_hair.rotation = lerpf(front_hair.rotation, -current * 0.6 - turn_kick * 0.25 + hair_drag * 0.32, ease)
    var rise := 0.0 if reduced_motion else sin(slow_phase * 1.2) * 1.6
    torso.position = Vector2(12.0, 24.0 + rise * (1.0 - boost_blend) + landing_compress * 2.0 - arch*2.0)
    torso.rotation = lerpf(torso.rotation, -velocity_value.y / 1400.0 * 0.12 + turn_kick * 0.18, ease)
    head_joint.rotation = lerpf(head_joint.rotation, -torso.rotation * 0.3 + nod * 0.10, ease)
    var arm_sweep := 0.0 if reduced_motion else sin(swim_phase * 0.74 + 0.65) * amount
    near_arm.rotation = lerpf(near_arm.rotation,
        arm_sweep * 1.2 - 0.26 * boost_blend - 0.13 * leap_blend - lift * 0.34 + tuck * 0.20 - dive * 0.18 + hit_kick * 0.14 + wave*0.32 - reach*0.22 - brake_blend*0.18, fast_ease)
    far_arm.rotation = lerpf(far_arm.rotation,
        -arm_sweep + 0.21 * boost_blend + 0.12 * leap_blend - lift * 0.24 - tuck * 0.19 - dive * 0.12 - hit_kick * 0.12 - wave*0.34 - reach*0.18 + brake_blend*0.14, fast_ease)
    _update_ribbons(dt,swim_phase,swim_blend)
    self_modulate.a = alpha_value
    if is_instance_valid(hero_light):
        var target_energy := 0.0 if reduced_motion else (0.24 + 0.24 * boost_blend)
        hero_light.energy = lerpf(hero_light.energy, target_energy, ease)
        hero_light.color = Color("#b6f8ff") if boost_blend > 0.4 else Color("#8ef8dc")
