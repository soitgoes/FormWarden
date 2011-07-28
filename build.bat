copy NUL build.tmp
more formwarden.js > build.tmp
echo ; >> build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./formwarden.min.js


more jquery.formwarden.js >> build.tmp
echo ; >> build.tmp
java -jar ./lib/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js ./build.tmp --js_output_file ./jquery.formwarden.min.js
del build.tmp