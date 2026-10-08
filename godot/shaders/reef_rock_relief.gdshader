shader_type canvas_item;
render_mode unshaded;

// Shaded relief on the source painted obstacle; sprite alpha stays unchanged.
// A cheap top-lit bevel, not a generated 3D mesh or plastic-looking gloss.
uniform float ceiling_rock : hint_range(0.0, 1.0) = 0.0;
uniform float rock_relief : hint_range(0.0, 0.5) = 0.16;
uniform vec4 light_colour : source_color = vec4(0.69, 0.95, 0.89, 1.0);
uniform vec4 shadow_colour : source_color = vec4(0.09, 0.23, 0.35, 1.0);

void fragment() {
    vec4 base = COLOR; // Godot's built-in sample already includes sprite alpha.
    vec2 uv = UV;
    float top = mix(1.0 - uv.y, uv.y, ceiling_rock);
    float shade = smoothstep(0.0, 0.82, top);
    float bevel = pow(max(0.0, 1.0 - abs(uv.x - 0.36) * 1.7), 4.0);
    float highlight = shade * (0.48 + 0.52 * bevel) * rock_relief;
    float shadow = (1.0 - shade) * rock_relief * 0.64;
    vec3 rgb = mix(base.rgb, light_colour.rgb * base.a, highlight);
    rgb = mix(rgb, shadow_colour.rgb * base.a, shadow);
    COLOR = vec4(rgb, base.a);
}
