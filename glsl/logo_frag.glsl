#version 300 es
precision highp float;
uniform float iTime;
uniform vec2 res;
uniform int mode;
out vec4 outCol;

uniform sampler2D logoTex;
uniform vec2 logoRes;



#define time (iTime/1000.)

int pyree[24] = int[](0x1F, 0x05, 0x05, 0x02, 0x00,
                      0x01, 0x02, 0x1C, 0x02, 0x01, 0x0,
                      0x1F, 0x05, 0x05, 0x1A, 0x0,
                      0x1F, 0x15, 0x15, 0x0,
                      0x1F, 0x15, 0x15, 0x0);

float discretize(float a, float s)
{
    return floor(a*s+0.5)/s;
}

vec3 hsv2rgb(float h, float s, float v)
{
    vec3 c = vec3(h,s,v);
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
	rgb = rgb*rgb*(3.0-2.0*rgb);
	return c.z * mix( vec3(1.0), rgb, c.y);
}

float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float modulo(float a, float b)
{
    return (b * floor(a/b));
}

float ramp(float start, float end, float x)
{
    return clamp((x - start) / (end - start), 0., 1.);
}


#define reliefMin 0.3
#define reliefMax 0.6
#define reliefScale 0.5
#define reliefTextNormJiggle 0.001
vec4 genReliefText(vec2 uv)
{
    float dist = texture(logoTex, uv).r;
    float height = ramp(reliefMin, reliefMax, dist)*reliefScale;

    float ddxHeight = -ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(reliefTextNormJiggle,0)).r)*reliefScale
    + ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(-reliefTextNormJiggle,0)).r)*reliefScale;
    float ddyHeight = -ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(0,reliefTextNormJiggle)).r)*reliefScale
    + ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(0,-reliefTextNormJiggle)).r)*reliefScale;

    vec3 norm = vec3(ddxHeight, ddyHeight, sqrt(1. - ddxHeight*ddxHeight - ddyHeight*ddyHeight));

    return vec4(norm, height);
}

vec4 genReliefLine(vec2 uv)
{
    float dist = texture(logoTex, uv).g;
    float height = ramp(reliefMin, reliefMax, dist)*reliefScale;

    float ddxHeight = -ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(reliefTextNormJiggle,0)).g)*reliefScale
    + ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(-reliefTextNormJiggle,0)).g)*reliefScale;
    float ddyHeight = -ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(0,reliefTextNormJiggle)).g)*reliefScale
    + ramp(reliefMin, reliefMax, texture(logoTex, uv+vec2(0,-reliefTextNormJiggle)).g)*reliefScale;

    vec3 norm = vec3(ddxHeight, ddyHeight, sqrt(1. - ddxHeight*ddxHeight - ddyHeight*ddyHeight));

    return vec4(norm, height);
}

/*vec4 genReliefTextLine(vec2 uv)
{
    #define RELIEFMIN(a, x) min(texture(a, x).r, texture(a, x).g)

    float dist = RELIEFMIN(logoTex, uv).g;
    float height = ramp(reliefMin, reliefMax, dist)*reliefScale;

    float ddxHeight = -ramp(reliefMin, reliefMax, RELIEFMIN(logoTex, uv+vec2(reliefTextNormJiggle,0)).g)*reliefScale
    + ramp(reliefMin, reliefMax, RELIEFMIN(logoTex, uv+vec2(-reliefTextNormJiggle,0)).g)*reliefScale;
    float ddyHeight = -ramp(reliefMin, reliefMax, RELIEFMIN(logoTex, uv+vec2(0,reliefTextNormJiggle)).g)*reliefScale
    + ramp(reliefMin, reliefMax, RELIEFMIN(logoTex, uv+vec2(0,-reliefTextNormJiggle)).g)*reliefScale;

    vec3 norm = vec3(ddxHeight, ddyHeight, sqrt(1. - ddxHeight*ddxHeight - ddyHeight*ddyHeight));

    return vec4(norm, height);
}*/


float light1(vec3 norm, vec3 fragCoord, vec3 lightPos)
{
    vec3 lp = normalize(fragCoord - lightPos);
    vec3 reflection = reflect(lp, norm);

    //float dist = length(fragCoord - lightPos);
    float intensity = 1.0 * max(dot(-norm, lp), 0.0);   // Diffuse
    intensity += clamp(0.1 * pow(max(dot(-norm, lp), 0.0), 0.6), 0., 1.);  // Specular

    return intensity;
}

float light2(vec3 norm, vec3 fragCoord, vec3 lightPos)
{
    vec3 lp = normalize(fragCoord - lightPos);
    vec3 reflection = reflect(lp, norm);

    float dist = length(fragCoord - lightPos);
    float intensity = 1.0 * max(dot(-norm, lp), 0.0);   // Diffuse
    intensity += clamp(0.1 * pow(max(dot(-norm, lp), 0.0), 0.6), 0., 1.);  // Specular

    return intensity / (dist);
}

