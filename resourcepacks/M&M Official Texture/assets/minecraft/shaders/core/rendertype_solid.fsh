#version 150

#moj_import <fog.glsl>

uniform sampler2D Sampler0;

uniform vec4 ColorModulator;
uniform float FogStart;
uniform float FogEnd;
uniform vec4 FogColor;

in float vertexDistance;
in vec4 vertexColor;
in vec2 texCoord0;
in vec4 normal;

out vec4 fragColor;

void main() {
    vec4 color = texture(Sampler0, texCoord0) * vertexColor * ColorModulator;
    if (color.a < 0.1) {
        discard;
    }
    
    // Detect Night Vision by checking FogStart
    // When Night Vision is active, FogStart is set to a very high value (effectively disabling fog)
    // Normal fog: FogStart is usually < 100
    // Night Vision: FogStart is > 1000000 (essentially infinite)
    bool hasNightVision = FogStart > 500000.0;
    
    if (hasNightVision) {
        // Apply grayscale effect (D&D Darkvision style)
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray);
    }
    
    fragColor = linear_fog(color, vertexDistance, FogStart, FogEnd, FogColor);
}
