all: bundle.js

pyreeheader.js: pyreeheader.ts src/BaseGLProgram.js src/RainbowPyree.js	src/LogoPyree.js tsconfig.json
	tsc pyreeheader.ts

src/BaseGLProgram.js: src/BaseGLProgram.ts tsconfig.json
	tsc $<

src/RainbowPyree.js: src/RainbowPyree.ts tsconfig.json
	tsc $<

src/LogoPyree.js: src/LogoPyree.ts tsconfig.json
	tsc $<

bundle.js: pyreeheader.js tsconfig.json
	browserify pyreeheader.js -o bundle.js