float light3(vec3 norm, vec3 fragCoord, vec3 lightPos)
{
    vec3 lp = normalize(fragCoord - lightPos);
    vec3 reflection = reflect(lp, norm);

    float dist = length(fragCoord - lightPos);
    float intensity = 1.0 * max(dot(-norm, lp), 0.0);   // Diffuse
    intensity += clamp(0.1 * pow(max(dot(-norm, lp), 0.0), 0.6), 0., 1.);  // Specular
    return intensity / (dist*dist);
}

vec3 reliefCoords()
{
    /* Generates the coordinates for the Pyree logo
       Places logo in center of screen area */

    #define reliefMaxWidth 0.8
    #define reliefMaxHeight 0.8

    float widthScale = (reliefMaxWidth * res.x) / logoRes.x;
    float heightScale = (reliefMaxHeight * res.y) / logoRes.y;
    float maxScale = min(widthScale, heightScale);

    vec2 uv = (gl_FragCoord.xy - vec2(0, res.y))*vec2(1,-1)*2. / res - vec2(1);
    uv.x *= (res.x/res.y);
    uv /= maxScale*2.;

    uv = uv*vec2(logoRes.y/logoRes.x,1)  + vec2(0.5);   // Correct for aspect ratio of image and center coordinates
    return vec3(uv, step(0., uv.x) * step(-1., -uv.x) * step(0., uv.y) * step(-1., -uv.y));
}

float easeInCubic(float x)
{
    return x*x*x;
}

float easeOutCubic(float x)
{
    return (x-1.)*(x-1.)*(x-1.) + 1.;
}

vec4 anim1()
{
    float animProg = clamp(time, 0., 1.);

    // Light bottom swooping from left to right
    vec3 lightPos = mix( vec3(-1., 1., 0.0), vec3(1., 0.7, 0.14), easeOutCubic(animProg));
    float intensity = easeOutCubic(animProg) * 2.;

    vec3 coords = reliefCoords();
    vec4 reliefText = genReliefText(coords.xy);
    vec4 reliefLine = genReliefLine(coords.xy);
    reliefLine.a *= 1.-step(easeInCubic(ramp(0.2, 0.6, animProg)), coords.x);

    #define anim1TextCol vec3(1)
    #define anim1LineCol vec3(0.8)
    vec3 col = light1(reliefText.xyz, vec3(coords.xy, 0), lightPos) * anim1TextCol;
    col = mix(col, light1(reliefLine.xyz, vec3(coords.xy, 0), lightPos) * anim1LineCol, step(0.01, reliefLine.a - smoothstep(0., 0.1, reliefText.a)));

    float mask = smoothstep(0., 0.2, clamp(reliefText.a + reliefLine.a, 0., 1.));
    return vec4(col * mask * intensity * coords.z, 1);
}

vec4 anim2()
{
    float animProg = clamp(time * 0.5, 0., 1.);

    vec3 coords = reliefCoords();

    vec4 reliefText = genReliefText(coords.xy);

    vec2 sdf = texture(logoTex, coords.xy).rg;

    vec3 col = vec3(0);
    col = vec3(0.95, 0, 0.8);

    #define anim2MainCol vec3(0.95, 0., 0.6+coords.x*0.2)
    vec3 light1Pos = mix(vec3(1., 1.0, 0.5) , vec3(0.5,0.5,1.2), easeInCubic(ramp(0., 0.5, animProg)));
    col = light3(reliefText.xyz, vec3(coords.xy, 0), light1Pos) * anim2MainCol * 1.4 * easeInCubic(ramp(0., 0.5, animProg));

    #define anim2Highlight1Col vec3(0, 0.5, 0.95)
    vec3 light2Pos = mix(vec3(0.3,0.3,0.2) , vec3(0.1,0.1,0.0), easeInCubic(ramp(0.2, 0.3, animProg)));
    col += light1(reliefText.xyz, vec3(coords.xy, 0), light2Pos) * anim2Highlight1Col * 5. * easeInCubic(ramp(0.2, 0.6, animProg));

    #define anim2Highlight2Col vec3(-0.3, 0.2, 0.0)
    col += light3(reliefText.xyz, vec3(coords.xy, 0), vec3(0.9,0.9,0.0)) * anim2Highlight2Col * 3. * easeInCubic(ramp(0.2, 0.6, animProg));

    float mask = smoothstep(0., 0.2, reliefText.a);
    return vec4(col* mask * coords.z, 1.);
}

void main()
{
    if(mode == 1)
    {
        outCol = anim1();
    }
    if(mode == 2)
    {
        outCol = anim2();
    }
}