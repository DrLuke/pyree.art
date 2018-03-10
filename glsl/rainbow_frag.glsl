#version 300 es
precision highp float;
uniform float iTime;
uniform vec2 res;
uniform float mode;
out vec4 outCol;

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

vec3 bg3(vec2 uv, vec2 fragCoord)
{
    float p = discretize(uv.x + iTime * 0.13, 100.) * 3.1415 * 2. - uv.y * 2.;
    vec3 c = hsv2rgb(0.55 - discretize((p/3.1415/2. + 0.05), 10.)/10., 1., .7);
	float m = step(0., sin(p));

    return mix(c, c*0.6, m);
}

vec4 fg3(vec2 uv, vec2 fragCoord)
{
    // Textwidth should take this much of screen
    #define maxw 1.5
    #define maxh 3.

    // Textwidth and height
    #define tw 23.
    #define th 6.

    #define widthscale ceil(res.x/maxw/tw)
    #define heightscale ceil(res.y/maxh/th)
    #define minscale min(widthscale, heightscale)

    vec2 fg = gl_FragCoord.xy  - res/2. + vec2(tw/2., th/2.) * minscale;
    fg /= minscale;


    int line = 5-int(fg.y);
    int row = int(fg.x);
    int pix = pyree[row] & (1 << line) * int(step(0., fg.x));

    float p = discretize(uv.x + iTime * 0.13, 100.) * 3.1415 * 2. - uv.y * 2.;
    vec3 c = hsv2rgb(0.35 - discretize((p/3.1415/2. + 0.05), 10.)/10., 0.6, .9);

    return vec4(c, step(0.5, float(pix)));
}

void main()
{
    vec2 uv = gl_FragCoord.xy*2. / res - vec2(1);

    // Mode 3
    vec4 fg3r = fg3(uv, gl_FragCoord.xy);
    outCol.rgb = mix(bg3(uv, gl_FragCoord.xy), fg3r.rgb, fg3r.a);
    outCol.a = 1.;

    //outCol.rgb = vec3(step(0.5, float(pix)));
}